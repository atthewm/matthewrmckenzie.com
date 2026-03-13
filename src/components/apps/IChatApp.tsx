"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// ============================================================================
// iCHAT APP — Classic iChat/AIM-Styled AI Chatbot
// ============================================================================
// Visitors can chat with an AI assistant that knows about Matthew and his work.
// Styled like classic iChat with speech bubbles and buddy icons.
// Uses /api/chat endpoint (rate-limited) with Anthropic Claude on the backend.
// ============================================================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SYSTEM_GREETING = "Hey! I'm McKenzie OS Assistant. Ask me anything about Matthew, his work, this site, or just say hi. What's on your mind?";

const MAX_INPUT_LENGTH = 500;

export default function IChatApp() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "assistant",
      content: SYSTEM_GREETING,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
            .filter((m) => m.id !== "greeting")
            .slice(-10) // Keep last 10 messages for context
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 429) {
        setError("Whoa, slow down! Too many messages. Try again in a minute.");
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Try again?");
        return;
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Hmm, I'm not sure what to say to that.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #e8eff5 0%, #d4dfe8 100%)" }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2 border-b"
        style={{
          background: "linear-gradient(180deg, #e0e8f0 0%, #c8d4e0 100%)",
          borderColor: "rgba(0,0,0,0.12)",
        }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #5cb85c 0%, #4cae4c 100%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          AI
        </div>
        <div>
          <div className="text-xs font-semibold" style={{ color: "#333" }}>
            McKenzie OS Assistant
          </div>
          <div className="text-[9px]" style={{ color: loading ? "#f0ad4e" : "#5cb85c" }}>
            {loading ? "Typing..." : "Available"}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[80%] rounded-xl px-3 py-2 text-[12px] leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #4a90d9 0%, #357abd 100%)",
                      color: "white",
                      borderBottomRightRadius: "4px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    }
                  : {
                      background: "white",
                      color: "#333",
                      borderBottomLeftRadius: "4px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-3 py-2 text-[12px]"
              style={{
                background: "white",
                color: "#999",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <span className="text-[11px] text-red-500 bg-red-50 px-3 py-1 rounded-full">
              {error}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        className="shrink-0 flex items-end gap-2 px-3 py-2 border-t"
        style={{
          background: "linear-gradient(180deg, #d4dfe8 0%, #c0cdd8 100%)",
          borderColor: "rgba(0,0,0,0.1)",
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none rounded-lg px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2"
          style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.15)",
            color: "#333",
            maxHeight: "60px",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{
            background: "linear-gradient(135deg, #4a90d9 0%, #357abd 100%)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
