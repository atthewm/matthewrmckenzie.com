import type { NutritionDay, TopFood } from "@/data/notion/types";
import { DEFAULT_NUTRITION_TARGETS } from "@/data/notion/types";
import { foodKind, TREAT_KINDS } from "./foodKinds";

// ============================================================================
// FOOD ROOM: insights
// ============================================================================
// Pure functions over the public top-foods rollup (and, for the signed-in
// owner only, the private daily nutrition log). No network, no React, so the
// private cross-source dashboard can reuse the same shapes.
// ============================================================================

/** Grams of protein per 100 kcal. The single best "efficiency" number. */
export function proteinDensity(f: Pick<TopFood, "avgProtein" | "avgCalories">): number | null {
  if (f.avgProtein == null || !f.avgCalories || f.avgCalories < 20) return null;
  return (f.avgProtein / f.avgCalories) * 100;
}

export function favorites(foods: TopFood[], n = 8): TopFood[] {
  return [...foods].sort((a, b) => b.count - a.count).slice(0, n);
}

export function mostEfficient(foods: TopFood[], n = 8): (TopFood & { density: number })[] {
  return foods
    .map((f) => ({ ...f, density: proteinDensity(f) ?? -1 }))
    .filter((f) => f.density > 0)
    .sort((a, b) => b.density - a.density)
    .slice(0, n);
}

/**
 * Guilty pleasures: sweets, plus anything calorie heavy that brings little
 * protein (under 5 g per 100 kcal at 250+ kcal a serving). Ranked by how often
 * they get eaten, since a rare treat is not the problem.
 */
export function guiltyPleasures(foods: TopFood[], n = 6): TopFood[] {
  return foods
    .filter((f) => {
      if (TREAT_KINDS.has(foodKind(f.name))) return true;
      const d = proteinDensity(f);
      return (f.avgCalories ?? 0) >= 250 && d != null && d < 5;
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, n);
}

export interface MacroMix {
  protein: number;
  carbs: number;
  fat: number;
}

/** Share of calories from each macro, weighted by how often each food is eaten. */
export function macroMix(foods: TopFood[]): MacroMix | null {
  let p = 0, c = 0, f = 0;
  for (const food of foods) {
    p += (food.avgProtein ?? 0) * 4 * food.count;
    c += (food.avgCarbs ?? 0) * 4 * food.count;
    f += (food.avgFat ?? 0) * 9 * food.count;
  }
  const total = p + c + f;
  if (total <= 0) return null;
  return { protein: p / total, carbs: c / total, fat: f / total };
}

export function mealSplit(foods: TopFood[]): { meal: string; count: number }[] {
  const by = new Map<string, number>();
  for (const f of foods) {
    const m = f.topMeal ?? "Other";
    by.set(m, (by.get(m) ?? 0) + f.count);
  }
  return [...by.entries()].map(([meal, count]) => ({ meal, count })).sort((a, b) => b.count - a.count);
}

export interface Tip {
  title: string;
  detail: string;
}

/** Plain suggestions built only from the numbers above. */
export function improvements(foods: TopFood[], days: NutritionDay[] | null): Tip[] {
  const tips: Tip[] = [];
  const total = foods.reduce((s, f) => s + f.count, 0);

  const low = foods.filter((f) => {
    const d = proteinDensity(f);
    return d != null && d < 5 && (f.avgCalories ?? 0) >= 150;
  });
  const lowCount = low.reduce((s, f) => s + f.count, 0);
  if (total > 0 && low.length) {
    const top = [...low].sort((a, b) => b.count - a.count)[0];
    const swap = mostEfficient(foods.filter((f) => f.topMeal === top.topMeal && f.key !== top.key), 1)[0];
    tips.push({
      title: `${Math.round((lowCount / total) * 100)}% of servings are low in protein`,
      detail: swap
        ? `${top.name} is the most common one. At ${top.topMeal?.toLowerCase() ?? "that meal"}, ${swap.name} gives ${swap.density.toFixed(1)} g protein per 100 kcal instead.`
        : `${top.name} is the most common one.`,
    });
  }

  const fiberServings = foods.filter((f) => (f.avgFiber ?? 0) >= 4).reduce((s, f) => s + f.count, 0);
  if (total > 0) {
    tips.push({
      title: `${Math.round((fiberServings / total) * 100)}% of servings bring 4 g of fiber or more`,
      detail: "Vegetables, berries, oats and beans are the easiest way to raise it.",
    });
  }

  if (days && days.length) {
    const t = DEFAULT_NUTRITION_TARGETS;
    const recent = days.slice(-14);
    const proteinHit = recent.filter((d) => (d.proteinGross ?? 0) >= (d.proteinTarget ?? t.proteinGross)).length;
    const fiberHit = recent.filter((d) => (d.fiberTotal ?? d.fiberFood ?? 0) >= t.fiber).length;
    tips.push({
      title: `Protein target hit on ${proteinHit} of the last ${recent.length} days`,
      detail: `Fiber target (${t.fiber} g) hit on ${fiberHit} of those days.`,
    });
  }
  return tips;
}
