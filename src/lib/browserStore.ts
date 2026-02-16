// ============================================================================
// BROWSER URL STORE
// ============================================================================
// Lightweight external store for cross-app communication. When an app wants
// to open a URL in the in-OS Browser window, it calls setBrowserUrl() and
// then opens/focuses the Browser window via openItem(). The BrowserApp
// subscribes via useSyncExternalStore to pick up URL changes.
// ============================================================================

import { useSyncExternalStore } from "react";
import { findFSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";

// ---------------------------------------------------------------------------
// Store state
// ---------------------------------------------------------------------------

interface BrowserState {
  url: string;
  title: string;
}

let state: BrowserState = { url: "", title: "" };
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function setBrowserUrl(url: string, title?: string) {
  state = { url, title: title || "" };
  emitChange();
}

export function getBrowserState(): BrowserState {
  return state;
}

export function subscribeBrowser(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export function useBrowserUrl(): BrowserState {
  return useSyncExternalStore(subscribeBrowser, getBrowserState, getBrowserState);
}

// ---------------------------------------------------------------------------
// Helper hook: open a URL in the in-OS Browser window
// ---------------------------------------------------------------------------

export function useOpenInBrowser() {
  const { openItem } = useDesktop();

  return (url: string, title?: string) => {
    setBrowserUrl(url, title);
    const browserItem = findFSItem("browser");
    if (browserItem) {
      openItem(browserItem);
    }
  };
}
