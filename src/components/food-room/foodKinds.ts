// ============================================================================
// FOOD ROOM: food kinds
// ============================================================================
// Maps a logged food name to one of a small set of drawn characters. Matching
// is by keyword on the lowercased name; the first rule that hits wins, so more
// specific words sit above general ones.
// ============================================================================

export type FoodKind =
  | "bread"
  | "egg"
  | "meat"
  | "fish"
  | "dairy"
  | "shake"
  | "oats"
  | "tortilla"
  | "rice"
  | "fruit"
  | "berry"
  | "veg"
  | "sweet"
  | "drink"
  | "onigiri";

const RULES: [FoodKind, RegExp][] = [
  ["shake", /\b(shake|whey|protein powder|isolate|smoothie)\b/],
  ["tortilla", /\b(tortilla|taco|wrap|quesadilla|masa)\b/],
  ["oats", /\b(oat|oats|oatmeal|granola|muesli|cereal|porridge)\b/],
  ["bread", /\b(bread|toast|sourdough|loaf|bagel|bun|roll|baguette|pita|english muffin)\b/],
  ["sweet", /\b(brownie|cookie|cake|jam|chocolate|ice cream|dessert|muffin|pie|honey)\b/],
  ["egg", /\b(egg|eggs|omelet|omelette|frittata)\b/],
  ["fish", /\b(salmon|tuna|fish|shrimp|cod|sardine|trout|halibut)\b/],
  ["meat", /\b(venison|bison|beef|steak|chicken|turkey|pork|lamb|meatball|burger|sausage|bacon|jerky|ham|elk)\b/],
  ["dairy", /\b(cottage|yogurt|yoghurt|skyr|kefir|milk|cheese|parmesan|mozzarella|cream)\b/],
  ["berry", /\b(strawberr|blueberr|raspberr|blackberr|berries|berry|cherr|grape)/],
  ["fruit", /\b(apple|banana|orange|peach|pear|mango|pineapple|kiwi|melon|fruit|avocado)\b/],
  ["veg", /\b(broccoli|spinach|salad|kale|zucchini|carrot|pepper|vegetable|veggie|greens|asparagus|cauliflower|beans|lettuce|tomato|onion|potato|squash)\b/],
  ["rice", /\b(rice|quinoa|pasta|noodle|lasagna|couscous|farro)\b/],
  ["drink", /\b(tea|juice|soda|water|electrolyte|drink|latte|espresso|coffee)\b/],
];

export function foodKind(name: string): FoodKind {
  const n = name.toLowerCase();
  for (const [kind, re] of RULES) if (re.test(n)) return kind;
  return "onigiri";
}
