# backend.py
# FastAPI LLaMA backend for RelateAI
# Supports model keys: normal_teen, temp_teen, normal_adult, temp_adult
# Usage: POST /generate  JSON { "message": "...", "model": "normal_teen" }
# Or:    POST /generate  JSON { "message":"...", "age": 17, "vault": "temp" }

import os
import asyncio
from typing import Optional, Dict
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

# Transformers imports (adjust based on your transformers/accelerate/quant setup)
from transformers import LlamaForCausalLM, LlamaTokenizerFast
import torch

app = FastAPI(title="RelateAI LLaMA Backend")

# Allow CORS from your frontend / server (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration: where your model directories live
# Example: ./models/normal_teen, ./models/temp_teen, ...
MODEL_DIR_BASE = os.environ.get("MODEL_DIR_BASE", "./models")

MODEL_PATHS = {
    "normal_teen": os.path.join(MODEL_DIR_BASE, "relate-normal-teen"),
    "temp_teen":   os.path.join(MODEL_DIR_BASE, "relate-temp-teen"),
    "normal_adult":os.path.join(MODEL_DIR_BASE, "relate-normal-adult"),
    "temp_adult":  os.path.join(MODEL_DIR_BASE, "relate-temp-adult"),
}

# Lazy-loaded models & tokenizers
_models: Dict[str, LlamaForCausalLM] = {}
_tokenizers: Dict[str, LlamaTokenizerFast] = {}
_model_devices: Dict[str,str] = {}

# Generation defaults (tweak as needed)
DEFAULT_MAX_NEW_TOKENS = int(os.environ.get("MAX_NEW_TOKENS", "256"))
DEFAULT_TEMPERATURE = float(os.environ.get("TEMPERATURE", "0.8"))
DEFAULT_TOP_P = float(os.environ.get("TOP_P", "0.95"))

class GenRequest(BaseModel):
    message: str
    model: Optional[str] = None    # prefer explicit model if provided
    age: Optional[int] = None
    vault: Optional[str] = None   # "normal" or "temp" etc.
    max_new_tokens: Optional[int] = None

def select_model_by_age_and_vault(age: Optional[int], vault: Optional[str]) -> str:
    # if age is None or vault None, default to adult normal
    try:
        is_adult = (age is not None and int(age) >= 18)
    except Exception:
        is_adult = True
    is_temp = (vault is not None and vault.lower().startswith("temp"))
    if is_adult:
        return "temp_adult" if is_temp else "normal_adult"
    else:
        return "temp_teen" if is_temp else "normal_teen"

def ensure_model_exists(model_key: str):
    if model_key not in MODEL_PATHS:
        raise RuntimeError(f"Unknown model key: {model_key}")
    path = MODEL_PATHS[model_key]
    if not os.path.exists(path):
        raise RuntimeError(f"Model path not found: {path}")

def load_model(model_key: str):
    """Lazy load model & tokenizer into memory. Use device_map='auto' for multi-GPU/CUDA"""
    if model_key in _models:
        return
    ensure_model_exists(model_key)
    path = MODEL_PATHS[model_key]
    print(f"[backend] Loading model {model_key} from {path} ...")
    # tokenizer
    tok = LlamaTokenizerFast.from_pretrained(path, add_eos_token=True)
    # model: adjust dtype and device_map depending on your environment (cuda available?)
    # using float16 and device_map="auto" if CUDA available.
    if torch.cuda.is_available():
        model = LlamaForCausalLM.from_pretrained(path, device_map="auto", torch_dtype=torch.float16)
    else:
        model = LlamaForCausalLM.from_pretrained(path, device_map={"": "cpu"})
    model.eval()
    _models[model_key] = model
    _tokenizers[model_key] = tok
    # record device (first param)
    _model_devices[model_key] = str(next(model.parameters()).device)
    print(f"[backend] Loaded {model_key} on {_model_devices[model_key]}")

def generate_with_model(model_key: str, prompt: str, max_new_tokens:int=DEFAULT_MAX_NEW_TOKENS):
    """Synchronous generate wrapper"""
    model = _models[model_key]
    tokenizer = _tokenizers[model_key]
    device = next(model.parameters()).device
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            temperature=DEFAULT_TEMPERATURE,
            top_p=DEFAULT_TOP_P,
            pad_token_id=tokenizer.eos_token_id
        )
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # If model echoes prompt, strip it
    if text.startswith(prompt):
        text = text[len(prompt):].strip()
    return text

@app.post("/generate")
async def generate(req: GenRequest):
    # decide model key
    if req.model:
        model_key = req.model
    else:
        model_key = select_model_by_age_and_vault(req.age, req.vault)
    try:
        ensure_model_exists(model_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Load model (may take time) — ensure this runs in a thread pool if needed
    loop = asyncio.get_event_loop()
    if model_key not in _models:
        # load model synchronously (blocking). On production you may want to pre-load
        await loop.run_in_executor(None, load_model, model_key)

    # optional prompt engineering: you may want to prepend a system message for teen/adult
    system_prompt = ""
    if model_key.endswith("teen"):
        system_prompt = ("You are a helpful, supportive assistant for teens. "
                         "Avoid sexual content, encourage productivity and safe behaviour. ")
    else:
        system_prompt = ("You are a helpful adult assistant giving thoughtful, respectful guidance. ")

    full_prompt = system_prompt + "\nUser: " + req.message + "\nAssistant: "

    max_tokens = req.max_new_tokens or DEFAULT_MAX_NEW_TOKENS

    # run generation in thread executor to avoid blocking event loop too long
    reply = await loop.run_in_executor(None, generate_with_model, model_key, full_prompt, max_tokens)

    return {"reply": reply, "model_used": model_key}

@app.get("/health")
async def health():
    loaded = list(_models.keys())
    return {"status":"ok", "loaded_models": loaded}

# Start via: uvicorn backend:app --host 0.0.0.0 --port 5000