// ============================================================================
// BOARD LAYOUT
// ============================================================================
// Pure helpers that turn a folder into pinboard groups and give every card a
// deterministic starting spot. Positions are in "world" units; the camera in
// BoardView scales and translates the world onto the screen.
// ============================================================================

import { findFSItem, type FSItem } from "@/data/fs";
import { recipes as recipeIndex, RECIPE_CATEGORIES } from "@/content/recipes/index";

export type CardKind = "recipe" | "split" | "paper" | "folder" | "link" | "polaroid";

export interface BoardGroup {
  id: string;
  label: string;
  items: FSItem[];
}

export interface CardPlacement {
  x: number;
  y: number;
  rotation: number;
}

export interface GroupPlacement {
  id: string;
  label: string;
  count: number;
  x: number;
  y: number;
  width: number;
}

export interface BoardLayout {
  cards: Record<string, CardPlacement>;
  groups: GroupPlacement[];
  width: number;
  height: number;
}

export const CARD_SIZES: Record<CardKind, { w: number; h: number }> = {
  recipe: { w: 264, h: 176 },
  split: { w: 232, h: 184 },
  paper: { w: 220, h: 272 },
  folder: { w: 232, h: 164 },
  link: { w: 212, h: 156 },
  polaroid: { w: 184, h: 206 },
};

/** Gutter between cards. Jitter plus rotation overhang must stay well inside half of it. */
const GAP = 40;
const GROUP_GAP = 88;
const ROW_GAP = 72;
const LABEL_SPACE = 84;
/** Empty cork around the content, in world units. The camera anchors to it. */
export const BOARD_MARGIN = 72;
const MAX_JITTER = 5;
const MAX_ROTATION_DEG = 1.5;
/** Groups stack about this tall (world units) before spilling into another column. */
const TARGET_GROUP_HEIGHT = 640;
const MAX_COLS = 6;
/** Small groups read best as a single row. */
const SINGLE_ROW_MAX = 3;
/** Wrap groups onto a new row once a row passes this aspect (width over height). */
const TARGET_ASPECT = 2;

/** Small stable string hash (FNV-1a) used for jitter and pin colors. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function cardKind(item: FSItem): CardKind {
  if (item.appComponent === "RecipeViewer") return "recipe";
  if (item.appComponent === "WhoopSplitApp") return "split";
  if (item.type === "folder") return "folder";
  if (item.type === "link") return "link";
  if (item.type === "document" || item.contentPath || item.appComponent === "ResumeApp") return "paper";
  return "polaroid";
}

function pinnedRefs(folder: FSItem): FSItem[] {
  return (folder.pins ?? [])
    .map((id) => findFSItem(id))
    .filter((i): i is FSItem => Boolean(i));
}

/** Split a folder into labeled groups. Recipes group by category; nested folders become their own group. */
export function buildGroups(folder: FSItem): BoardGroup[] {
  const children = (folder.children ?? []).filter((c) => !c.hidden);

  if (folder.id === "recipes") {
    const byId = new Map(children.map((c) => [c.id, c]));
    return RECIPE_CATEGORIES.map((category) => ({
      id: `cat-${category}`,
      label: category,
      items: recipeIndex
        .filter((r) => r.category === category && byId.has(r.slug))
        .map((r) => byId.get(r.slug)!),
    })).filter((g) => g.items.length > 0);
  }

  const loose = [...children.filter((c) => c.type !== "folder"), ...pinnedRefs(folder)];
  const nested = children
    .filter((c) => c.type === "folder")
    .map((sub) => ({
      id: `sub-${sub.id}`,
      label: sub.name,
      items: (sub.children ?? []).filter((c) => !c.hidden),
    }))
    .filter((g) => g.items.length > 0);

  const groups: BoardGroup[] = [];
  if (loose.length > 0) groups.push({ id: "main", label: folder.name, items: loose });
  return [...groups, ...nested];
}

function columnsFor(count: number, cellW: number, cellH: number, maxWidth: number, groupHeight: number): number {
  // Never wider than the window can show at a readable zoom.
  const fitCols = Math.max(1, Math.floor((maxWidth + GAP) / (cellW + GAP)));
  if (count <= SINGLE_ROW_MAX) return Math.min(count, fitCols);
  const rows = Math.max(1, Math.floor((groupHeight + GAP) / (cellH + GAP)));
  return Math.min(MAX_COLS, fitCols, Math.max(1, Math.ceil(count / rows)));
}

/** Deterministic value in [-1, 1] from a hash and a bit offset. */
function unit(h: number, shift: number): number {
  return (((h >>> shift) % 201) - 100) / 100;
}

interface GroupBlock {
  group: BoardGroup;
  cols: number;
  cellW: number;
  cellH: number;
  width: number;
  height: number;
}

function measure(group: BoardGroup, maxWidth: number, groupHeight: number): GroupBlock {
  const sizes = group.items.map((i) => CARD_SIZES[cardKind(i)]);
  const cellW = Math.max(...sizes.map((s) => s.w));
  const cellH = Math.max(...sizes.map((s) => s.h));
  const cols = columnsFor(group.items.length, cellW, cellH, maxWidth, groupHeight);
  const rows = Math.ceil(group.items.length / cols);
  return {
    group,
    cols,
    cellW,
    cellH,
    width: cols * cellW + (cols - 1) * GAP,
    height: LABEL_SPACE + rows * cellH + (rows - 1) * GAP,
  };
}

/** Greedy shelf packing: fill a row left to right, wrap once it gets wider than the target. */
function packRows(blocks: GroupBlock[], aspect: number, maxWidth: number): GroupBlock[][] {
  const area = blocks.reduce((sum, b) => sum + (b.width + GROUP_GAP) * (b.height + ROW_GAP), 0);
  const widest = Math.max(...blocks.map((b) => b.width));
  const targetWidth = Math.max(widest, Math.min(maxWidth, Math.sqrt(area * aspect)));
  const rows: GroupBlock[][] = [];
  let row: GroupBlock[] = [];
  let rowWidth = 0;
  for (const block of blocks) {
    const next = rowWidth + (row.length ? GROUP_GAP : 0) + block.width;
    if (row.length && next > targetWidth) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    rowWidth += (row.length ? GROUP_GAP : 0) + block.width;
    row.push(block);
  }
  if (row.length) rows.push(row);
  return rows;
}

/**
 * Lay groups out as tidy grids of cards. Groups flow left to right and wrap
 * into rows so the board stays roughly screen shaped. Each card is pinned at
 * the top center of a fixed cell; jitter and tilt are small enough that cards never touch.
 */
export interface LayoutViewport {
  /** Window content width and height in screen pixels. */
  width: number;
  height: number;
}

/** The zoom a board should be readable at in a window this wide. */
export function readableScale(viewWidth: number): number {
  return viewWidth < 760 ? 0.8 : 0.9;
}

export function computeLayout(groups: BoardGroup[], view?: LayoutViewport): BoardLayout {
  // Shape the board like its window, so it opens fitted instead of with a
  // column hanging off the right edge. Without a size, keep the wide default.
  const aspect = view && view.width > 0 && view.height > 0 ? Math.max(0.5, Math.min(3, view.width / view.height)) : TARGET_ASPECT;
  const maxWidth = view && view.width > 0 ? Math.max(CARD_SIZES.recipe.w, view.width / readableScale(view.width) - BOARD_MARGIN * 2) : Infinity;
  const groupHeight = TARGET_GROUP_HEIGHT;
  const cards: Record<string, CardPlacement> = {};
  const placedGroups: GroupPlacement[] = [];
  if (groups.length === 0) return { cards, groups: placedGroups, width: BOARD_MARGIN * 2, height: BOARD_MARGIN * 2 };

  let cursorY = BOARD_MARGIN;
  let maxRight = 0;

  for (const row of packRows(groups.map((g) => measure(g, maxWidth, groupHeight)), aspect, maxWidth)) {
    let cursorX = BOARD_MARGIN;
    for (const block of row) {
      const { group, cols, cellW, cellH, width } = block;
      placedGroups.push({ id: group.id, label: group.label, count: group.items.length, x: cursorX, y: cursorY, width });

      group.items.forEach((item, index) => {
        const size = CARD_SIZES[cardKind(item)];
        const h = hashString(item.id);
        const col = index % cols;
        const r = Math.floor(index / cols);
        const x = cursorX + col * (cellW + GAP) + (cellW - size.w) / 2 + unit(h, 0) * MAX_JITTER;
        const y = cursorY + LABEL_SPACE + r * (cellH + GAP) + unit(h, 8) * MAX_JITTER;
        cards[item.id] = { x, y, rotation: unit(h, 16) * MAX_ROTATION_DEG };
      });

      cursorX += width + GROUP_GAP;
      maxRight = Math.max(maxRight, cursorX - GROUP_GAP);
    }
    cursorY += Math.max(...row.map((b) => b.height)) + ROW_GAP;
  }

  return {
    cards,
    groups: placedGroups,
    width: maxRight + BOARD_MARGIN,
    height: cursorY - ROW_GAP + BOARD_MARGIN,
  };
}
