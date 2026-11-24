import { flattenFS, publicTree } from "@/data/fs";
import { DESKTOP_DOCK_CLEARANCE, MENU_BAR_HEIGHT, type WindowState } from "@/hooks/useDesktopStore";

export const DESKS_KEY = "mmck-saved-desks-v1";
export const deskItems = flattenFS(publicTree()).filter(item => item.type !== "link" && item.id !== "saved-desks");
const byId = new Map(deskItems.map(item => [item.id, item]));

interface Frame { x: number; y: number; width: number; height: number }
export interface DeskWindow { item: string; frame?: Frame; maximized?: boolean; minimized?: boolean }
export interface SavedDesk { id: string; name: string; windows: DeskWindow[] }
export const presets: SavedDesk[] = [
  { id: "meeting", name: "Meeting desk", windows: [{ item: "card" }, { item: "work-overview" }] },
  { id: "kitchen", name: "Kitchen desk", windows: [{ item: "kitchen-timer" }, { item: "city-loaf-master-recipe" }] },
];

function validFrame(value: unknown): value is Frame {
  if (!value || typeof value !== "object") return false;
  return ["x", "y", "width", "height"].every(k => {
    const n = value[k as keyof typeof value];
    return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1 && (n > 0 || k === "x" || k === "y");
  });
}

export function readDesks(raw: string | null): SavedDesk[] {
  try {
    const input: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(input)) return [];
    const desks: SavedDesk[] = [];
    for (const d of input) {
      if (!d || typeof d.id !== "string" || !d.id || typeof d.name !== "string" || !d.name.trim() || !Array.isArray(d.windows)) continue;
      if (presets.some(p => p.id === d.id) || desks.some(p => p.id === d.id)) continue;
      const windows: DeskWindow[] = [];
      for (const w of d.windows) {
        if (!w || !byId.has(w.item) || windows.some(s => s.item === w.item)) continue;
        windows.push({ item: w.item, frame: validFrame(w.frame) ? w.frame : undefined, maximized: w.maximized === true, minimized: w.minimized === true });
      }
      if (windows.length) desks.push({ id: d.id, name: d.name.trim().slice(0, 60), windows });
    }
    return desks;
  } catch { return []; }
}

export function getStoredDesks(): SavedDesk[] {
  try { return readDesks(localStorage.getItem(DESKS_KEY)); } catch { return []; }
}

function area(viewportWidth: number, viewportHeight: number) {
  return { width: Math.max(1, viewportWidth), height: Math.max(1, viewportHeight - MENU_BAR_HEIGHT - DESKTOP_DOCK_CLEARANCE) };
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

export function captureDesk(windows: WindowState[], width: number, height: number): DeskWindow[] {
  const space = area(width, height);
  return windows.filter(w => byId.has(w.fsItemId)).sort((a,b) => a.zIndex - b.zIndex).map(w => {
    const rect = w.preMaximize ?? w;
    const frame = width < 768 ? undefined : {
      x: clamp(rect.x / space.width, 0, 1), y: clamp((rect.y - MENU_BAR_HEIGHT) / space.height, 0, 1),
      width: clamp(rect.width / space.width, .01, 1), height: clamp(rect.height / space.height, .01, 1),
    };
    return { item: w.fsItemId, frame, minimized: w.isMinimized, maximized: w.isMaximized };
  });
}

export function openDeskWindows(desk: SavedDesk, existing: WindowState[], width: number, height: number): WindowState[] {
  const space = area(width, height);
  // Validate item IDs again at the point where desktop windows are created.
  const entries = desk.windows.filter(w => byId.has(w.item));
  const columns = Math.min(entries.length, Math.max(1, Math.min(3, Math.floor(space.width / 340))));
  const rows = Math.ceil(entries.length / columns);
  const windows = entries.map((entry, i) => {
    const item = byId.get(entry.item)!;
    // The primary window opens on the left and stays in front on phones.
    const tile = entries.length - 1 - i;
    const frame = entry.frame || {
      x: (tile % columns) / columns + 6 / space.width, y: Math.floor(tile / columns) / rows + 6 / space.height,
      width: 1 / columns - 12 / space.width, height: 1 / rows - 12 / space.height,
    };
    const w = clamp(Math.round(frame.width * space.width), Math.min(260, space.width), space.width);
    const h = clamp(Math.round(frame.height * space.height), Math.min(150, space.height), space.height);
    const rect = { x: clamp(Math.round(frame.x * space.width), 0, space.width - w), y: MENU_BAR_HEIGHT + clamp(Math.round(frame.y * space.height), 0, space.height - h), width: w, height: h };
    return {
      ...rect, id: existing.find(w => w.fsItemId === item.id)?.id ?? "desk-" + item.id, fsItemId: item.id,
      title: item.name, icon: item.icon, zIndex: i + 1, isMinimized: !!entry.minimized, isMaximized: !!entry.maximized,
      ...(entry.maximized ? { x: 0, y: MENU_BAR_HEIGHT, ...space, preMaximize: rect } : {}),
    };
  });
  if (windows.length && windows.every(w => w.isMinimized)) windows[windows.length - 1].isMinimized = false;
  return windows;
}
