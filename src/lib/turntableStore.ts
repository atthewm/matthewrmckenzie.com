"use client";

// ============================================================================
// TURNTABLE STORE
// ============================================================================
// Shared by the deck (record and tonearm) and the playlist, so the Duo
// layout can show them on separate screens and they stay in step.
// "active" means the chosen playlist's Apple Music player is loaded; the
// record spins only then. Audio itself plays inside Apple's player.
// ============================================================================

import { useSyncExternalStore } from "react";
import { appleMusicPlaylists } from "@/config/playlists";

interface TurntableState {
  index: number;
  active: boolean;
}

let state: TurntableState = { index: 0, active: false };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const turntable = {
  select(index: number) {
    const n = appleMusicPlaylists.length;
    state = { ...state, index: ((index % n) + n) % n };
    emit();
  },
  next() {
    turntable.select(state.index + 1);
  },
  previous() {
    turntable.select(state.index - 1);
  },
  setActive(active: boolean) {
    state = { ...state, active };
    emit();
  },
  toggle() {
    turntable.setActive(!state.active);
  },
};

export function useTurntable(): TurntableState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}
