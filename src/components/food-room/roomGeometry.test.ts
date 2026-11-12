import { test } from "node:test";
import assert from "node:assert/strict";
import { TALL_ROOM, WIDE_ROOM, inBox, layoutItems, maxOnTable, nearBoard, type RoomGeometry } from "./roomGeometry.ts";

const food = (i: number) => ({
  key: `food-${i}`,
  name: `Food ${i}`,
  rank: i,
  count: 100 - i,
  daysLogged: 50,
  topMeal: "Lunch",
  variants: 1,
  share: null,
  avgCalories: 100,
  avgProtein: 10,
  avgFat: 2,
  avgCarbs: 5,
  avgFiber: 1,
});
const foods = Array.from({ length: 30 }, (_, i) => food(i + 1));

for (const [name, g] of [["wide", WIDE_ROOM], ["tall", TALL_ROOM]] as [string, RoomGeometry][]) {
  test(`${name} room seats ten foods, all on the table top`, () => {
    const items = layoutItems(foods, g);
    assert.equal(maxOnTable(g), 10);
    assert.equal(items.length, 10);
    for (const item of items) {
      assert.ok(item.x > g.table.x0 && item.x < g.table.x1, `${item.id} x`);
      assert.ok(item.y > g.table.y0 && item.y <= g.table.y1, `${item.id} y`);
    }
  });

  test(`${name} room keeps the most eaten foods in rank order`, () => {
    const items = layoutItems(foods, g);
    assert.deepEqual(items.map((i) => i.id), foods.slice(0, 10).map((f) => f.key));
  });

  test(`${name} room: start and board spots are free floor`, () => {
    assert.equal(inBox(g.block, g.start.x, g.start.y), false);
    assert.equal(inBox(g.block, g.boardSpot.x, g.boardSpot.y), false);
    assert.ok(g.start.y > g.floorTop && g.start.y < g.h);
    assert.ok(g.boardSpot.y > g.floorTop);
    assert.equal(nearBoard(g, g.boardSpot.x, g.boardSpot.y), true);
    assert.equal(nearBoard(g, g.start.x, g.start.y), false);
  });

  test(`${name} room: neighbours in a row do not overlap`, () => {
    const items = layoutItems(foods, g);
    const spriteWidth = (g.spriteW / 100) * g.w;
    const byRow = new Map<number, number[]>();
    for (const item of items) byRow.set(item.y, [...(byRow.get(item.y) ?? []), item.x]);
    for (const xs of byRow.values()) {
      for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] >= spriteWidth, "row spacing");
    }
  });
}

test("a short list centres a single food", () => {
  const [only] = layoutItems(foods.slice(0, 1), WIDE_ROOM);
  assert.equal(only.x, (WIDE_ROOM.table.x0 + WIDE_ROOM.table.x1) / 2);
});
