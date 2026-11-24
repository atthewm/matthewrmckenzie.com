import { describe, expect, it } from "vitest";
import { captureDesk, openDeskWindows, presets, readDesks } from "./savedDesks";
import { desktopReducer, initialDesktopState } from "@/hooks/useDesktopStore";

describe("saved desks", () => {
  it("tiles the intended windows side by side, primary first visually and frontmost on phones", () => {
    for (const [desk, primary] of [[presets[0], "work-overview"], [presets[1], "city-loaf-master-recipe"]] as const) {
      const windows = openDeskWindows(desk, [], 1440, 900);
      const [right, left] = windows;
      expect(left.fsItemId).toBe(primary);
      expect(left.x + left.width).toBeLessThanOrEqual(right.x);
      const state = desktopReducer(initialDesktopState, { type: "OPEN_DESK", payload: { windows } });
      expect(state.focusedWindowId).toBe(left.id);
      expect(state.deskWindowIds).toEqual([right.id, left.id]);
    }
  });
  it("ignores corrupt storage, private or missing app IDs, duplicate windows and invalid frames", () => {
    for (const raw of ["bad-json", "{}", "null"]) expect(readDesks(raw)).toEqual([]);
    const data = [{ id: "mine", name: "Mine", windows: [{ item: "life" }, { item: "nutrition" }, { item: "stale" }, { item: "card", frame: { x: "bad" } }, { item: "card" }] }];
    const [desk] = readDesks(JSON.stringify(data));
    expect(desk.windows).toHaveLength(1);
    expect(desk.windows[0]).toMatchObject({ item: "card", frame: undefined });
    expect(openDeskWindows({ ...desk, windows: [{ item: "life" }] }, [], 390, 844)).toEqual([]);
  });
  it("reopens Browser and Stickies through the public app registry", () => {
    const windows = [{ item: "browser" }, { item: "stickies" }];
    const [desk] = readDesks(JSON.stringify([{ id: "notes", name: "Notes", windows }]));
    expect(openDeskWindows(desk, [], 1200, 700).map(w => w.fsItemId)).toEqual(["browser", "stickies"]);
  });
  it("restores saved geometry, flags and existing window identity and fits smaller screens", () => {
    const original = openDeskWindows(presets[0], [], 1440, 900);
    original[0] = { ...original[0], x: 125, y: 171, width: 414, height: 375, isMinimized: true };
    const custom = { id: "mine", name: "Mine", windows: captureDesk(original, 1440, 900) };
    const restored = openDeskWindows(custom, original, 1440, 900);
    expect(restored).toMatchObject(original);
    const resized = openDeskWindows(custom, original, 820, 440);
    for (const win of resized) {
      expect(win.x).toBeGreaterThanOrEqual(0);
      expect(win.y).toBeGreaterThanOrEqual(22);
      expect(win.x + win.width).toBeLessThanOrEqual(820);
      expect(win.y + win.height).toBeLessThanOrEqual(440 - 64);
    }
  });
});
