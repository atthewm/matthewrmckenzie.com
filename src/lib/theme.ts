"use client";

// ============================================================================
// THEME
// ============================================================================
// One appearance setting for the whole site: Light (Aqua), Dark (Graphite at
// night) or System. The choice lives in localStorage under THEME_KEY and is
// applied to <html> by THEME_INIT_SCRIPT before first paint, on every route.
// ============================================================================

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

import { THEME_KEY } from "./theme-script";

export { THEME_KEY };
const THEME_EVENT = "mmck-theme-change";

export function readThemeChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
  if (choice === "system") return systemPrefersDark() ? "dark" : "light";
  return choice;
}

function applyResolved(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

export function setThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  applyResolved(resolveTheme(choice));
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: choice }));
}

/** Current choice and resolved appearance, kept in sync across components and tabs. */
export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const sync = () => {
      const c = readThemeChoice();
      setChoice(c);
      const r = resolveTheme(c);
      setResolved(r);
      applyResolved(r);
    };
    sync();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY) sync();
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", onStorage);
    mq.addEventListener("change", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", sync);
    };
  }, []);

  const set = useCallback((c: ThemeChoice) => setThemeChoice(c), []);
  return { choice, resolved, setTheme: set };
}
