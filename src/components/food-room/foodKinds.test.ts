import { test } from "node:test";
import assert from "node:assert/strict";
import { foodKind, type FoodKind } from "./foodKinds.ts";

// The top 30 names from /api/notion/data?dataset=top-foods (read 2026-11-11),
// in rank order, with the sprite each one should get.
const TOP_30: [string, FoodKind][] = [
  ["Whole eggs", "egg"],
  ["Chicken breast", "chicken"],
  ["Egg whites", "egg"],
  ["LesserEvil popcorn", "popcorn"],
  ["ProMix whey isolate shake", "shake"],
  ["Frozen mango", "mango"],
  ["Dark chocolate", "chocolate"],
  ["Good Culture 2% cottage cheese", "dairy"],
  ["Roasted vegetables", "veg"],
  ["Raspberries", "berry"],
  ["Roasted cauliflower", "cauliflower"],
  ["Umami black beans", "beans"],
  ["David Bar", "bar"],
  ["Butternut squash", "squash"],
  ["Master City Loaf", "bread"],
  ["Blackberries", "blueberry"],
  ["Coleslaw mix", "salad"],
  ["Blueberries", "blueberry"],
  ["Fairlife fat-free milk", "milk"],
  ["Kiwi", "kiwi"],
  ["Built Bar", "bar"],
  ["Nonfat plain Greek yogurt", "yogurt"],
  ["Cottage cheese 2%", "dairy"],
  ["Catalina Crunch", "oats"],
  ["Broccoli slaw", "salad"],
  ["Magic Spoon cereal", "oats"],
  ["93% lean ground beef", "meat"],
  ["Sweet potato", "sweetpotato"],
  ["Beef Liver", "meat"],
  ["See's candy", "chocolate"],
];

test("every top 30 food gets its intended sprite", () => {
  for (const [name, kind] of TOP_30) {
    assert.equal(foodKind(name), kind, name);
  }
});

test("the three foods that were wrong are fixed", () => {
  assert.equal(foodKind("LesserEvil popcorn"), "popcorn");
  assert.equal(foodKind("Frozen mango"), "mango");
  assert.equal(foodKind("Dark chocolate"), "chocolate");
});

test("specific words win over general ones", () => {
  const cases: [string, FoodKind][] = [
    ["David Gold Protein Bar", "bar"],
    ["Equip protein", "shake"],
    ["ProMix + collagen", "shake"],
    ["RAW Grass-Fed Whey Isolate, Milk & Cookies", "shake"],
    ["Protein Brownie v2", "sweet"],
    ["Protein Carrot Cake v2", "sweet"],
    ["Honey Nut Squash", "squash"],
    ["Zucchini", "squash"],
    ["Skirt steak", "steak"],
    ["Filet mignon", "steak"],
    ["Beef tenderloin", "steak"],
    ["FON venison, plain", "meat"],
    ["Chicken 50/50 breast-thigh blend", "chicken"],
    ["Ghost Cinnamon Toast Crunch Cereal", "oats"],
    ["Lundberg Thin Rice Cake, red rice & quinoa", "rice"],
    ["Drizzilicious mini rice cakes, chocolate drizzle", "rice"],
    ["Organic Hazelnut Cocoa Spread", "chocolate"],
    ["A2 whole milk", "milk"],
    ["Parmesan cheese", "dairy"],
    ["Smoked salmon", "fish"],
    ["Edamame, shelled", "beans"],
    ["Salad greens", "salad"],
    ["Strawberries", "berry"],
    ["Apple", "fruit"],
    ["Blue corn tortillas", "tortilla"],
  ];
  for (const [name, kind] of cases) {
    assert.equal(foodKind(name), kind, name);
  }
});

test("anything unmatched falls back to the onigiri", () => {
  assert.equal(foodKind("Mystery item"), "onigiri");
  assert.equal(foodKind(""), "onigiri");
});
