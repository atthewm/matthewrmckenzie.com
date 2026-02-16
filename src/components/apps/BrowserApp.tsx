"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Globe, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import { useBrowserUrl } from "@/lib/browserStore";

// ============================================================================
// BROWSER APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// In-OS web browser window. Attempts to embed external URLs via iframe.
// If the target site blocks embedding (X-Frame-Options / CSP), shows a
// friendly fallback with an "Open in new tab" button.
// ============================================================================

export default function BrowserApp() {
  const { url, title } = useBrowserUrl();
  const [iframeError, setIframeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevUrlRef = useRef(url);

  // Reset error state when URL changes
  useEffect(() => {
    if (url !== prevUrlRef.current) {
      setIframeError(false);
      setLoading(true);
      prevUrlRef.current = url;
    }
  }, [url]);

  // Detect iframe load failures via a timeout heuristic.
  // Many sites block iframes silently (no error event fires), so we check
  // whether the iframe loaded successfully after a reasonable delay.
  useEffect(() => {
    if (!url || iframeError) return;

    const timer = setTimeout(() => {
      // If still loading after 5s, assume blocked
      if (loading) {
        setIframeError(true);
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [url, loading, iframeError]);

  const handleIframeLoad = useCallback(() => {
    setLoading(false);
    // Try to access iframe content to verify it actually loaded.
    // Cross-origin iframes will throw, which is expected for successful loads.
    // If the iframe loaded a blank/error page from the same origin, it failed.
    try {
      const doc = iframeRef.current?.contentDocument;
      // If we can access the document and it's blank, it likely failed
      if (doc && (!doc.body || doc.body.innerHTML === "")) {
        setIframeError(true);
      }
    } catch {
      // Cross-origin = iframe loaded something, which means it worked
      setIframeError(false);
    }
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeError(true);
    setLoading(false);
  }, []);

  const handleRefresh = useCallback(() => {
    setIframeError(false);
    setLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }, [url]);

  const displayTitle = title || extractDomain(url) || "Browser";

  if (!url) {
    return (
      <div className="flex flex-col h-full">
        <BrowserToolbar url="" title="Browser" onRefresh={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Globe
              size={40}
              className="text-desktop-text-secondary/30 mx-auto mb-3"
            />
            <p className="text-[13px] text-desktop-text-secondary">
              No page loaded
            </p>
            <p className="text-[11px] text-desktop-text-secondary/60 mt-1">
              Open a link from another app to browse here.
            </p>
          </div>
        </div>
        <BrowserFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BrowserToolbar
        url={url}
        title={displayTitle}
        onRefresh={handleRefresh}
      />

      {/* Content area */}
      <div className="flex-1 relative overflow-hidden">
        {iframeError ? (
          <EmbedFallback url={url} title={displayTitle} />
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-desktop-surface">
                <div className="text-center">
                  <div
                    className="w-5 h-5 border-2 border-desktop-accent/30 border-t-desktop-accent rounded-full animate-spin mx-auto mb-2"
                  />
                  <p className="text-[11px] text-desktop-text-secondary">
                    Loading {extractDomain(url)}...
                  </p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={url}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={displayTitle}
            />
          </>
        )}
      </div>

      <BrowserFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar with address bar
// ---------------------------------------------------------------------------

function BrowserToolbar({
  url,
  title,
  onRefresh,
}: {
  url: string;
  title: string;
  onRefresh: () => void;
}) {
  return (
    <div
      className="shrink-0 flex flex-col border-b"
      style={{
        borderColor: "var(--desktop-border)",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      {/* Title row */}
      <div className="h-[28px] flex items-center justify-between px-3 text-[10px]">
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider truncate">
          {title}
        </span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded
                     text-desktop-text-secondary hover:bg-desktop-accent/10 transition-colors"
          title="Reload page"
        >
          <RefreshCw size={10} />
        </button>
      </div>

      {/* Address bar */}
      {url && (
        <div className="h-[26px] flex items-center gap-2 px-3 pb-1.5">
          <Globe size={11} className="text-desktop-text-secondary shrink-0" />
          <div
            className="flex-1 h-[20px] flex items-center px-2 rounded text-[11px] text-desktop-text-secondary truncate"
            style={{
              background: "var(--desktop-surface)",
              border: "1px solid var(--desktop-border)",
            }}
          >
            {url}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Embed fallback (shown when iframe is blocked)
// ---------------------------------------------------------------------------

function EmbedFallback({ url, title }: { url: string; title: string }) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-[320px]">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "rgba(0,0,0,0.04)",
            border: "1px solid var(--desktop-border)",
          }}
        >
          <AlertTriangle
            size={24}
            className="text-desktop-text-secondary"
          />
        </div>
        <p className="text-[13px] font-medium text-desktop-text mb-1">
          {title} cannot be embedded here
        </p>
        <p className="text-[11px] text-desktop-text-secondary mb-4 leading-relaxed">
          This site does not allow embedding in other pages. You can open it
          directly in a new browser tab instead.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-medium
                     bg-desktop-accent text-white hover:opacity-90 transition-opacity"
        >
          <ExternalLink size={12} />
          Open in new tab
        </a>
        <p className="text-[10px] text-desktop-text-secondary/60 mt-3">
          {url}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function BrowserFooter() {
  return (
    <div
      className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
      style={{
        borderColor: "var(--desktop-border)",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      Browser
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}
