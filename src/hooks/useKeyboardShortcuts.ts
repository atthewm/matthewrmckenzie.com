"use client";

import { useEffect } from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { findFSItem } from "@/data/fs";

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================
// Esc           → close focused window
// Cmd/Ctrl+W    → close focused window
// Cmd/Ctrl+M    → minimize focused window
// Cmd/Ctrl+,    → open Settings
// Cmd/Ctrl+N    → open About (like Finder > About)
// Cmd/Ctrl+H    → close all windows
// ============================================================================

export function useKeyboardShortcuts() {
  const { state, dispatch, closeWindow, minimizeWindow } = useDesktop();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;
      const focusedId = state.focusedWindowId;

      // -- Global shortcuts (don't need a focused window) --

      // Cmd/Ctrl + , → open Settings
      if (isMeta && e.key === ",") {
        e.preventDefault();
        const settingsItem = findFSItem("settings");
        if (settingsItem) {
          dispatch({ type: "OPEN_WINDOW", payload: { fsItem: settingsItem } });
        }
        return;
      }

      // Cmd/Ctrl + N → open About
      if (isMeta && e.key === "n") {
        e.preventDefault();
        const aboutItem = findFSItem("about");
        if (aboutItem) {
          dispatch({ type: "OPEN_WINDOW", payload: { fsItem: aboutItem } });
        }
        return;
      }

      // Cmd/Ctrl + H → close all windows
      if (isMeta && e.key === "h") {
        e.preventDefault();
        dispatch({ type: "CLOSE_ALL_WINDOWS" });
        return;
      }

      // -- Window-specific shortcuts (need focused window) --
      if (!focusedId) return;

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
  }, [state.focusedWindowId, dispatch, closeWindow, minimizeWindow]);
}
