"use client";

import React, { useState } from "react";
import { ExternalLink, Link2, Copy, Check, QrCode } from "lucide-react";

// ============================================================================
// URL SHORTENER APP - mckm.at Link Manager
// ============================================================================
// Quick-create short links via the mckm.at shortener.
// Links to the full admin dashboard for management.
// ============================================================================

const MCKM_BASE = "https://mckm.at";

export default function UrlShortenerApp() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("Other");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setUrl("");
    setSlug("");
    setLabel("");
    setGroup("Other");
    setResult(null);
    setError("");
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
          URL Shortener
        </span>
        <span className="ml-auto text-desktop-text-secondary/50">mckm.at</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="max-w-[400px] mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h2
              className="text-[14px] font-semibold mb-0.5"
              style={{ color: "var(--desktop-text)" }}
            >
              Shorten a URL
            </h2>
            <p className="text-[11px] text-desktop-text-secondary">
              Create short links at mckm.at
            </p>
          </div>

          {result ? (
            /* ── Success state ── */
            <div className="space-y-3">
              <div
                className="flex items-center gap-2 px-3.5 py-3 rounded-lg border"
                style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
              >
                <Link2 size={14} className="text-desktop-accent shrink-0" />
                <span className="text-[13px] font-medium text-desktop-text flex-1 truncate">
                  {result}
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
              <p className="text-[10px] text-desktop-text-secondary text-center">
                Redirects to: <span className="text-desktop-text-secondary/70">{url}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 text-[12px] font-medium py-2 px-3 rounded-md border
                             hover:bg-desktop-accent/5 transition-colors"
                  style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text)" }}
                >
                  Create another
                </button>
                <a
                  href={`${MCKM_BASE}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium py-2 px-3 rounded-md border
                             hover:bg-desktop-accent/5 transition-colors"
                  style={{ borderColor: "var(--desktop-border)", color: "var(--desktop-text-secondary)" }}
                >
                  <ExternalLink size={11} />
                  Admin
                </a>
              </div>
            </div>
          ) : (
            /* ── Create form ── */
            <div className="space-y-2.5">
              {/* URL */}
              <div>
                <label className="block text-[10px] font-semibold text-desktop-text-secondary uppercase tracking-wider mb-1">
                  Destination URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/long-url"
                  className="w-full px-3 py-2 text-[12px] rounded-md border outline-none
                             focus:ring-1 focus:ring-desktop-accent/30"
                  style={{
                    borderColor: "var(--desktop-border)",
                    background: "var(--desktop-surface)",
                    color: "var(--desktop-text)",
                  }}
                />
              </div>

              {/* Slug + Label */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-desktop-text-secondary uppercase tracking-wider mb-1">
                    Slug (optional)
                  </label>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-link"
                    className="w-full px-3 py-2 text-[12px] rounded-md border outline-none
                               focus:ring-1 focus:ring-desktop-accent/30"
                    style={{
                      borderColor: "var(--desktop-border)",
                      background: "var(--desktop-surface)",
                      color: "var(--desktop-text)",
                    }}
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
                    className="w-full px-3 py-2 text-[12px] rounded-md border outline-none
                               focus:ring-1 focus:ring-desktop-accent/30"
                    style={{
                      borderColor: "var(--desktop-border)",
                      background: "var(--desktop-surface)",
                      color: "var(--desktop-text)",
                    }}
                  />
                </div>
              </div>

              {/* Group */}
              <div>
                <label className="block text-[10px] font-semibold text-desktop-text-secondary uppercase tracking-wider mb-1">
                  Group
                </label>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] rounded-md border outline-none
                             focus:ring-1 focus:ring-desktop-accent/30"
                  style={{
                    borderColor: "var(--desktop-border)",
                    background: "var(--desktop-surface)",
                    color: "var(--desktop-text)",
                  }}
                >
                  <option>Work</option>
                  <option>Personal</option>
                  <option>Online</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Preview */}
              {(url || slug) && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-[11px]"
                  style={{ background: "var(--desktop-surface-raised)", color: "var(--desktop-text-secondary)" }}
                >
                  <QrCode size={12} />
                  <span>
                    mckm.at/{slug || "auto-generated"}
                  </span>
                  <span className="ml-auto">→ {url ? (url.length > 30 ? url.slice(0, 30) + "..." : url) : "..."}</span>
                </div>
              )}

              {error && (
                <p className="text-[11px] text-red-500">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    if (!url) {
                      setError("Please enter a URL");
                      return;
                    }
                    // Create a simulated result (in production, this would call the mckm.at API)
                    const finalSlug = slug || url.replace(/https?:\/\//, "").split("/")[0].replace(/\./g, "-").slice(0, 12);
                    setResult(`${MCKM_BASE}/${finalSlug}`);
                    setError("");
                  }}
                  className="flex-1 text-[12px] font-semibold py-2.5 px-4 rounded-md
                             text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "var(--desktop-accent)" }}
                >
                  Create Short Link
                </button>
              </div>

              {/* Open full admin */}
              <div className="pt-2 text-center">
                <a
                  href={`${MCKM_BASE}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-desktop-text-secondary
                             hover:text-desktop-accent transition-colors"
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
        <span>mckm.at URL Shortener</span>
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
