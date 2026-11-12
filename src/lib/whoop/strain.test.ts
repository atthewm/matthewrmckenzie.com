import { test } from "node:test";
import assert from "node:assert/strict";
import { toStrainSeries } from "./strain.ts";

const cycle = (start: string, strain: number | null, state = "SCORED") => ({
  start,
  score_state: state,
  score: strain === null ? undefined : { strain },
});

test("toStrainSeries returns scored days oldest first", () => {
  const series = toStrainSeries([
    cycle("2026-11-10T05:00:00.000Z", 12.34),
    cycle("2026-11-09T05:00:00.000Z", 8.1),
    cycle("2026-11-08T05:00:00.000Z", 15.06),
  ]);
  assert.deepEqual(series, [
    { date: "2026-11-08", strain: 15.1 },
    { date: "2026-11-09", strain: 8.1 },
    { date: "2026-11-10", strain: 12.3 },
  ]);
});

test("toStrainSeries drops unscored cycles and bad values", () => {
  const series = toStrainSeries([
    cycle("2026-11-10T05:00:00.000Z", 9, "PENDING_SCORE"),
    cycle("2026-11-09T05:00:00.000Z", null),
    cycle("2026-11-08T05:00:00.000Z", Number.NaN),
    cycle("2026-11-07T05:00:00.000Z", 4.4),
  ]);
  assert.deepEqual(series, [{ date: "2026-11-07", strain: 4.4 }]);
});

test("toStrainSeries handles a missing list", () => {
  assert.deepEqual(toStrainSeries(undefined), []);
  assert.deepEqual(toStrainSeries(null), []);
});
