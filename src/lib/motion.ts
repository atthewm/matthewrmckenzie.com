"use client";

// ============================================================================
// MOTION SYSTEM
// ============================================================================
// Every spring in McKenzie OS lives here (motion.dev, MIT). Three named
// springs, reused everywhere:
//   snappy: buttons, menus, toggles, dock magnification
//   window: open, close, move, minimize, Exposé
//   soft:   wallpaper and ambient effects
// With prefers-reduced-motion, components swap these for a short crossfade
// (FADE). Only transform and opacity (plus clip-path for the Genie) animate.
// Motion only ever enhances: nothing server-rendered starts hidden.
// ============================================================================

import type { Transition } from "motion/react";

export const springs = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.6 },
  window: { type: "spring", stiffness: 340, damping: 30, mass: 0.9 },
  soft: { type: "spring", stiffness: 60, damping: 20, mass: 1.4 },
} as const satisfies Record<string, Transition>;

/** The reduced-motion stand-in for every animation above. */
export const FADE: Transition = { duration: 0.15, ease: "easeOut" };

/** Genie timing (keyframed, not a spring, so the funnel reads clearly). */
export const GENIE_DURATION = 0.5;

// ---------------------------------------------------------------------------
// Launch origins: where a window should zoom out of (icon or dock item).
// Callers record the clicked element's rect right before opening the item.
// ---------------------------------------------------------------------------

export interface OriginRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const origins = new Map<string, OriginRect>();

export function setLaunchOrigin(fsItemId: string, el: Element | null | undefined) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  origins.set(fsItemId, { x: r.left, y: r.top, width: r.width, height: r.height });
}

export function peekLaunchOrigin(fsItemId: string): OriginRect | undefined {
  return origins.get(fsItemId);
}

/** Where the dock shows this item, if it is in the dock. */
export function dockRectFor(fsItemId: string): OriginRect | undefined {
  if (typeof document === "undefined") return undefined;
  const el = document.querySelector(`[data-dock-id="${CSS.escape(fsItemId)}"]`);
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}

/** Fallback minimize target: the middle of the dock. */
export function dockCenterRect(): OriginRect {
  const el = typeof document !== "undefined" ? document.querySelector('[aria-label="Dock"]') : null;
  if (el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - 20, y: r.top, width: 40, height: 40 };
  }
  const w = typeof window !== "undefined" ? window.innerWidth : 1440;
  const h = typeof window !== "undefined" ? window.innerHeight : 900;
  return { x: w / 2 - 20, y: h - 60, width: 40, height: 40 };
}
