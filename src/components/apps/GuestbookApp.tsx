"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Send, Check, X as XIcon } from "lucide-react";

// ============================================================================
// GUESTBOOK APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Scrollable entry list + compact form. Admin can approve/reject entries.
// ============================================================================

interface Entry {
  id: string;
  name: string;
  message: string;
  created_at: string;
  approved: boolean;
}

export default function GuestbookApp() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
        setIsAdmin(data.isAdmin ?? false);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), message: message.trim(), website }),
      });

      if (res.ok) {
        setStatus("sent");
        setName("");
        setMessage("");
        // Don't reload - entry is unapproved
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

  const handleModerate = async (id: string, approved: boolean) => {
    try {
      await fetch("/api/guestbook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      loadEntries();
    } catch {
      // silent
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-between px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Guestbook
        </span>
        <span className="text-desktop-text-secondary">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-auto">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[11px] text-desktop-text-secondary p-4">
            No entries yet. Be the first to sign the guestbook!
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--desktop-border)" }}>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="px-4 py-3 flex gap-3"
                style={{ opacity: entry.approved ? 1 : 0.6 }}
              >
                {/* Avatar */}
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{
                    background: `hsl(${entry.name.charCodeAt(0) * 7 % 360}, 50%, 50%)`,
                  }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-desktop-text truncate">
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-desktop-text-secondary shrink-0">
                      {formatDate(entry.created_at)}
                    </span>
                    {!entry.approved && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-desktop-text mt-0.5 leading-relaxed">
                    {entry.message}
                  </p>

                  {/* Admin controls */}
                  {isAdmin && !entry.approved && (
                    <div className="flex gap-2 mt-1.5">
                      <button
                        onClick={() => handleModerate(entry.id, true)}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded
                                   bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                      >
                        <Check size={10} /> Approve
                      </button>
                      <button
                        onClick={() => handleModerate(entry.id, false)}
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded
                                   bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <XIcon size={10} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div
        className="shrink-0 border-t px-4 py-3"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        {status === "sent" ? (
          <p className="text-[11px] text-center" style={{ color: "var(--desktop-accent)" }}>
            Thanks for signing! Your entry will appear after review.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Honeypot - hidden from real users */}
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-9999px", opacity: 0 }}
            />

            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                className="flex-1 px-2.5 py-1.5 rounded text-[12px] text-desktop-text
                           bg-desktop-surface border outline-none
                           focus:border-desktop-accent transition-colors"
                style={{ borderColor: "var(--desktop-border)" }}
              />
            </div>
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message..."
                maxLength={500}
                rows={2}
                className="flex-1 px-2.5 py-1.5 rounded text-[12px] text-desktop-text
                           bg-desktop-surface border outline-none resize-none
                           focus:border-desktop-accent transition-colors"
                style={{ borderColor: "var(--desktop-border)" }}
              />
              <button
                type="submit"
                disabled={status === "sending" || !name.trim() || !message.trim()}
                className="self-end px-3 py-1.5 rounded text-[11px] font-medium
                           bg-desktop-accent text-white hover:opacity-90
                           disabled:opacity-50 transition-opacity"
              >
                <Send size={12} />
              </button>
            </div>
            {errorMsg && (
              <p className="text-[10px] text-red-500">{errorMsg}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
