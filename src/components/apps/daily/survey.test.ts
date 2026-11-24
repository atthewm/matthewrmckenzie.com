import { describe, expect, it, vi, afterEach } from "vitest";
import { canSolve, dailySurvey, formatTime, loadBest, MINE_COUNT, neighbors, SIDE, START_CELL, uncover } from "./survey";

describe("Daily Survey", () => {
  it("has one predictable, solvable board per UTC date with a safe center opening", () => {
    const layouts = new Set<string>();
    for (let day = 1; day <= 31; day++) {
      const key = "2026-12-" + String(day).padStart(2, "0");
      const board = dailySurvey(key);
      expect(board).toEqual(dailySurvey(key));
      expect(board.mines.size).toBe(MINE_COUNT);
      expect(canSolve(board)).toBe(true);
      for (const cell of [START_CELL, ...neighbors(START_CELL)]) expect(board.mines.has(cell)).toBe(false);
      const seen = new Set<number>();
      uncover(board, seen, new Set(), START_CELL);
      expect(seen.size).toBeLessThan(SIDE * SIDE - MINE_COUNT);
      layouts.add([...board.mines].sort((a, b) => a - b).join(","));
    }
    expect(layouts.size).toBe(31);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("loads positive whole seconds and ignores missing or invalid records", () => {
    const getItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem });
    for (const raw of [null, "", "0", "-1", "NaN", "9s", "3.3"]) {
      getItem.mockReturnValue(raw);
      expect(loadBest("2026-11-23")).toBeNull();
    }
    getItem.mockReturnValue("65");
    expect(formatTime(loadBest("2026-11-23")!)).toBe("1:05");
    expect(getItem).toHaveBeenCalledWith("mmck-daily-survey-2026-11-23");
  });
});
