"use client";

// ============================================================================
// DUO DETECTION (iPhone Duo and other foldables)
// ============================================================================
// Feature detection only, never user agent sniffing:
//   laptop pose  @media (vertical-viewport-segments: 2) with the device folded
//   book pose    @media (horizontal-viewport-segments: 2)
// Segment rects come from window.viewport.segments and are re-read on resize
// and on posture changes. Device Posture is read from the CSS media query
// (device-posture: folded) and navigator.devicePosture when present; where
// the posture API is missing, two segments are taken as folded.
//
// Fallback: View > Duo Layout or ?duo=1 forces the laptop split at the
// vertical midpoint with a 24 px gap, on any device in landscape. The
// choice is remembered in localStorage.
// ============================================================================

import { useEffect, useState } from "react";

export const DUO_PREF_KEY = "mmck-duo";
export const DUO_GAP = 24;
const DUO_EVENT = "mmck-duo-change";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type DuoState =
  | { mode: "off"; forced: boolean }
  | { mode: "laptop"; top: Rect; bottom: Rect; forced: boolean }
  | { mode: "book"; left: Rect; right: Rect; forced: boolean };

interface ViewportWithSegments {
  segments?: DOMRectReadOnly[] | null;
}
interface NavigatorWithPosture {
  devicePosture?: { type: "continuous" | "folded"; addEventListener?: (t: string, cb: () => void) => void; removeEventListener?: (t: string, cb: () => void) => void };
}

function mq(q: string): boolean {
  try {
    return window.matchMedia(q).matches;
  } catch {
    return false;
  }
}

function toRect(r: DOMRectReadOnly): Rect {
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}

export function readDuoPreference(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get("duo") === "1") return true;
    return localStorage.getItem(DUO_PREF_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDuoPreference(on: boolean) {
  try {
    if (on) localStorage.setItem(DUO_PREF_KEY, "1");
    else localStorage.removeItem(DUO_PREF_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page view.
  }
  window.dispatchEvent(new CustomEvent(DUO_EVENT));
}

function postureIsFolded(): boolean {
  const posture = (navigator as NavigatorWithPosture).devicePosture;
  if (mq("(device-posture: folded)")) return true;
  if (posture) return posture.type === "folded";
  // No posture API: trust the segments.
  return true;
}

export function computeDuo(): DuoState {
  const vp = (window as unknown as { viewport?: ViewportWithSegments }).viewport;
  const segs = vp?.segments ?? null;
  const vertical = mq("(vertical-viewport-segments: 2)");
  const horizontal = mq("(horizontal-viewport-segments: 2)");
  const forcedPref = readDuoPreference();

  if (segs && segs.length === 2 && postureIsFolded()) {
    if (vertical) return { mode: "laptop", top: toRect(segs[0]), bottom: toRect(segs[1]), forced: false };
    if (horizontal) return { mode: "book", left: toRect(segs[0]), right: toRect(segs[1]), forced: false };
  }

  if (forcedPref && window.innerWidth > window.innerHeight) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const half = Math.floor((h - DUO_GAP) / 2);
    return {
      mode: "laptop",
      top: { x: 0, y: 0, width: w, height: half },
      bottom: { x: 0, y: half + DUO_GAP, width: w, height: h - half - DUO_GAP },
      forced: true,
    };
  }
  return { mode: "off", forced: forcedPref };
}

export function useDuo(): DuoState {
  const [state, setState] = useState<DuoState>(() =>
    typeof window === "undefined" ? { mode: "off", forced: false } : computeDuo(),
  );

  useEffect(() => {
    const update = () => setState(computeDuo());
    update();
    const queries = [
      "(vertical-viewport-segments: 2)",
      "(horizontal-viewport-segments: 2)",
      "(device-posture: folded)",
      "(orientation: landscape)",
    ].map((q) => {
      try {
        return window.matchMedia(q);
      } catch {
        return null;
      }
    });
    queries.forEach((m) => m?.addEventListener("change", update));
    const posture = (navigator as NavigatorWithPosture).devicePosture;
    posture?.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    window.addEventListener(DUO_EVENT, update);
    return () => {
      queries.forEach((m) => m?.removeEventListener("change", update));
      posture?.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener(DUO_EVENT, update);
    };
  }, []);

  return state;
}
