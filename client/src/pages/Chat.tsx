import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

type Vault = "normal" | "temporary" | "family" | "friends";

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vault, setVault] = useState<Vault>("normal");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: [`/api/messages/${vault}`],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const model = user?.ageMode === "teen" 
        ? (vault === "temporary" ? "temp_teen" : "normal_teen")
        : (vault === "temporary" ? "temp_adult" : "normal_adult");

      await apiRequest("POST", "/api/messages", {
        vault,
        content,
        model,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${vault}`] });
      setInput("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(input.trim());
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navigation />
      
      {/* Top Bar */}
      <div className="flex h-16 items-center justify-between border-b px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Select value={vault} onValueChange={(v) => setVault(v as Vault)}>
            <SelectTrigger className="w-48" data-testid="select-vault">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal" data-testid="option-vault-normal">
                Normal Vault
              </SelectItem>
              <SelectItem value="temporary" data-testid="option-vault-temporary">
                Temporary Vault
              </SelectItem>
              <SelectItem value="family" disabled data-testid="option-vault-family">
                <div className="flex items-center gap-2">
                  Family Vault
                  <Badge variant="secondary" className="text-xs opacity-50">
                    Coming Soon
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="friends" disabled data-testid="option-vault-friends">
                <div className="flex items-center gap-2">
                  Friends Vault
                  <Badge variant="secondary" className="text-xs opacity-50">
                    Coming Soon
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground" data-testid="text-empty-state">
                No messages yet. Start a conversation!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${message.role}`}
                >
                  <div className={`max-w-2xl ${message.role === "user" ? "ml-auto" : "mr-auto"}`}>
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === "user"
                          ? "rounded-tr-sm bg-primary text-primary-foreground"
                          : "rounded-tl-sm bg-card border"
                      }`}
                    >
                      <p className="text-base leading-relaxed">{message.content}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground px-2">
                      {message.createdAt && formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex justify-start">
                  <div className="max-w-2xl mr-auto">
                    <div className="rounded-2xl rounded-tl-sm bg-card border p-4">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-75" />
                        <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse delay-150" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-background">
        <form onSubmit={handleSend} className="mx-auto max-w-4xl p-4">
          <div className="relative flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-12 md:rounded-full"
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 h-10 w-10 rounded-full"
              disabled={!input.trim() || sendMessageMutation.isPending}
              data-testid="button-send"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
