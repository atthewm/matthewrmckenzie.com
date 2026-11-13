import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanNutritionDays, hitTargets, nutritionStreak, dayResult, shortDate } from "./nutrition.ts";
import type { NutritionDay } from "../data/notion/types.ts";

const day = (date: string, over: Partial<NutritionDay> = {}): NutritionDay => ({
  date,
  status: "Draft",
  dayType: null,
  calories: 1900,
  calorieTarget: 2335,
  proteinGross: 210,
  proteinBioavailable: 193,
  proteinTarget: 200,
  fat: null,
  carbs: null,
  fiberFood: 30,
  fiberTotal: 42,
  hitTargets: null,
  ...over,
});

test("gross protein is compared with the gross protein target", () => {
  assert.equal(hitTargets(day("2026-11-06")), true);
  assert.equal(hitTargets(day("2026-11-06", { proteinGross: 190 })), false);
});

test("the calorie target is a ceiling, so a day under it counts", () => {
  assert.equal(hitTargets(day("2026-11-06", { calories: 1700 })), true);
  assert.equal(hitTargets(day("2026-11-06", { calories: 2700 })), false);
});

test("fiber counts supplements when the total is present", () => {
  assert.equal(hitTargets(day("2026-11-06", { fiberFood: 30, fiberTotal: 42 })), true);
  assert.equal(hitTargets(day("2026-11-06", { fiberFood: 30, fiberTotal: null })), false);
});

test("duplicate and empty days are merged or dropped", () => {
  const days = cleanNutritionDays([
    day("2026-11-12"),
    day("2026-11-11"),
    day("2026-11-11", { calories: null, proteinGross: null, proteinBioavailable: null, fiberFood: null, fiberTotal: 0 }),
    day("2026-11-10", { calories: null, proteinGross: null, proteinBioavailable: null }),
  ]);
  assert.deepEqual(days.map((d) => d.date), ["2026-11-12", "2026-11-11"]);
  assert.equal(days[1].calories, 1900);
});

test("today in progress does not break the streak", () => {
  const days = cleanNutritionDays([
    day("2026-11-13", { fiberTotal: 20, fiberFood: 20 }),
    day("2026-11-12"),
    day("2026-11-11"),
    day("2026-11-10", { proteinGross: 150 }),
    day("2026-11-09"),
  ]);
  assert.equal(dayResult(days[0], "2026-11-13"), "in-progress");
  assert.equal(dayResult(days[3], "2026-11-13"), "missed");
  assert.equal(nutritionStreak(days, "2026-11-13"), 2);
});

test("shortDate reads as a month and day", () => {
  assert.equal(shortDate("2026-11-11"), "Nov 11");
});
