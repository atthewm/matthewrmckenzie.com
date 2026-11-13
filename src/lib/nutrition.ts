// ============================================================================
// NUTRITION: one place for the goal comparison, the day cleanup and the streak
// ============================================================================
// The Notion log stores "Protein Target" as a gross protein target (200 g),
// so gross protein is compared with it. The bioavailable figure is shown as a
// detail only. "Calorie Target" is a ceiling for the day: at or under it,
// with the buffer, counts. Fiber counts everything logged (food plus
// supplements) when the total is present.
//
// The log can hold two rows for one date (an empty draft next to the real
// one); cleanNutritionDays keeps the most complete row and drops rows with no
// numbers. Today's row is still being logged, so it is "in progress" rather
// than "missed" and does not break the streak.
// ============================================================================

import { DEFAULT_NUTRITION_TARGETS, type NutritionDay, type NutritionTargets } from "../data/notion/types.ts";

export type DayResult = "hit" | "missed" | "in-progress" | "no-data";

export function proteinValue(d: NutritionDay): number | null {
  return d.proteinGross ?? d.proteinBioavailable ?? null;
}

export function proteinTargetFor(d: NutritionDay | undefined, t: NutritionTargets = DEFAULT_NUTRITION_TARGETS): number {
  return d?.proteinTarget ?? t.proteinGross;
}

export function fiberValue(d: NutritionDay): number | null {
  return d.fiberTotal ?? d.fiberFood ?? null;
}

export function calorieTargetFor(d: NutritionDay | undefined, t: NutritionTargets = DEFAULT_NUTRITION_TARGETS): number {
  return d?.calorieTarget ?? t.calories;
}

function hasNumbers(d: NutritionDay): boolean {
  return d.calories != null || proteinValue(d) != null;
}

function completeness(d: NutritionDay): number {
  return [d.calories, d.proteinGross, d.proteinBioavailable, d.fiberFood, d.fiberTotal, d.fat, d.carbs].filter((v) => v != null).length;
}

/** Did the day hit its core targets? null when there is nothing to judge. */
export function hitTargets(d: NutritionDay, t: NutritionTargets = DEFAULT_NUTRITION_TARGETS): boolean | null {
  if (!hasNumbers(d)) return null;
  const calOk = d.calories != null && d.calories <= calorieTargetFor(d, t) + t.calorieBuffer;
  const protein = proteinValue(d);
  const proOk = protein != null && protein >= proteinTargetFor(d, t);
  const fiber = fiberValue(d);
  const fibOk = fiber != null && fiber >= t.fiber;
  return calOk && proOk && fibOk;
}

/** One row per date, newest first, rows without numbers dropped. */
export function cleanNutritionDays(days: NutritionDay[]): NutritionDay[] {
  const byDate = new Map<string, NutritionDay>();
  for (const d of days) {
    if (!d?.date || !hasNumbers(d)) continue;
    const prev = byDate.get(d.date);
    if (!prev || completeness(d) > completeness(prev)) byDate.set(d.date, d);
  }
  return [...byDate.values()]
    .map((d) => ({ ...d, hitTargets: hitTargets(d) }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** The calendar date in Austin, as YYYY-MM-DD. */
export function todayInAustin(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function dayResult(d: NutritionDay, today: string): DayResult {
  if (d.hitTargets == null) return "no-data";
  if (d.hitTargets) return "hit";
  return d.date >= today ? "in-progress" : "missed";
}

/** Consecutive hit days, newest first, skipping today while it is in progress. */
export function nutritionStreak(days: NutritionDay[], today: string): number {
  let streak = 0;
  for (const d of days) {
    const r = dayResult(d, today);
    if (r === "in-progress") continue;
    if (r !== "hit") break;
    streak++;
  }
  return streak;
}

export const DAY_RESULT_LABEL: Record<DayResult, string> = {
  hit: "Hit",
  missed: "Missed",
  "in-progress": "Today",
  "no-data": "No log",
};

/** "Nov 11" from "2026-11-11", without time zone drift. */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}
