//import fetch from "node-fetch";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { updateProfileSchema, updateSettingsSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = updateProfileSchema.parse(req.body);

      const updatedUser = await storage.updateProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return only settings-related fields
      res.json({
        theme: user.theme,
        ageHandlingEnabled: user.ageHandlingEnabled,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = updateSettingsSchema.parse(req.body);

      const updatedUser = await storage.updateSettings(userId, settingsData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Chat message routes
  app.get('/api/messages/:vault', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vault = req.params.vault;

      const messages = await storage.getMessages(userId, vault);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vault, content, model } = req.body;

      if (!vault || !content || !model) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        userId,
        vault,
        role: "user",
        content,
        model,
      });

      // Generate AI response (Python backend call)
      const backendResponse = await callLlamaBackend(content, model);
      const aiReply = backendResponse.reply;

      // Save assistant message
      const assistantMessage = await storage.createMessage({
        userId,
        vault,
        role: "assistant",
        content: aiReply,
        model,
      });

      res.json({ userMessage, assistantMessage });
    } catch (error: any) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: error.message || "Failed to create message" });
    }
  });

  // Delete temporary vault messages
  app.delete('/api/messages/temporary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteTemporaryMessages(userId);
      res.json({ message: "Temporary messages deleted" });
    } catch (error) {
      console.error("Error deleting messages:", error);
      res.status(500).json({ message: "Failed to delete messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// -------------------
// Python LLaMA backend call
// -------------------
const backendUrl = process.env.LLAMA_BACKEND_URL || "http://127.0.0.1:5000/generate";

async function callLlamaBackend(
  content: string,
  model?: string,
  age?: number,
  vault?: string
) {
  const body: any = { message: content };

  if (model) {
    body.model = model;
  } else {
    if (age !== undefined) body.age = age;
    if (vault) body.vault = vault;
  }

  const resp = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Backend error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  return data; // { reply, model_used }
}

// -------------------
// Mock AI response function for testing/demo
// -------------------
export function mockAIResponse(userMessage: string, model: string) {
  const isTeen = model.includes("teen");
  const isTemp = model.includes("temp");

  const responses = {
    greeting: isTeen
    ? "Hi! I'm here to chat and help you with whatever's on your mind. What would you like to talk about?"
    : "Hello! I'm RelateAI, your conversational companion. How can I assist you today?",
    general: isTeen
    ? "That's interesting! I'd be happy to discuss that with you. Tell me more about what you're thinking."
    : "I understand. Let's explore that topic together. What specific aspects would you like to discuss?",
    temporary: isTemp
    ? "I'm here for a quick chat. Remember, our conversation is temporary and won't be saved."
    : "I'm listening. Feel free to share your thoughts openly.",
  };

  const lowerMessage = userMessage.toLowerCase();
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return responses.greeting;
  }
  if (isTemp) {
    return responses.temporary;
  }

  return responses.general;
}
