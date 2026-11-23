import { afterEach, expect, test, vi } from "vitest";
import type { FSItem } from "@/data/fs";
import { desktopReducer, initialDesktopState } from "./useDesktopStore";

const item: FSItem = {
  id: "trash", name: "Trash", type: "app", icon: "Trash2",
  defaultSize: { width: 520, height: 550 },
};

afterEach(() => vi.unstubAllGlobals());

test("maximizing keeps window controls below the menu and restoring recovers the original frame", () => {
  vi.stubGlobal("window", { innerWidth: 1440, innerHeight: 900 });
  const open = desktopReducer(initialDesktopState, { type: "OPEN_WINDOW", payload: { fsItem: item } });
  const original = open.windows[0];
  const maximized = desktopReducer(open, { type: "MAXIMIZE_WINDOW", payload: { id: original.id } });
  const frame = maximized.windows[0];
  expect(frame.y).toBeGreaterThanOrEqual(22);
  expect(frame.y + frame.height).toBeLessThanOrEqual(900 - 64);
  const restored = desktopReducer(maximized, { type: "UNMAXIMIZE_WINDOW", payload: { id: original.id } });
  expect(restored.windows[0]).toMatchObject({
    x: original.x, y: original.y, width: original.width, height: original.height, isMaximized: false,
  });
});

test("a newly opened window fits a short landscape workspace", () => {
  vi.stubGlobal("window", { innerWidth: 844, innerHeight: 390 });
  const state = desktopReducer(initialDesktopState, { type: "OPEN_WINDOW", payload: { fsItem: item } });
  const frame = state.windows[0];
  expect(frame.y).toBeGreaterThanOrEqual(22);
  expect(frame.height).toBeGreaterThan(0);
  expect(frame.y + frame.height).toBeLessThanOrEqual(390 - 64);
});
