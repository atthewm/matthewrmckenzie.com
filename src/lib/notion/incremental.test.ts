import { describe, expect, test } from "vitest";
import {
  FULL_REBUILD_INTERVAL_MS,
  SINCE_OVERLAP_MS,
  chooseMode,
  incrementalSince,
  lastEditedSinceFilter,
  parseRequestedMode,
} from "./incremental";

const NOW = new Date("2026-11-17T12:00:30.000Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 60 * 60 * 1000).toISOString();

describe("lastEditedSinceFilter", () => {
  test("builds the Notion timestamp filter for rows edited since a moment", () => {
    expect(lastEditedSinceFilter("2026-11-16T11:55:00.000Z")).toEqual({
      timestamp: "last_edited_time",
      last_edited_time: { on_or_after: "2026-11-16T11:55:00.000Z" },
    });
  });
});

describe("incrementalSince", () => {
  test("floors the last run to the minute, then steps back by the overlap", () => {
    // Notion rounds last_edited_time down to the minute, so a run that began at
    // 12:00:30 must still see an edit stamped 12:00:00.
    expect(incrementalSince("2026-11-16T12:00:30.500Z")).toBe("2026-11-16T11:55:00.000Z");
    expect(SINCE_OVERLAP_MS).toBe(5 * 60 * 1000);
  });

  test("never opens the window after the last run began", () => {
    for (const lastRun of ["2026-11-16T12:00:00.000Z", "2026-11-16T12:00:59.999Z", "2026-01-01T00:00:00.000Z"]) {
      expect(Date.parse(incrementalSince(lastRun))).toBeLessThan(Date.parse(lastRun));
    }
  });

  test("rejects a value that is not a timestamp", () => {
    expect(() => incrementalSince("yesterday")).toThrow();
  });
});

describe("chooseMode", () => {
  const fresh = { lastRunAt: hoursAgo(24), lastFullAt: hoursAgo(48) };

  test("is incremental when a full rebuild ran within the week", () => {
    expect(chooseMode({ requested: "auto", state: fresh, now: NOW })).toBe("incremental");
  });

  test("rebuilds in full when there is no earlier run to build on", () => {
    expect(chooseMode({ requested: "auto", state: null, now: NOW })).toBe("full");
    expect(chooseMode({ requested: "auto", state: undefined, now: NOW })).toBe("full");
    expect(chooseMode({ requested: "auto", state: { lastRunAt: null, lastFullAt: null }, now: NOW })).toBe("full");
    expect(chooseMode({ requested: "auto", state: { lastRunAt: hoursAgo(1), lastFullAt: null }, now: NOW })).toBe("full");
    expect(chooseMode({ requested: "auto", state: { lastRunAt: "garbage", lastFullAt: hoursAgo(1) }, now: NOW })).toBe("full");
  });

  test("rebuilds in full once a week", () => {
    const sixDays = { lastRunAt: hoursAgo(24), lastFullAt: hoursAgo(6 * 24) };
    const sevenDays = { lastRunAt: hoursAgo(24), lastFullAt: hoursAgo(7 * 24) };
    expect(chooseMode({ requested: "auto", state: sixDays, now: NOW })).toBe("incremental");
    expect(chooseMode({ requested: "auto", state: sevenDays, now: NOW })).toBe("full");
  });

  test("still rebuilds on day seven when the cron fires a little early", () => {
    const almostSeven = { lastRunAt: hoursAgo(24), lastFullAt: hoursAgo(7 * 24 - 1) };
    expect(chooseMode({ requested: "auto", state: almostSeven, now: NOW })).toBe("full");
    expect(FULL_REBUILD_INTERVAL_MS).toBeLessThan(7 * 24 * 60 * 60 * 1000);
    expect(FULL_REBUILD_INTERVAL_MS).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
  });

  test("lets a caller force a full rebuild", () => {
    expect(chooseMode({ requested: "full", state: fresh, now: NOW })).toBe("full");
  });

  test("lets a caller ask for incremental, but only when there is a run to build on", () => {
    const stale = { lastRunAt: hoursAgo(24), lastFullAt: hoursAgo(30 * 24) };
    expect(chooseMode({ requested: "incremental", state: stale, now: NOW })).toBe("incremental");
    expect(chooseMode({ requested: "incremental", state: null, now: NOW })).toBe("full");
  });

  test("rebuilds in full when the stored times are in the future", () => {
    const future = { lastRunAt: hoursAgo(-2), lastFullAt: hoursAgo(-2) };
    expect(chooseMode({ requested: "auto", state: future, now: NOW })).toBe("full");
  });
});

describe("parseRequestedMode", () => {
  test("accepts full and incremental, and treats anything else as auto", () => {
    expect(parseRequestedMode("full")).toBe("full");
    expect(parseRequestedMode("incremental")).toBe("incremental");
    for (const value of [null, undefined, "", "auto", "FULL", "weekly"]) {
      expect(parseRequestedMode(value)).toBe("auto");
    }
  });
});
