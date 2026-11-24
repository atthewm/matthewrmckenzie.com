export const SIDE = 7;
export const MINE_COUNT = 8;
export const START_CELL = 24;

export type Survey = { mines: Set<number>; clues: number[] };

export function neighbors(cell: number): number[] {
  const row = Math.floor(cell / SIDE);
  const col = cell % SIDE;
  const cells: number[] = [];
  for (let r = Math.max(0, row - 1); r <= Math.min(SIDE - 1, row + 1); r++) {
    for (let c = Math.max(0, col - 1); c <= Math.min(SIDE - 1, col + 1); c++) {
      const index = r * SIDE + c;
      if (index !== cell) cells.push(index);
    }
  }
  return cells;
}

export function uncover(survey: Survey, seen: Set<number>, marked: Set<number>, cell: number) {
  const queue = [cell];
  while (queue.length) {
    const next = queue.pop()!;
    if (seen.has(next) || marked.has(next) || survey.mines.has(next)) continue;
    seen.add(next);
    if (!survey.clues[next]) queue.push(...neighbors(next));
  }
}

// Only accept layouts that can be solved from the center by counting the
// numbered neighbors. Visitors can finish the board without taking a guess.
export function canSolve(survey: Survey): boolean {
  const seen = new Set<number>();
  const marked = new Set<number>();
  uncover(survey, seen, marked, START_CELL);
  if (seen.size === SIDE * SIDE - MINE_COUNT) return false;
  let count: number;
  do {
    count = seen.size + marked.size;
    for (const cell of seen) {
      const adjacent = neighbors(cell);
      const unknown = adjacent.filter(n => !seen.has(n) && !marked.has(n));
      const remaining = survey.clues[cell] - adjacent.filter(n => marked.has(n)).length;
      if (!remaining) unknown.forEach(n => uncover(survey, seen, marked, n));
      else if (remaining === unknown.length) unknown.forEach(n => marked.add(n));
    }
  } while (count !== seen.size + marked.size);
  return seen.size === SIDE * SIDE - MINE_COUNT;
}

export function dailySurvey(day: string): Survey {
  // The date and a fixed integer PRNG give every browser the same shuffle.
  let seed = Number(day.replaceAll("-", "")) || 1;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  const cells = Array.from({ length: SIDE * SIDE }, (_, i) => i);
  const safe = new Set([START_CELL, ...neighbors(START_CELL)]);
  const candidates = cells.filter(n => !safe.has(n));
  const makeBoard = (mines: Set<number>) => ({ mines, clues: cells.map(n => neighbors(n).filter(a => mines.has(a)).length) });
  for (let attempt = 0; attempt < 128; attempt++) {
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const board = makeBoard(new Set(candidates.slice(0, MINE_COUNT)));
    if (canSolve(board)) return board;
  }
  // A known solvable arrangement bounds generation time on every device.
  return makeBoard(new Set([48, 40, 39, 41, 36, 14, 3, 6]));
}

export const todayUTC = () => new Date().toISOString().slice(0, 10);
export const formatTime = (seconds: number) =>
  Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");

export function loadBest(day: string): number | null {
  try {
    const raw = localStorage.getItem("mmck-daily-survey-" + day);
    const seconds = Number(raw);
    return raw && Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null;
  } catch { return null; }
}
