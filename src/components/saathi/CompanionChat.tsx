"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Bot, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AI_DISCLAIMER, CRISIS_RESPONSE_TEMPLATE } from "@/lib/safety/crisis";
import { createClient } from "@/lib/supabase/client";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { useSpeechOutput } from "@/hooks/useSpeechOutput";
import { useCrisisPrecheck } from "@/hooks/useCrisisPrecheck";
import type { LanguagePref } from "@/lib/types";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_GREETING: Message = {
  role: "assistant",
  content:
    "Hey. I'm Saathi — your AI companion, not a therapist. I'm here to listen. What's on your mind?",
};

function dispatchCrisisEvent() {
  window.dispatchEvent(new CustomEvent("saathi:crisis-detected"));
}

export function CompanionChat() {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_GREETING]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [languagePref, setLanguagePref] = useState<LanguagePref>("hinglish");
  const [autoRead, setAutoRead] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputId = "companion-chat-input";
  const baseInputRef = useRef("");

  const { speak, preferences, isSupported: ttsSupported } = useSpeechOutput({
    languagePref,
  });

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setInput((prev) => (prev ? `${prev} ${text}` : text).trim());
      baseInputRef.current = "";
    } else {
      setInput(baseInputRef.current ? `${baseInputRef.current} ${text}` : text);
    }
  }, []);

  const speechInput = useSpeechInput({
    languagePref,
    onTranscript: handleTranscript,
  });

  const { checkText } = useCrisisPrecheck({
    onCrisisDetected: dispatchCrisisEvent,
  });

  useEffect(() => {
    setAutoRead(preferences.autoRead);
  }, [preferences.autoRead]);

  useEffect(() => {
    async function loadLatestSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setHistoryLoaded(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("language_pref")
          .eq("id", user.id)
          .single();
        if (profile?.language_pref) {
          setLanguagePref(profile.language_pref as LanguagePref);
        }

        const { data: session } = await supabase
          .from("chat_sessions")
          .select("id, title")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!session) {
          setHistoryLoaded(true);
          return;
        }

        const { data: dbMessages } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("session_id", session.id)
          .order("created_at", { ascending: true });

        if (dbMessages?.length) {
          setSessionId(session.id);
          setMessages(
            dbMessages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
      } catch {
        // Keep default greeting on error
      } finally {
        setHistoryLoaded(true);
      }
    }

    loadLatestSession();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;

    speechInput.stopListening();

    const userMessage: Message = { role: "user", content: input.trim() };
    const apiMessages = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    baseInputRef.current = "";
    setLoading(true);
    setStatusMessage("Saathi is thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, sessionId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Chat failed");
      }

      const contentType = res.headers.get("content-type") ?? "";
      let finalText = "";

      if (contentType.includes("text/plain")) {
        finalText = await res.text();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: finalText };
          return copy;
        });
        setStatusMessage("Saathi responded");
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
        finalText = accumulated;
        setStatusMessage("Saathi responded");
      }

      if (
        finalText &&
        finalText !== CRISIS_RESPONSE_TEMPLATE &&
        autoRead &&
        preferences.ttsEnabled
      ) {
        speak(finalText);
      }

      if (!sessionId) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: session } = await supabase
            .from("chat_sessions")
            .select("id")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (session) setSessionId(session.id);
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
      setStatusMessage("Could not connect to Saathi");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    baseInputRef.current = value;
    checkText(value);
  }

  function handleMicClick() {
    if (!speechInput.isSupported) return;
    if (!speechInput.isListening) {
      baseInputRef.current = input;
    }
    speechInput.toggleListening();
  }

  if (!historyLoaded) {
    return (
      <div
        className="flex h-[calc(100vh-180px)] items-center justify-center"
        role="status"
        aria-label="Loading chat history"
      >
        <Loader2 className="h-6 w-6 animate-spin text-saathi-muted" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">
      <div className="mb-2 flex items-center gap-2 rounded-2xl border border-saathi-sage/30 bg-saathi-sage-light px-3 py-2">
        <Bot className="h-4 w-4 text-saathi-sage" aria-hidden="true" />
        <p className="text-xs text-saathi-muted">{AI_DISCLAIMER}</p>
      </div>

      {!speechInput.isSupported && (
        <p className="mb-2 text-xs text-saathi-muted" role="status">
          Voice input works best in Chrome or Edge. You can still type.
        </p>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto pb-4" role="log" aria-label="Chat messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex max-w-[85%] items-end gap-1">
              {msg.role === "assistant" && msg.content && ttsSupported && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  aria-label="Listen to response"
                  onClick={() => speak(msg.content)}
                  disabled={msg.content === CRISIS_RESPONSE_TEMPLATE}
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              <div
                role="article"
                aria-label={msg.role === "user" ? "You said" : "Saathi said"}
                className={`rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-saathi-sage text-white"
                    : "border-2 border-saathi-border bg-saathi-lavender/40 text-saathi-ink shadow-sm"
                }`}
              >
                {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      {speechInput.errorMessage && (
        <p className="text-xs text-saathi-destructive" role="alert">
          {speechInput.errorMessage}
        </p>
      )}

      <div className="mt-auto flex gap-2 border-t border-saathi-border pt-4">
        <label htmlFor={inputId} className="sr-only">
          Message to Saathi
        </label>
        <Textarea
          id={inputId}
          placeholder="Type here — English, Hindi, Hinglish..."
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") speechInput.stopListening();
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="min-h-[48px] max-h-24 resize-none"
          rows={1}
        />
        {speechInput.isSupported && (
          <Button
            type="button"
            size="icon"
            variant={speechInput.isListening ? "default" : "outline"}
            onClick={handleMicClick}
            aria-label={speechInput.isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={speechInput.isListening}
          >
            {speechInput.isListening ? (
              <MicOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
