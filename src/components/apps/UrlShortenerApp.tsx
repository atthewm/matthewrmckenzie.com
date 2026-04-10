"use client";

import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, Link2, Copy, Check, Lock } from "lucide-react";

// ============================================================================
// URL SHORTENER APP, mckm.at Link Creator
// ============================================================================
// Posts to the mckm.at admin quick-shorten endpoint which validates an
// admin password from the request body. Password is prompted once per
// ryOS session and kept in React state only. Never touches localStorage
// or sessionStorage.
// ============================================================================

const MCKM_BASE = "https://mckm.at";
const QUICK_SHORTEN_URL = `${MCKM_BASE}/api/admin/quick-shorten`;

type Phase = "idle" | "submitting" | "compressing" | "done";

interface ShortenResponse {
  slug: string;
  shortUrl: string;
  destination: string;
  label: string | null;
}

export default function UrlShortenerApp() {
  const [password, setPassword] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayedUrl, setDisplayedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const submitInFlightRef = useRef(false);

  // Typing and compressing animation driver
  useEffect(() => {
    if (phase !== "compressing") return;
    if (displayedUrl.length < url.length) {
      const t = setTimeout(() => {
        setDisplayedUrl(url.slice(0, displayedUrl.length + 1));
      }, 12);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("done"), 420);
    return () => clearTimeout(t);
  }, [phase, displayedUrl, url]);

  async function handleSubmit() {
    if (submitInFlightRef.current) return;
    setError("");

    if (!url.trim()) {
      setError("Enter a URL first.");
      return;
    }

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setError("URL must be http or https.");
        return;
      }
    } catch {
      setError("That does not look like a valid URL.");
      return;
    }

    if (!password) {
      setError("Admin password is required.");
      return;
    }

    submitInFlightRef.current = true;
    setPhase("submitting");
    setDisplayedUrl("");

    try {
      const res = await fetch(QUICK_SHORTEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          destination: url,
          slug: slug || undefined,
          label: label || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setPassword(null);
          setError("Password rejected. Re enter to try again.");
        } else {
          setError(data.error || `Request failed with ${res.status}`);
        }
        setPhase("idle");
        return;
      }

      setResult(data as ShortenResponse);
      setPhase("compressing");
    } catch (err) {
      setError((err as Error).message || "Network error");
      setPhase("idle");
    } finally {
      submitInFlightRef.current = false;
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleReset() {
    setUrl("");
    setSlug("");
    setLabel("");
    setResult(null);
    setDisplayedUrl("");
    setError("");
    setPhase("idle");
  }

  function handleLockSession() {
    setPassword(null);
    handleReset();
  }

  // Password gate, prompted once per session, in memory only
  if (!password) {
    return (
      <div className="flex flex-col h-full">
        <div
          className="shrink-0 h-[28px] flex items-center px-3 border-b text-[10px]"
          style={{
            borderColor: "var(--desktop-border)",
            background: "var(--desktop-surface-raised)",
          }}
        >
          <Link2 size={12} className="text-desktop-text-secondary mr-1.5" />
          <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
            Link Shortener
          </span>
          <span className="ml-auto text-desktop-text-secondary/50">mckm.at</span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-[280px] text-center">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{
                background: "var(--desktop-surface-raised)",
                border: "1px solid var(--desktop-border)",
              }}
            >
              <Lock size={18} className="text-desktop-text-secondary" />
            </div>
            <h2 className="text-[13px] font-semibold mb-1" style={{ color: "var(--desktop-text)" }}>
              Admin password
            </h2>
            <p className="text-[11px] text-desktop-text-secondary mb-4">
              Kept in memory for this ryOS session only. Never stored.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (passwordInput.trim()) {
                  setPassword(passwordInput);
                  setPasswordInput("");
                }
              }}
              className="space-y-2"
            >
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="password"
                className="w-full px-3 py-2 text-[12px] rounded-md border outline-none focus:ring-1 focus:ring-desktop-accent/30"
                style={{
                  borderColor: "var(--desktop-border)",
                  background: "var(--desktop-surface)",
                  color: "var(--desktop-text)",
                }}
                autoFocus
              />
              <button
                type="submit"
                className="w-full text-[12px] font-semibold py-2 px-4 rounded-md text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--desktop-accent)" }}
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "var(--desktop-surface-raised)",
        }}
      >
        <Link2 size={12} className="text-desktop-text-secondary mr-1.5" />
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Link Shortener
        </span>
        <button
          onClick={handleLockSession}
          className="ml-auto flex items-center gap-1 text-desktop-text-secondary/70 hover:text-desktop-text transition-colors"
          title="Forget password for this session"
        >
          <Lock size={10} />
          lock
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="max-w-[400px] mx-auto">
          <div className="mb-4">
            <h2 className="text-[14px] font-semibold mb-0.5" style={{ color: "var(--desktop-text)" }}>
              Shorten a URL
            </h2>
            <p className="text-[11px] text-desktop-text-secondary">
              Creates a live link at mckm.at
            </p>
          </div>

          {phase === "compressing" && (
            <div
              className="px-4 py-6 rounded-lg border text-center"
              style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
            >
              <div className="text-[10px] text-desktop-text-secondary uppercase tracking-wider mb-2">
                Compressing
              </div>
              <div
                className="font-mono text-[11px] text-desktop-text-secondary overflow-hidden"
                style={{
                  letterSpacing: "0.01em",
                  maxHeight: "3em",
                  transition: "all 0.4s ease",
                }}
              >
                {displayedUrl}
                <span className="inline-block w-[2px] h-[10px] bg-desktop-accent ml-[1px] animate-pulse" />
              </div>
              <div
                className="mt-3 text-[16px] font-bold transition-all duration-500"
                style={{
                  color: "var(--desktop-accent)",
                  transform: displayedUrl.length >= url.length ? "scale(1.1)" : "scale(0.6)",
                  opacity: displayedUrl.length >= url.length ? 1 : 0.3,
                }}
              >
                {result?.shortUrl || "..."}
              </div>
            </div>
          )}

          {phase === "done" && result && (
            <div className="space-y-3">
              <div
                className="flex items-center gap-2 px-3.5 py-3 rounded-lg border"
                style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
              >
                <Link2 size={14} className="text-desktop-accent shrink-0" />
                <span className="text-[13px] font-medium text-desktop-text flex-1 truncate">
                  {result.shortUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-1 rounded hover:bg-desktop-accent/10 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-desktop-text-secondary" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-desktop-text-secondary text-center truncate">
                redirects to <span className="text-desktop-text-secondary/70">{result.destination}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 text-[12px] font-medium py-2 px-3 rounded-md border hover:bg-desktop-accent/5 transition-colors"
                  style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text)" }}
                >
                  Create another
                </button>
                <a
                  href={`${MCKM_BASE}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium py-2 px-3 rounded-md border hover:bg-desktop-accent/5 transition-colors"
                  style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text-secondary)" }}
                >
                  <ExternalLink size={11} />
                  Admin
                </a>
              </div>
            </div>
          )}

          {(phase === "idle" || phase === "submitting") && (
            <div className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-desktop-text-secondary uppercase tracking-wider mb-1">
                  Destination URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/long-url"
                  className="w-full px-3 py-2 text-[12px] rounded-md border outline-none focus:ring-1 focus:ring-desktop-accent/30"
                  style={{
                    borderColor: "var(--desktop-border)",
                    background: "var(--desktop-surface)",
                    color: "var(--desktop-text)",
                  }}
                  disabled={phase === "submitting"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-desktop-text-secondary uppercase tracking-wider mb-1">
                    Slug (optional)
                  </label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto"
                    className="w-full px-3 py-2 text-[12px] rounded-md border outline-none focus:ring-1 focus:ring-desktop-accent/30"
                    style={{
                      borderColor: "var(--desktop-border)",
                      background: "var(--desktop-surface)",
                      color: "var(--desktop-text)",
                    }}
                    disabled={phase === "submitting"}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-desktop-text-secondary uppercase tracking-wider mb-1">
                    Label
                  </label>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Display name"
                    className="w-full px-3 py-2 text-[12px] rounded-md border outline-none focus:ring-1 focus:ring-desktop-accent/30"
                    style={{
                      borderColor: "var(--desktop-border)",
                      background: "var(--desktop-surface)",
                      color: "var(--desktop-text)",
                    }}
                    disabled={phase === "submitting"}
                  />
                </div>
              </div>

              {(url || slug) && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px]"
                  style={{ background: "var(--desktop-surface-raised)", color: "var(--desktop-text-secondary)" }}
                >
                  <Link2 size={12} />
                  <span>mckm.at/{slug || "auto"}</span>
                  <span className="ml-auto truncate max-w-[180px]">
                    {url ? `→ ${url.length > 30 ? url.slice(0, 30) + "..." : url}` : "..."}
                  </span>
                </div>
              )}

              {error && <p className="text-[11px] text-red-500">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={phase === "submitting"}
                  className="flex-1 text-[12px] font-semibold py-2.5 px-4 rounded-md text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: "var(--desktop-accent)" }}
                >
                  {phase === "submitting" ? "Creating..." : "Create Short Link"}
                </button>
              </div>

              <div className="pt-2 text-center">
                <a
                  href={`${MCKM_BASE}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-desktop-text-secondary hover:text-desktop-accent transition-colors"
                >
                  <ExternalLink size={10} />
                  Open full admin dashboard
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
      >
        <span>mckm.at Link Shortener</span>
        <a
          href={MCKM_BASE}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hover:text-desktop-accent transition-colors"
        >
          mckm.at →
        </a>
      </div>
    </div>
  );
}
