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
  ["shake", /\b(shake|whey|protein powder|isolate|smoothie)(e?s)?\b/],
  ["tortilla", /\b(tortilla|taco|wrap|quesadilla|masa)(e?s)?\b/],
  ["oats", /\b(oat|oats|oatmeal|granola|muesli|cereal|porridge)(e?s)?\b/],
  ["bread", /\b(bread|toast|sourdough|loaf|bagel|bun|roll|baguette|pita|english muffin)(e?s)?\b/],
  ["sweet", /\b(brownie|cookie|cake|jam|chocolate|ice cream|dessert|muffin|pie|honey)(e?s)?\b/],
  ["egg", /\b(egg|eggs|omelet|omelette|frittata)(e?s)?\b/],
  ["fish", /\b(salmon|tuna|fish|shrimp|cod|sardine|trout|halibut)(e?s)?\b/],
  ["meat", /\b(venison|bison|beef|steak|chicken|turkey|pork|lamb|meatball|burger|sausage|bacon|jerky|ham|elk)(e?s)?\b/],
  ["dairy", /\b(cottage|yogurt|yoghurt|skyr|kefir|milk|cheese|parmesan|mozzarella|cream)(e?s)?\b/],
  ["berry", /\b(strawberr|blueberr|raspberr|blackberr|berries|berry|cherr|grape)/],
  ["fruit", /\b(apple|banana|orange|peach|pear|mango|pineapple|kiwi|melon|fruit|avocado)(e?s)?\b/],
  ["veg", /\b(broccoli|spinach|salad|kale|zucchini|carrot|pepper|vegetable|veggie|greens|asparagus|cauliflower|beans|lettuce|tomato|onion|potato|squash)(e?s)?\b/],
  ["rice", /\b(rice|quinoa|pasta|noodle|lasagna|couscous|farro)(e?s)?\b/],
  ["drink", /\b(tea|juice|soda|water|electrolyte|drink|latte|espresso|coffee)(e?s)?\b/],
];

export function foodKind(name: string): FoodKind {
  const n = name.toLowerCase();
  for (const [kind, re] of RULES) if (re.test(n)) return kind;
  return "onigiri";
}
