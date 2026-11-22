// ============================================================================
// WHOOP: THE PUBLIC VIEW
// ============================================================================
// /api/whoop/data used to hand the whole WHOOP payload to every visitor,
// including the account email and body measurements. Visitors now get only
// the fields listed here; the full payload is for the owner (?scope=owner
// with the owner cookie).
//
// This is an allowlist. Each public field is copied by name into a new object,
// so a field WHOOP adds later is private until someone decides otherwise.
//
// Public: the four headline scores (recovery percent, day strain, calories
// burned, sleep performance percent), per recent workout (five at most) the
// calendar day with its strain and calories, and lastSynced, the time the
// cache last refreshed.
// Private: profile (name, email, user id), body measurements, heart rate
// figures (resting, average, max, HRV), blood oxygen, skin temperature,
// respiratory rate, sleep stages, durations and need, every WHOOP timestamp
// (cycle, sleep and workout start and end times), every WHOOP id, sport ids
// and heart rate zones.
// ============================================================================

import type { WhoopDataResponse, WhoopDisconnected, WhoopWorkout } from "./client";

export interface PublicWhoopWorkout {
  /** Position in the list, newest first. Not a WHOOP id. */
  id: number;
  /** Calendar day of the workout, YYYY-MM-DD. No time of day. */
  day: string;
  score?: { strain: number; kilojoule: number };
}

export interface PublicWhoopData {
  connected: true;
  scope: "public";
  lastSynced: string;
  profile: null;
  bodyMeasurement: null;
  latestRecovery: { score: { recovery_score: number } } | null;
  latestCycle: { score: { strain: number; kilojoule: number } } | null;
  latestSleep: { score: { sleep_performance_percentage: number } } | null;
  recentWorkouts: PublicWhoopWorkout[];
}

export type PublicWhoopResponse = PublicWhoopData | WhoopDisconnected;

/** Matt's home time zone, used when a workout carries no UTC offset. */
const HOME_TIME_ZONE = "America/Chicago";
const OFFSET = /^([+-])(\d{2}):(\d{2})$/;
const MAX_PUBLIC_WORKOUTS = 5;

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * The cache can refresh even when the band has supplied no new data. A card
 * reading must come from the current physiological cycle, updated today in
 * the wearer's time zone. Reserve five minutes for a visible card to refresh.
 * No cycle timestamp leaves the server.
 */
export function currentDayStrain(data: WhoopDataResponse, now = Date.now()): number | null {
  if (!data.connected) return null;
  const cycle = data.latestCycle;
  const strain = cycle?.score?.strain;
  if (!cycle?.updated_at || cycle.end != null || cycle.score_state !== "SCORED" ||
      !isNumber(strain) || strain < 0 || strain > 21) return null;

  const updated = Date.parse(cycle.updated_at);
  const synced = Date.parse(data.lastSynced);
  const validThrough = now + 5 * 60_000;
  if (!Number.isFinite(updated) || updated > now || validThrough - updated > 6 * 3_600_000 ||
      !Number.isFinite(synced) || synced > now || validThrough - synced > 90 * 60_000) return null;

  const offset = cycle.timezone_offset === "Z" ? "+00:00" : cycle.timezone_offset;
  if (localDay(cycle.updated_at, offset) !== localDay(new Date(validThrough).toISOString(), offset)) return null;
  return Math.round(strain * 10) / 10;
}

/**
 * The local calendar day a workout started on. WHOOP sends the start in UTC
 * with the wearer's offset alongside; an evening workout must not show up
 * under tomorrow's date. Returns null when the start is unreadable.
 */
export function localDay(startIso: string, timezoneOffset?: unknown): string | null {
  const start = Date.parse(startIso);
  if (Number.isNaN(start)) return null;

  const match = typeof timezoneOffset === "string" ? OFFSET.exec(timezoneOffset) : null;
  if (match) {
    const minutes = (Number(match[2]) * 60 + Number(match[3])) * (match[1] === "-" ? -1 : 1);
    return new Date(start + minutes * 60 * 1000).toISOString().slice(0, 10);
  }
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: HOME_TIME_ZONE }).format(new Date(start));
}

function publicWorkout(workout: WhoopWorkout, index: number): PublicWhoopWorkout | null {
  const day = localDay(workout.start, (workout as { timezone_offset?: unknown }).timezone_offset);
  if (!day) return null;
  const score = workout.score;
  return {
    id: index,
    day,
    ...(score && isNumber(score.strain) && isNumber(score.kilojoule)
      ? { score: { strain: score.strain, kilojoule: score.kilojoule } }
      : {}),
  };
}

/** Reduce the full WHOOP payload to the fields any visitor may see. */
export function toPublicWhoop(data: WhoopDataResponse): PublicWhoopResponse {
  if (!data.connected) return { connected: false };

  const recovery = data.latestRecovery?.score;
  const cycle = data.latestCycle?.score;
  const sleep = data.latestSleep?.score;

  return {
    connected: true,
    scope: "public",
    lastSynced: data.lastSynced,
    profile: null,
    bodyMeasurement: null,
    latestRecovery:
      recovery && isNumber(recovery.recovery_score)
        ? { score: { recovery_score: recovery.recovery_score } }
        : null,
    latestCycle:
      cycle && isNumber(cycle.strain) && isNumber(cycle.kilojoule)
        ? { score: { strain: cycle.strain, kilojoule: cycle.kilojoule } }
        : null,
    latestSleep:
      sleep && isNumber(sleep.sleep_performance_percentage)
        ? { score: { sleep_performance_percentage: sleep.sleep_performance_percentage } }
        : null,
    recentWorkouts: (data.recentWorkouts ?? [])
      .slice(0, MAX_PUBLIC_WORKOUTS)
      .map(publicWorkout)
      .filter((w): w is PublicWhoopWorkout => w !== null),
  };
}
