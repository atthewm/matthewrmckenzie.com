"use client";

import { useEffect } from "react";
import { useDesktop } from "@/hooks/useDesktopStore";

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================
// Esc         → close focused window
// Cmd/Ctrl+W  → close focused window
// Cmd/Ctrl+M  → minimize focused window
// ============================================================================

export function useKeyboardShortcuts() {
  const { state, closeWindow, minimizeWindow } = useDesktop();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const focusedId = state.focusedWindowId;
      if (!focusedId) return;

      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      // Esc → close focused window
      if (e.key === "Escape") {
        e.preventDefault();
        closeWindow(focusedId);
        return;
      }

      // Cmd/Ctrl + W → close focused window
      if (isMeta && e.key === "w") {
        e.preventDefault();
        closeWindow(focusedId);
        return;
      }

      // Cmd/Ctrl + M → minimize focused window
      if (isMeta && e.key === "m") {
        e.preventDefault();
        minimizeWindow(focusedId);
        return;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.focusedWindowId, closeWindow, minimizeWindow]);
}
