"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WindowManager from "./WindowManager";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import ZenBackground from "./ZenBackground";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSecrets } from "@/lib/useSecrets";
import { findFSItem } from "@/data/fs";

// ============================================================================
// DESKTOP
// ============================================================================
// Main desktop view: wallpaper, menu bar, windows, and bottom dock.
// Icons are now in the Dock; the desktop surface is clean.
// ============================================================================

const MOBILE_WELCOME_KEY = "mmck-mobile-welcomed";
const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];

interface DesktopProps {
  contentMap: Record<string, string>;
}

export default function Desktop({ contentMap }: DesktopProps) {
  useKeyboardShortcuts();
  const { dispatch } = useDesktop();
  const isMobile = useIsMobile();
  const didOpenRef = useRef(false);
  const { revealed, reveal } = useSecrets();
  const [toast, setToast] = useState<string | null>(null);

  // Auto-open window from ?open= query param (e.g. /?open=about)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");
    if (openId) {
      const item = findFSItem(openId);
      if (item) {
        dispatch({ type: "OPEN_WINDOW", payload: { fsItem: item } });
      }
      // Clean URL without reload
      window.history.replaceState({}, "", "/");
    }
  }, [dispatch]);

  // On mobile first load (no ?open param), auto-open the README window
  useEffect(() => {
    if (!isMobile || didOpenRef.current) return;
    if (sessionStorage.getItem(MOBILE_WELCOME_KEY)) return;
    // Skip if we just opened something via ?open=
    const params = new URLSearchParams(window.location.search);
    if (params.get("open")) return;

    didOpenRef.current = true;
    sessionStorage.setItem(MOBILE_WELCOME_KEY, "1");

    const readme = findFSItem("readme");
    if (readme) {
      dispatch({ type: "OPEN_WINDOW", payload: { fsItem: readme } });
    }
  }, [isMobile, dispatch]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const showSecretToast = useCallback(() => {
    if (!revealed) {
      reveal();
      setToast("You found the Secrets folder!");
    }
  }, [revealed, reveal]);

  // Konami code listener
  useEffect(() => {
    const buffer: string[] = [];
    function onKey(e: KeyboardEvent) {
      buffer.push(e.key);
      if (buffer.length > KONAMI.length) buffer.shift();
      if (buffer.length === KONAMI.length && buffer.every((k, i) => k === KONAMI[i])) {
        showSecretToast();
        buffer.length = 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSecretToast]);

  // Option+click 3x easter egg
  const clickTimesRef = useRef<number[]>([]);
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    dispatch({ type: "FOCUS_WINDOW", payload: { id: "" } });

    if (e.altKey) {
      const now = Date.now();
      clickTimesRef.current.push(now);
      // Keep only clicks within last 3 seconds
      clickTimesRef.current = clickTimesRef.current.filter((t) => now - t < 3000);
      if (clickTimesRef.current.length >= 3) {
        showSecretToast();
        clickTimesRef.current = [];
      }
    }
  }, [dispatch, showSecretToast]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Wallpaper background */}
      <ZenBackground />

      {/* Menu bar */}
      <MenuBar />

      {/* Click on empty desktop to unfocus + easter egg */}
      <div
        className="absolute top-[26px] left-0 right-0 bottom-0"
        onClick={handleDesktopClick}
      />

      {/* Windows */}
      <WindowManager contentMap={contentMap} />

      {/* Dock */}
      <Dock />

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-10 left-1/2 -translate-x-1/2 z-[99999]
                     px-4 py-2 rounded-lg shadow-lg text-[12px] font-medium
                     animate-fade-in"
          style={{
            background: "var(--desktop-surface)",
            border: "1px solid var(--desktop-border)",
            color: "var(--desktop-text)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
