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
  recipe: { w: 240, h: 160 },
  split: { w: 210, h: 170 },
  paper: { w: 200, h: 250 },
  folder: { w: 210, h: 150 },
  link: { w: 190, h: 120 },
  polaroid: { w: 170, h: 190 },
};

const GAP = 44;
const GROUP_GAP = 96;
const LABEL_SPACE = 88;
const MARGIN = 80;

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

function columnsFor(count: number): number {
  if (count <= 2) return 1;
  if (count <= 6) return 2;
  return 3;
}

/** Lay groups out left to right as columns of cards, with a little hand-pinned jitter. */
export function computeLayout(groups: BoardGroup[]): BoardLayout {
  const cards: Record<string, CardPlacement> = {};
  const placedGroups: GroupPlacement[] = [];
  let cursorX = MARGIN;
  let maxBottom = 0;

  for (const group of groups) {
    const cols = columnsFor(group.items.length);
    const sizes = group.items.map((i) => CARD_SIZES[cardKind(i)]);
    const cellW = Math.max(...sizes.map((s) => s.w));
    const cellH = Math.max(...sizes.map((s) => s.h));
    const groupWidth = cols * cellW + (cols - 1) * GAP;

    placedGroups.push({ id: group.id, label: group.label, x: cursorX, y: MARGIN, width: groupWidth });

    group.items.forEach((item, index) => {
      const h = hashString(item.id);
      const col = index % cols;
      const row = Math.floor(index / cols);
      const jitterX = ((h % 21) - 10) * 1.2;
      const jitterY = (((h >> 5) % 21) - 10) * 1.2;
      const rotation = (((h >> 10) % 9) - 4) * 0.9;
      const x = cursorX + col * (cellW + GAP) + jitterX;
      const y = MARGIN + LABEL_SPACE + row * (cellH + GAP) + jitterY;
      cards[item.id] = { x, y, rotation };
      maxBottom = Math.max(maxBottom, y + cellH);
    });

    cursorX += groupWidth + GROUP_GAP;
  }

  return {
    cards,
    groups: placedGroups,
    width: cursorX - GROUP_GAP + MARGIN,
    height: maxBottom + MARGIN,
  };
}
