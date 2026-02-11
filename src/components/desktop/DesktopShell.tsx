"use client";

import React, { useState, useEffect } from "react";
import DesktopProvider from "./DesktopProvider";
import SettingsProvider from "./SettingsProvider";
import Desktop from "./Desktop";
import MobileView from "./MobileView";

// ============================================================================
// DESKTOP SHELL
// ============================================================================
// Top-level client component that decides between desktop and mobile views.
// ============================================================================

interface DesktopShellProps {
  contentMap: Record<string, string>;
}

const MOBILE_BREAKPOINT = 768;

export default function DesktopShell({ contentMap }: DesktopShellProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    function check() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!mounted) {
    // SSR / loading state
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
    );
  }

  return (
    <DesktopProvider>
      <SettingsProvider>
        {isMobile ? (
          <MobileView contentMap={contentMap} />
        ) : (
          <Desktop contentMap={contentMap} />
        )}
      </SettingsProvider>
    </DesktopProvider>
  );
}
