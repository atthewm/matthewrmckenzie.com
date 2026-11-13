"use client";

// ============================================================================
// EXPOSÉ STORE
// ============================================================================
// Exposé moves the real windows, not thumbnails: when active, each window
// reads its slot here and springs into a grid, then springs back on exit.
// ============================================================================

import { useSyncExternalStore } from "react";

export interface ExposeSlot {
  dx: number;
  dy: number;
  scale: number;
  order: number;
}

interface ExposeState {
  active: boolean;
  slots: Record<string, ExposeSlot>;
}

let state: ExposeState = { active: false, slots: {} };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setExpose(next: ExposeState) {
  state = next;
  emit();
}

export function getExpose(): ExposeState {
  return state;
}

export function useExpose(): ExposeState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Grid slots that fit every window between the menu bar and the dock. */
export function computeExposeSlots(windows: Box[], viewW: number, viewH: number): Record<string, ExposeSlot> {
  const slots: Record<string, ExposeSlot> = {};
  if (windows.length === 0) return slots;
  const pad = 40;
  const top = 56;
  const bottom = 110;
  const gap = 24;
  const availW = viewW - pad * 2;
  const availH = viewH - top - bottom;
  const cols = Math.ceil(Math.sqrt(windows.length * (availW / availH)));
  const rows = Math.ceil(windows.length / cols);
  const cellW = (availW - gap * (cols - 1)) / cols;
  const cellH = (availH - gap * (rows - 1)) / rows;
  windows.forEach((w, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const scale = Math.min(cellW / w.width, cellH / w.height, 0.9);
    const tw = w.width * scale;
    const th = w.height * scale;
    const cx = pad + col * (cellW + gap) + (cellW - tw) / 2;
    const cy = top + row * (cellH + gap) + (cellH - th) / 2;
    // Windows scale about their center, so offset by the centers.
    slots[w.id] = {
      dx: cx + tw / 2 - (w.x + w.width / 2),
      dy: cy + th / 2 - (w.y + w.height / 2),
      scale,
      order: i,
    };
  });
  return slots;
}
