// ============================================================================
// NOTION SYNC — TOP FOODS AGGREGATION
// ============================================================================
// Turns raw Meal Entries rows into an anonymous, ranked "most logged foods"
// table. This runs at sync time on the server and only the aggregate leaves the
// machine: no per-meal rows, no dates, no notes are ever written to the cache.
//
// The hard part is that food names are typed by hand and drift a lot. The live
// log contains all of these for the same food:
//
//   "Egg whites (5)" · "Egg whites" · "5 egg whites"
//   "Lesser Evil popcorn" · "LesserEvil popcorn (60g)" · "LesserEvil popcorn (35g)"
//   "Chicken breast" · "Grilled chicken breast" · "Chicken breast, grilled"
//
// A naive GROUP BY on the raw title splits one food across many rows and the
// ranking becomes meaningless. `foodKey` below collapses those variants onto a
// single key; `aggregateTopFoods` then ranks by how often the food was logged.
// ============================================================================

import type { TopFood } from "@/data/notion/types";

// ---------------------------------------------------------------------------
// Name normalization
// ---------------------------------------------------------------------------

/**
 * Preparation, size, and state words that describe *how* a food showed up
 * rather than *what* it is. Dropping them merges "Roasted cauliflower" and
 * "Cauliflower", or "Frozen mango" and "Mango", into one entry.
 *
 * Deliberately conservative: words that change what the food actually is
 * (for example "whites" in "egg whites") are never listed here.
 */
const FILLER_WORDS = new Set([
  "cooked",
  "raw",
  "grilled",
  "baked",
  "roasted",
  "frozen",
  "fresh",
  "plain",
  "homemade",
  "large",
  "medium",
  "small",
  "shelled",
  "dry",
  "salted",
  "unsalted",
  "whole",
  "chopped",
  "sliced",
  "mixed",
  "approx",
]);

/** Units that may trail a leading quantity, e.g. "150g chicken", "1 cup oats". */
const UNIT_WORDS =
  "g|kg|mg|oz|lb|lbs|ml|l|cup|cups|tbsp|tsp|slice|slices|piece|pieces|serving|servings|scoop|scoops|can|cans|bar|packet";

/**
 * Collapse a raw Notion "Item" title to a stable grouping key.
 *
 * Returns "" for titles that carry no food name at all, which the caller skips.
 */
export function foodKey(raw: string): string {
  let s = (raw || "").toLowerCase();

  // "Chicken breast (grilled)" / "Popcorn (35g = 150 cal)" -> drop the aside.
  s = s.replace(/\([^)]*\)/g, " ");
  // An unclosed "(" (truncated titles) — drop the tail too.
  s = s.replace(/\(.*$/, " ");
  // "Chicken breast, grilled" -> keep the head noun only.
  s = s.split(",")[0];
  // "ProMix whey isolate shake - PRE-WORKOUT" -> drop the trailing qualifier.
  s = s.split(/\s+[-–—]\s+/)[0];
  // Leading quantity: "3 large whole eggs", "150g chicken", "1/2 cup oats".
  s = s.replace(new RegExp(`^[\\d.,/\\s]+\\s*(?:${UNIT_WORDS})?\\b`, "i"), " ");

  const words = s
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .filter((w) => !FILLER_WORDS.has(w));

  // Join with no separator so spacing variants collapse:
  // "Lesser Evil popcorn" and "LesserEvil popcorn" both -> "lesserevilpopcorn".
  return words.join("");
}

/**
 * Brand and shorthand variants that normalization alone cannot merge, because
 * the words genuinely differ ("FF milk" vs "fat-free milk"). Keys and values
 * are both post-`foodKey` forms; values are the surviving canonical key.
 */
const KEY_ALIASES: Record<string, string> = {
  promix: "promixwheyisolate",
  promixisolate: "promixwheyisolate",
  promixprotein: "promixwheyisolate",
  promixwheyisolateshake: "promixwheyisolate",
  davidproteinbar: "davidbar",
  fairlifeffmilk: "fairlifefatfreemilk",
  unwindsupplement: "unwind",
  nonfatgreekyogurt: "greekyogurt",
  nonfatplaingreekyogurt: "greekyogurt",
};

export function canonicalFoodKey(raw: string): string {
  const key = foodKey(raw);
  return KEY_ALIASES[key] ?? key;
}

/** Strip parentheticals/quantities but keep the human wording for display. */
export function displayName(raw: string): string {
  const cleaned = (raw || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\(.*$/, " ")
    .split(/\s+[-–—]\s+/)[0]
    .replace(new RegExp(`^[\\d.,/\\s]+\\s*(?:${UNIT_WORDS})?\\b`, "i"), " ")
    .replace(/\s+/g, " ")
    .replace(/[\s,]+$/, "")
    .trim();
  if (!cleaned) return (raw || "").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

/** One meal row, already reduced to the fields the aggregate needs. */
export interface MealEntryInput {
  item: string;
  meal: string | null;
  /** ISO date of the day this was eaten, when it could be resolved. */
  day: string | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
}

interface Bucket {
  key: string;
  /** cleaned label -> times seen, used to pick the display name. */
  labels: Map<string, number>;
  /** every distinct raw title that collapsed into this bucket. */
  rawTitles: Set<string>;
  meals: Map<string, number>;
  days: Set<string>;
  count: number;
  sums: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
  counts: { calories: number; protein: number; fat: number; carbs: number; fiber: number };
}

function addMacro(b: Bucket, field: keyof Bucket["sums"], value: number | null) {
  if (typeof value !== "number" || !Number.isFinite(value)) return;
  b.sums[field] += value;
  b.counts[field] += 1;
}

function mean(sum: number, n: number): number | null {
  if (n === 0) return null;
  return Math.round((sum / n) * 10) / 10;
}

/** Most frequent entry in a count map, ties broken by the shorter string. */
function topOf(map: Map<string, number>): string | null {
  let best: string | null = null;
  let bestN = -1;
  for (const [value, n] of map) {
    if (n > bestN || (n === bestN && best !== null && value.length < best.length)) {
      best = value;
      bestN = n;
    }
  }
  return best;
}

export interface TopFoodsOptions {
  /** How many ranked foods to keep. */
  limit?: number;
  /** Ignore foods logged fewer than this many times. */
  minCount?: number;
}

/**
 * Rank foods by how often they were logged, with average macros per logged
 * serving. Averages are per *entry*, not per 100g: portions vary, so this
 * answers "what does a typical serving of this look like in my log".
 */
export function aggregateTopFoods(
  entries: MealEntryInput[],
  opts: TopFoodsOptions = {}
): TopFood[] {
  const { limit = 100, minCount = 2 } = opts;
  const buckets = new Map<string, Bucket>();

  for (const e of entries) {
    const key = canonicalFoodKey(e.item);
    if (!key) continue;

    let b = buckets.get(key);
    if (!b) {
      b = {
        key,
        labels: new Map(),
        rawTitles: new Set(),
        meals: new Map(),
        days: new Set(),
        count: 0,
        sums: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
        counts: { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 },
      };
      buckets.set(key, b);
    }

    b.count += 1;
    const label = displayName(e.item);
    if (label) b.labels.set(label, (b.labels.get(label) ?? 0) + 1);
    if (e.item) b.rawTitles.add(e.item.trim());
    if (e.meal) b.meals.set(e.meal, (b.meals.get(e.meal) ?? 0) + 1);
    if (e.day) b.days.add(e.day);

    addMacro(b, "calories", e.calories);
    addMacro(b, "protein", e.protein);
    addMacro(b, "fat", e.fat);
    addMacro(b, "carbs", e.carbs);
    addMacro(b, "fiber", e.fiber);
  }

  // Share is measured against every logged entry, including the long tail that
  // does not make the cut, so the percentages stay honest.
  const totalEntries = entries.length;

  const ranked = [...buckets.values()]
    .filter((b) => b.count >= minCount)
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);

  return ranked.map((b, i) => ({
    key: b.key,
    name: topOf(b.labels) ?? b.key,
    rank: i + 1,
    count: b.count,
    daysLogged: b.days.size,
    topMeal: topOf(b.meals),
    variants: b.rawTitles.size,
    share: totalEntries > 0 ? Math.round((b.count / totalEntries) * 1000) / 10 : null,
    avgCalories: mean(b.sums.calories, b.counts.calories),
    avgProtein: mean(b.sums.protein, b.counts.protein),
    avgFat: mean(b.sums.fat, b.counts.fat),
    avgCarbs: mean(b.sums.carbs, b.counts.carbs),
    avgFiber: mean(b.sums.fiber, b.counts.fiber),
  }));
}
