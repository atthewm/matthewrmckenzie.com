"use client";

// ============================================================================
// SMALL SHARED STORES FOR THE DUO SPLITS
// ============================================================================
// Some apps show their two halves on two screens in the Duo laptop pose
// (chess moves above the board, Photo Booth effects below the camera, the
// Food Room's selected food below the room). These tiny stores let the two
// halves share state without changing how the apps work on their own.
// ============================================================================

import { useSyncExternalStore } from "react";
import type { TopFood } from "@/data/notion/types";

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
      listeners.forEach((l) => l());
    },
    use: () =>
      useSyncExternalStore(
        (cb) => {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        () => value,
        () => value,
      ),
  };
}

export interface ChessMove {
  color: "w" | "b";
  text: string;
  at: number;
}

export const chessLog = createStore<{ moves: ChessMove[]; startedAt: number }>({ moves: [], startedAt: Date.now() });

const FILES = "abcdefgh";
export function squareName(r: number, c: number): string {
  return `${FILES[c]}${8 - r}`;
}

export function logChessMove(color: "w" | "b", piece: string, from: [number, number], to: [number, number]) {
  const cur = chessLog.get();
  const p = piece === "P" ? "" : piece;
  chessLog.set({
    ...cur,
    moves: [...cur.moves, { color, text: `${p}${squareName(...from)}-${squareName(...to)}`, at: Date.now() }],
  });
}

export function resetChessLog() {
  chessLog.set({ moves: [], startedAt: Date.now() });
}

export type PhotoEffect = "none" | "sepia" | "noir" | "thermal" | "comic" | "mirror" | "vintage" | "x-ray";
export const photoEffect = createStore<PhotoEffect>("none");

export const foodRoomSelection = createStore<readonly TopFood[] | null>(null);
