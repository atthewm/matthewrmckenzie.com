import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSparkline } from "./sparkline.ts";

test("buildSparkline returns null for fewer than two points", () => {
  assert.equal(buildSparkline([], 100, 20), null);
  assert.equal(buildSparkline([5], 100, 20), null);
});

test("buildSparkline spans the full width and inverts y", () => {
  const spark = buildSparkline([0, 10], 100, 20, 0);
  assert.ok(spark);
  assert.equal(spark.path, "M0,20 L100,0");
  assert.deepEqual(spark.points, [
    { x: 0, y: 20 },
    { x: 100, y: 0 },
  ]);
  assert.equal(spark.min, 0);
  assert.equal(spark.max, 10);
});

test("buildSparkline keeps points inside the padding", () => {
  const spark = buildSparkline([3, 9, 6], 120, 40, 4);
  assert.ok(spark);
  for (const point of spark.points) {
    assert.ok(point.x >= 4 && point.x <= 116);
    assert.ok(point.y >= 4 && point.y <= 36);
  }
  assert.equal(spark.points[1].y, 4);
});

test("buildSparkline draws a flat series on the middle line", () => {
  const spark = buildSparkline([7, 7, 7], 100, 20, 0);
  assert.ok(spark);
  assert.equal(spark.path, "M0,10 L50,10 L100,10");
});

test("buildSparkline ignores values that are not finite", () => {
  const spark = buildSparkline([1, Number.NaN, 3], 100, 20, 0);
  assert.ok(spark);
  assert.equal(spark.points.length, 2);
});
