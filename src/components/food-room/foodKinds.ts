// ============================================================================
// FOOD ROOM: food kinds
// ============================================================================
// Maps a logged food name to one of a small set of drawn characters. Matching
// is by keyword on the lowercased name; the first rule that hits wins, so more
// specific words sit above general ones. The order matters: "protein bar" must
// reach the bar before the shake, "honey nut squash" the squash before the
// sweets, "broccoli slaw" the salad before the broccoli.
// ============================================================================

export type FoodKind =
  | "bread"
  | "egg"
  | "meat"
  | "steak"
  | "chicken"
  | "fish"
  | "dairy"
  | "yogurt"
  | "milk"
  | "shake"
  | "bar"
  | "oats"
  | "tortilla"
  | "rice"
  | "popcorn"
  | "fruit"
  | "mango"
  | "kiwi"
  | "berry"
  | "blueberry"
  | "veg"
  | "cauliflower"
  | "squash"
  | "sweetpotato"
  | "beans"
  | "salad"
  | "sweet"
  | "chocolate"
  | "drink"
  | "onigiri";

const RULES: readonly (readonly [FoodKind, RegExp])[] = [
  ["bar", /\bbars?\b/],
  ["shake", /\b(shake|whey|protein powder|isolate|smoothie|promix|collagen)(e?s)?\b|\bprotein$/],
  ["popcorn", /\bpopcorn\b/],
  ["rice", /\brice cakes?\b/],
  ["squash", /\b(squash|zucchini|pumpkin|koginut)(e?s)?\b/],
  ["chocolate", /\b(chocolate|cocoa|candy|candies|truffle)(e?s)?\b|\bsee's\b/],
  ["oats", /\b(oat|oats|oatmeal|granola|muesli|cereal|porridge|crunch|magic spoon)(e?s)?\b/],
  ["tortilla", /\b(tortilla|taco|wrap|quesadilla|masa)(e?s)?\b/],
  ["sweet", /\b(brownie|cookie|cake|jam|ice cream|dessert|muffin|pie|honey)(e?s)?\b/],
  ["bread", /\b(bread|toast|sourdough|loaf|bagel|bun|roll|baguette|pita|english muffin)(e?s)?\b/],
  ["egg", /\b(egg|eggs|omelet|omelette|frittata)(e?s)?\b/],
  ["yogurt", /\b(yogurt|yoghurt|skyr|kefir)(e?s)?\b/],
  ["milk", /\bmilk\b/],
  ["dairy", /\b(cottage|cheese|parmesan|mozzarella|feta|cream)(e?s)?\b/],
  ["fish", /\b(salmon|tuna|fish|shrimp|cod|sardine|trout|halibut)(e?s)?\b/],
  ["chicken", /\b(chicken|turkey)(e?s)?\b/],
  ["steak", /\b(steak|filet|mignon|tenderloin|ribeye|sirloin)(e?s)?\b/],
  ["meat", /\b(venison|bison|beef|pork|lamb|meatball|burger|sausage|bacon|jerky|ham|elk|liver)(e?s)?\b/],
  ["mango", /\bmango(e?s)?\b/],
  ["kiwi", /\bkiwis?\b/],
  ["blueberry", /\b(blueberr|blackberr)/],
  ["berry", /\b(strawberr|raspberr|berries|berry|cherr|grape)/],
  ["fruit", /\b(apple|banana|orange|peach|pear|plum|pineapple|melon|fruit|avocado)(e?s)?\b/],
  ["sweetpotato", /\b(sweet potato|potato|yam)(e?s)?\b/],
  ["cauliflower", /\bcauliflower\b/],
  ["beans", /\b(bean|beans|edamame|lentil|chickpea|lupini)(e?s)?\b/],
  ["salad", /\b(salad|slaw|coleslaw|greens|lettuce|kale|spinach|arugula)(e?s)?\b/],
  ["veg", /\b(broccoli|carrot|pepper|vegetable|veg|veggie|asparagus|tomato|onion|beet|brussels|sprout)(e?s)?\b/],
  ["rice", /\b(rice|quinoa|pasta|noodle|lasagna|couscous|farro)(e?s)?\b/],
  ["drink", /\b(tea|juice|soda|water|electrolyte|drink|latte|espresso|coffee|supplement)(e?s)?\b/],
];

export function foodKind(name: string): FoodKind {
  const n = name.toLowerCase();
  for (const [kind, re] of RULES) if (re.test(n)) return kind;
  return "onigiri";
}

/** Kinds that count as a treat on the board's "guilty pleasures" list. */
export const TREAT_KINDS: ReadonlySet<FoodKind> = new Set<FoodKind>(["sweet", "chocolate"]);
