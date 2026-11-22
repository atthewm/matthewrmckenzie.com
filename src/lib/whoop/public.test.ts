import { describe, expect, test } from "vitest";
import type { WhoopDashboardData } from "./client";
import { currentDayStrain, localDay, toPublicWhoop } from "./public";

const base = {
  connected: true,
  lastSynced: "2026-11-17T11:00:00.000Z",
  profile: null,
  bodyMeasurement: null,
  latestRecovery: null,
  latestCycle: null,
  latestSleep: null,
  recentWorkouts: [],
} as unknown as WhoopDashboardData;

describe("currentDayStrain", () => {
  const noon = Date.parse("2026-11-17T18:00:00Z");
  const now = new Date(noon).toISOString();
  const cycle = {
    id: 1, user_id: 1, start: "2026-11-17T04:00:00Z", end: null,
    timezone_offset: "-06:00", updated_at: "2026-11-17T17:00:00Z", score_state: "SCORED" as const,
    score: { strain: 10.55, kilojoule: 500, average_heart_rate: 70, max_heart_rate: 90 },
  };
  const fresh = { ...base, latestCycle: cycle, lastSynced: now };
  test("accepts an open scored cycle from today including zero", () => {
    expect(currentDayStrain(fresh, noon)).toBe(10.6);
    expect(currentDayStrain({ ...fresh, latestCycle: { ...cycle, score: { ...cycle.score, strain: 0 } } }, noon)).toBe(0);
  });
  test("rejects old measurements, closed cycles, and stale syncs independently", () => {
    for (const patch of [
      { updated_at: "2026-11-16T18:00:00Z" }, { updated_at: "2026-11-17T11:00:00Z" },
      { updated_at: "invalid" }, { updated_at: undefined }, { updated_at: "2030-01-01T00:00:00Z" },
      { end: now }, { score_state: "PENDING_SCORE" as const }, { score: { ...cycle.score, strain: 22 } },
    ]) {
      expect(currentDayStrain({ ...fresh, latestCycle: { ...cycle, ...patch } }, noon)).toBeNull();
    }
    expect(currentDayStrain({ ...fresh, lastSynced: "2026-11-17T15:00:00Z" }, noon)).toBeNull();
    expect(currentDayStrain({ connected: false }, noon)).toBeNull();
  });
  test("hides a recent update from the previous local day", () => {
    const nextDay = Date.parse("2026-11-18T06:05:00Z");
    const value = { ...fresh, lastSynced: new Date(nextDay).toISOString(),
      latestCycle: { ...cycle, updated_at: "2026-11-18T05:50:00Z" } };
    expect(currentDayStrain(value, nextDay)).toBeNull();
  });
});

function keysDeep(value: unknown, into = new Set<string>()): Set<string> {
  if (Array.isArray(value)) value.forEach((v) => keysDeep(v, into));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      into.add(k);
      keysDeep(v, into);
    }
  }
  return into;
}

describe("toPublicWhoop", () => {
  test("passes a disconnected state through", () => {
    expect(toPublicWhoop({ connected: false })).toEqual({ connected: false });
  });

  test("only ever emits fields from the allowlist", () => {
    const full = {
      ...base,
      surprise: "a field WHOOP adds next year",
      profile: { user_id: 1, email: "private@example.com", first_name: "M", last_name: "M" },
      bodyMeasurement: { height_meter: 1.8, weight_kilogram: 80, max_heart_rate: 180 },
      latestRecovery: { cycle_id: 1, score: { recovery_score: 70, resting_heart_rate: 45, hrv_rmssd_milli: 60, extra: 1 } },
      latestCycle: { id: 1, start: "2026-11-17T05:00:00Z", score: { strain: 10, kilojoule: 8000, max_heart_rate: 150 } },
      latestSleep: { id: 2, start: "2026-11-16T04:00:00Z", score: { sleep_performance_percentage: 90, respiratory_rate: 15 } },
      recentWorkouts: [{ id: 3, start: "2026-11-16T15:00:00Z", end: "2026-11-16T16:00:00Z", sport_id: 1, score: { strain: 8, kilojoule: 1500, max_heart_rate: 170 } }],
    } as unknown as WhoopDashboardData;

    const allowed = new Set([
      "connected", "scope", "lastSynced", "profile", "bodyMeasurement",
      "latestRecovery", "latestCycle", "latestSleep", "recentWorkouts",
      "score", "recovery_score", "strain", "kilojoule", "sleep_performance_percentage", "id", "day",
    ]);
    const emitted = keysDeep(toPublicWhoop(full));
    expect([...emitted].filter((k) => !allowed.has(k))).toEqual([]);
  });

  test("never carries the profile or body measurements", () => {
    const result = toPublicWhoop({
      ...base,
      profile: { user_id: 1, email: "private@example.com", first_name: "M", last_name: "M" },
      bodyMeasurement: { height_meter: 1.8, weight_kilogram: 80, max_heart_rate: 180 },
    });
    expect(result).toMatchObject({ profile: null, bodyMeasurement: null });
    expect(JSON.stringify(result)).not.toContain("private@example.com");
  });

  test("drops a section whose score is missing or not a number", () => {
    const result = toPublicWhoop({
      ...base,
      latestRecovery: { score_state: "PENDING_SCORE" },
      latestCycle: { score: { strain: "high", kilojoule: 8000 } },
      latestSleep: { score: { stage_summary: {} } },
    } as unknown as WhoopDashboardData);
    expect(result).toMatchObject({ latestRecovery: null, latestCycle: null, latestSleep: null });
  });

  test("lists at most five workouts, by local day, without WHOOP ids or times", () => {
    const workouts = Array.from({ length: 7 }, (_, i) => ({
      id: 9000 + i,
      start: `2026-11-1${i}T15:00:00.000Z`,
      end: `2026-11-1${i}T16:00:00.000Z`,
      timezone_offset: "-06:00",
      score: { strain: 5 + i, kilojoule: 1000 + i },
    }));
    const result = toPublicWhoop({ ...base, recentWorkouts: workouts } as unknown as WhoopDashboardData);
    if (!result.connected) throw new Error("expected a connected result");

    expect(result.recentWorkouts).toHaveLength(5);
    expect(result.recentWorkouts[0]).toEqual({ id: 0, day: "2026-11-10", score: { strain: 5, kilojoule: 1000 } });
    expect(result.recentWorkouts.map((w) => w.id)).toEqual([0, 1, 2, 3, 4]);
  });

  test("keeps an unscored workout as a day with no score, and skips an unreadable one", () => {
    const result = toPublicWhoop({
      ...base,
      recentWorkouts: [
        { id: 1, start: "2026-11-16T15:00:00.000Z", timezone_offset: "-06:00" },
        { id: 2, start: "not a date" },
      ],
    } as unknown as WhoopDashboardData);
    if (!result.connected) throw new Error("expected a connected result");
    expect(result.recentWorkouts).toEqual([{ id: 0, day: "2026-11-16" }]);
  });
});

describe("localDay", () => {
  test("uses the workout's own UTC offset", () => {
    // 01:15 UTC on the 17th is 19:15 on the 16th in Austin.
    expect(localDay("2026-11-17T01:15:00.000Z", "-06:00")).toBe("2026-11-16");
    expect(localDay("2026-11-17T01:15:00.000Z", "+09:00")).toBe("2026-11-17");
    expect(localDay("2026-11-16T22:00:00.000Z", "+05:30")).toBe("2026-11-17");
  });

  test("falls back to Central time when there is no offset", () => {
    expect(localDay("2026-11-17T01:15:00.000Z")).toBe("2026-11-16");
    expect(localDay("2026-11-17T18:00:00.000Z", "nonsense")).toBe("2026-11-17");
  });

  test("returns null for an unreadable start", () => {
    expect(localDay("not a date", "-06:00")).toBeNull();
  });
});
