// ============================================================================
// BOARD STORAGE
// ============================================================================
// Per-visitor card positions, saved in localStorage. A convenience only:
// every read and write tolerates blocked or missing storage.
// ============================================================================

export type Point = { x: number; y: number };

/** Bumped with the grid layout so positions saved against the old layout are ignored. */
const STORAGE_PREFIX = "mmck-board:v2:";

export function readSaved(boardId: string): Record<string, Point> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + boardId);
    return raw ? (JSON.parse(raw) as Record<string, Point>) : {};
  } catch {
    return {};
  }
}

export function writeSaved(boardId: string, positions: Record<string, Point>) {
  try {
    localStorage.setItem(STORAGE_PREFIX + boardId, JSON.stringify(positions));
  } catch {
    // Private mode or storage blocked: layout just won't persist.
  }
}

export function clearSaved(boardId: string) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + boardId);
  } catch {
    // ignore
  }
}
