"use client";

import React, { useState, useEffect, useCallback } from "react";
import DesktopProvider from "./DesktopProvider";
import SettingsProvider from "./SettingsProvider";
import Desktop from "./Desktop";

// ============================================================================
// BOOT SEQUENCE (Retro Mac Startup)
// ============================================================================
// Classic Macintosh-style boot: gray screen -> happy Mac icon -> progress bar
// -> fade into desktop. Runs once per session.
// ============================================================================

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"chime" | "icon" | "progress" | "fade">("chime");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("icon"), 400);
    const t2 = setTimeout(() => setPhase("progress"), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== "progress") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setPhase("fade");
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 4;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "#e8e8e8",
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Happy Mac icon */}
      <div
        style={{
          opacity: phase === "chime" ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="4" width="40" height="48" rx="4" stroke="#333" strokeWidth="2.5" fill="none" />
          <rect x="16" y="8" width="32" height="28" rx="2" fill="#333" />
          <circle cx="26" cy="19" r="2" fill="#e8e8e8" />
          <circle cx="38" cy="19" r="2" fill="#e8e8e8" />
          <path d="M26 27 C28 31, 36 31, 38 27" stroke="#e8e8e8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="24" y="40" width="16" height="3" rx="1" fill="#333" />
          <rect x="8" y="52" width="48" height="4" rx="2" fill="#333" />
          <line x1="20" y1="56" x2="44" y2="56" stroke="#333" strokeWidth="2" />
        </svg>
      </div>

      <p
        style={{
          marginTop: "16px",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          color: "#666",
          opacity: phase === "chime" ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        McKenzie OS
      </p>

      {/* Progress bar */}
      <div
        style={{
          marginTop: "24px",
          opacity: phase === "progress" || phase === "fade" ? 1 : 0,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "10px",
            borderRadius: "2px",
            border: "1px solid #999",
            background: "#d4d4d4",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "linear-gradient(180deg, #555 0%, #333 100%)",
              borderRadius: "1px",
              transition: "width 0.075s linear",
            }}
          />
        </div>
        <p style={{ fontSize: "9px", textAlign: "center", marginTop: "6px", color: "#888" }}>
          {progress < 30 ? "Loading system..." : progress < 70 ? "Preparing desktop..." : "Welcome"}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// DESKTOP SHELL
// ============================================================================
// Top-level client component that decides between desktop and mobile views.
// Shows boot sequence on first load, then fades into the desktop.
// ============================================================================

interface DesktopShellProps {
  contentMap: Record<string, string>;
}

const BOOT_SESSION_KEY = "mmck-booted";

export default function DesktopShell({ contentMap }: DesktopShellProps) {
  const [mounted, setMounted] = useState(false);
  const [booting, setBooting] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only show boot sequence once per browser session
    if (!sessionStorage.getItem(BOOT_SESSION_KEY)) {
      setBooting(true);
    }
  }, []);

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
    setBooting(false);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0" style={{ background: "#e8e8e8" }} />
    );
  }

  return (
    <DesktopProvider>
      <SettingsProvider>
        {booting && <BootSequence onComplete={handleBootComplete} />}
        <Desktop contentMap={contentMap} />
      </SettingsProvider>
    </DesktopProvider>
  );
}
