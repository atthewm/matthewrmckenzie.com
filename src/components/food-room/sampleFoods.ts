import type { TopFood } from "@/data/notion/types";

// ============================================================================
// FOOD ROOM: sample data
// ============================================================================
// Shown only while the Notion sync has no top-foods rows yet, and labeled as
// sample data in the room. These numbers are placeholders, not my log.
// ============================================================================

function food(
  rank: number,
  name: string,
  count: number,
  topMeal: string,
  cal: number,
  protein: number,
  fat: number,
  carbs: number,
  fiber: number,
): TopFood {
  return {
    key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    rank,
    count,
    daysLogged: Math.round(count * 0.85),
    topMeal,
    variants: 1,
    share: null,
    avgCalories: cal,
    avgProtein: protein,
    avgFat: fat,
    avgCarbs: carbs,
    avgFiber: fiber,
  };
}

export const SAMPLE_FOODS: TopFood[] = [
  food(1, "Cottage cheese", 64, "Breakfast", 180, 26, 5, 8, 0),
  food(2, "Eggs", 58, "Breakfast", 140, 12, 10, 1, 0),
  food(3, "Venison", 41, "Dinner", 190, 34, 4, 0, 0),
  food(4, "Sourdough", 37, "Lunch", 210, 8, 1, 42, 2),
  food(5, "Blue corn tortillas", 33, "Lunch", 160, 9, 3, 26, 4),
  food(6, "Overnight oats", 29, "Breakfast", 380, 32, 9, 44, 8),
  food(7, "Strawberries", 26, "Snack", 50, 1, 0, 12, 3),
  food(8, "Bison", 22, "Dinner", 220, 30, 10, 0, 0),
  food(9, "Broccoli", 19, "Dinner", 55, 4, 1, 11, 5),
  food(10, "Greek yogurt", 17, "Snack", 130, 20, 0, 9, 0),
  food(11, "Protein shake", 15, "Snack", 160, 30, 2, 5, 1),
  food(12, "Chicken breast", 12, "Lunch", 200, 38, 4, 0, 0),
];
