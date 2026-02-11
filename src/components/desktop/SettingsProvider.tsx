"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  SettingsContext,
  defaultSettings,
  loadSettings,
  saveSettings,
  getFontFamilyCSS,
  type SettingsState,
  type SettingsContextValue,
} from "@/hooks/useSettingsStore";

// ============================================================================
// SETTINGS PROVIDER
// ============================================================================
// Wraps the app with settings context. Handles hydration, persistence,
// and applying CSS variables for typography and high contrast.
// ============================================================================

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Hydrate from localStorage
  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      setSettings(saved);
    }
    setHydrated(true);
  }, []);

  // Persist with debounce
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveSettings(settings), 200);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [settings, hydrated]);

  // Apply typography and high contrast CSS variables to <html>
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.style.setProperty("--user-font-family", getFontFamilyCSS(settings.fontFamily));
    root.style.setProperty("--user-font-size", `${settings.fontSize}px`);
    root.style.setProperty("--user-line-height", `${settings.lineHeight}`);

    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
  }, [settings.fontFamily, settings.fontSize, settings.lineHeight, settings.highContrast, hydrated]);

  // Track user interaction (needed for autoplay policy)
  useEffect(() => {
    if (settings.userHasInteracted) return;
    function onInteract() {
      setSettings((prev) => ({ ...prev, userHasInteracted: true }));
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
    }
    window.addEventListener("click", onInteract);
    window.addEventListener("keydown", onInteract);
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [settings.userHasInteracted]);

  const updateSettings = useCallback((partial: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings, userHasInteracted: true });
  }, []);

  const contextValue: SettingsContextValue = {
    settings,
    updateSettings,
    resetSettings,
  };

  if (!hydrated) return null;

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}
