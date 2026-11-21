import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";
import { initialAppearanceScript } from "./appearance";

function firstPaint(values: Record<string,string>, systemDark: boolean) {
  const dataset: Record<string,string> = {};
  let dark = false;
  runInNewContext(initialAppearanceScript, {
    localStorage: { getItem: (name: string) => values[name] ?? null },
    document: { documentElement: { dataset, classList: { toggle: (_: string, enabled: boolean) => { dark = enabled; } } } },
    matchMedia: () => ({ matches: systemDark }),
  });
  return [dataset.appearance, dark];
}

it("restores Graphite before rendering a page, including preferences from the older desktop store", () => {
  expect(firstPaint({ "mmck-desktop-state": JSON.stringify({ theme: "dark" }) }, false)).toEqual(["dark", true]);
  expect(firstPaint({ "mmck-appearance": "light", "mmck-desktop-state": JSON.stringify({ theme: "dark" }) }, true)).toEqual(["light", false]);
});

it("uses the device setting when no appearance has been chosen", () => {
  expect(firstPaint({}, true)).toEqual(["system", true]);
  expect(firstPaint({}, false)).toEqual(["system", false]);
});
