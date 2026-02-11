"use client";

// ============================================================================
// SETTINGS STORE
// ============================================================================
// Global settings state with localStorage persistence.
// Manages appearance, sound, and typography preferences.
// ============================================================================

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FontFamily = "system" | "Georgia" | "Times" | "Verdana" | "Trebuchet" | "Courier";

export interface SettingsState {
  // Appearance
  zenThemeId: string;
  zenModeEnabled: boolean;
  backgroundBlur: number;   // 0 to 20
  backgroundDim: number;    // 0 to 80 (percent)
  reduceMotion: boolean;
  iconSize: "small" | "medium" | "large";

  // Sound
  ambientSoundEnabled: boolean;
  ambientVolume: number;    // 0 to 100
  uiSoundsEnabled: boolean;

  // Typography
  fontFamily: FontFamily;
  fontSize: number;         // 14 to 20
  lineHeight: number;       // 1.4 to 1.8
  highContrast: boolean;

  // Internal
  userHasInteracted: boolean;
}

export const defaultSettings: SettingsState = {
  zenThemeId: "default",
  zenModeEnabled: false,
  backgroundBlur: 0,
  backgroundDim: 0,
  reduceMotion: false,
  iconSize: "medium",

  ambientSoundEnabled: false,
  ambientVolume: 50,
  uiSoundsEnabled: false,

  fontFamily: "system",
  fontSize: 14,
  lineHeight: 1.6,
  highContrast: false,

  userHasInteracted: false,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface SettingsContextValue {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const SETTINGS_KEY = "mmck-settings";

export function saveSettings(settings: SettingsState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable
  }
}

export function loadSettings(): SettingsState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge with defaults so new fields are always present
    return { ...defaultSettings, ...parsed };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Font family CSS mapping
// ---------------------------------------------------------------------------

export function getFontFamilyCSS(family: FontFamily): string {
  switch (family) {
    case "system":
      return '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    case "Georgia":
      return "Georgia, 'Times New Roman', serif";
    case "Times":
      return "'Times New Roman', Times, serif";
    case "Verdana":
      return "Verdana, Geneva, sans-serif";
    case "Trebuchet":
      return "'Trebuchet MS', Helvetica, sans-serif";
    case "Courier":
      return "'Courier New', Courier, monospace";
    default:
      return "inherit";
  }
}
