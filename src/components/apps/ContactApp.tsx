"use client";

import React, { useState } from "react";
import { Send, Calendar, Mail, Link2 } from "lucide-react";
import { useOpenInBrowser } from "@/lib/browserStore";

// ============================================================================
// CONTACT APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Form + quick action buttons. Posts to /api/contact (Supabase).
// ============================================================================

const CATEGORIES = ["Investor", "Collaboration", "Press", "Speaking", "Other"];

export default function ContactApp() {
  const openInBrowser = useOpenInBrowser();
  const [category, setCategory] = useState("Other");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Connection error");
      setStatus("error");
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("matthew.mckenzie@mac.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Contact
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        {status === "sent" ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: "var(--desktop-accent)", color: "white" }}
            >
              <Send size={20} />
            </div>
            <p className="text-[14px] font-semibold text-desktop-text">Message sent</p>
            <p className="text-[11px] text-desktop-text-secondary mt-1">
              Thanks for reaching out. I will get back to you soon.
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="mt-4 text-[11px] font-medium"
              style={{ color: "var(--desktop-accent)" }}
            >
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Category */}
            <div>
              <label className="text-[10px] text-desktop-text-secondary font-medium uppercase tracking-wider mb-1 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded text-[12px] text-desktop-text
                           bg-desktop-surface border outline-none
                           focus:border-desktop-accent transition-colors"
                style={{ borderColor: "var(--desktop-border)" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              className="px-2.5 py-1.5 rounded text-[12px] text-desktop-text
                         bg-desktop-surface border outline-none
                         focus:border-desktop-accent transition-colors"
              style={{ borderColor: "var(--desktop-border)" }}
            />

            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              maxLength={200}
              className="px-2.5 py-1.5 rounded text-[12px] text-desktop-text
                         bg-desktop-surface border outline-none
                         focus:border-desktop-accent transition-colors"
              style={{ borderColor: "var(--desktop-border)" }}
            />

            {/* Message */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              maxLength={2000}
              rows={4}
              className="px-2.5 py-1.5 rounded text-[12px] text-desktop-text
                         bg-desktop-surface border outline-none resize-none
                         focus:border-desktop-accent transition-colors"
              style={{ borderColor: "var(--desktop-border)" }}
            />

            {errorMsg && (
              <p className="text-[10px] text-red-500">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending" || !name.trim() || !email.trim() || !message.trim()}
              className="w-full py-2 rounded text-[12px] font-medium
                         bg-desktop-accent text-white hover:opacity-90
                         disabled:opacity-50 transition-opacity"
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </div>

      {/* Action bar */}
      <div
        className="shrink-0 border-t px-3 py-2 flex gap-2"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        <button
          onClick={() => openInBrowser("https://cal.com/mattmck/site", "Schedule")}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-medium
                     text-desktop-text hover:bg-desktop-border/50 transition-colors"
          style={{ border: "1px solid var(--desktop-border)" }}
        >
          <Calendar size={11} />
          Schedule
        </button>
        <button
          onClick={handleCopyEmail}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-medium
                     text-desktop-text hover:bg-desktop-border/50 transition-colors"
          style={{ border: "1px solid var(--desktop-border)" }}
        >
          <Mail size={11} />
          {copied ? "Copied!" : "Email"}
        </button>
        <button
          onClick={() => openInBrowser("https://mckm.at/", "Linktree")}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[10px] font-medium
                     text-desktop-text hover:bg-desktop-border/50 transition-colors"
          style={{ border: "1px solid var(--desktop-border)" }}
        >
          <Link2 size={11} />
          Linktree
        </button>
      </div>
    </div>
  );
}
