"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AI_DISCLAIMER } from "@/lib/safety/crisis";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function CompanionChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey. I'm Saathi — your AI companion, not a therapist. I'm here to listen. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Chat failed");
      }

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("text/plain")) {
        const text = await res.text();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: text };
          return copy;
        });
      } else {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            accumulated += decoder.decode(value, { stream: true });
            const snapshot = accumulated;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: snapshot };
              return copy;
            });
          }
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            e instanceof Error
              ? `I'm having trouble connecting right now. ${e.message}`
              : "I'm having trouble connecting. Please try again.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      <div className="mb-2 flex items-center gap-2 rounded-2xl bg-saathi-lavender/20 px-3 py-2">
        <Bot className="h-4 w-4 text-saathi-sage" />
        <p className="text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-saathi-sage text-white"
                  : "bg-white text-saathi-ink shadow-sm"
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-sm text-saathi-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saathi is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-auto flex gap-2 border-t border-saathi-sage/10 pt-4">
        <Textarea
          placeholder="Type here — English, Hindi, Hinglish..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[48px] max-h-24 resize-none"
          rows={1}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
