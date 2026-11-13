import type { TopFood } from "@/data/notion/types";

// ============================================================================
// FOOD ROOM: geometry
// ============================================================================
// The room is laid out in a fixed logical space and positioned in percentages,
// so it scales with its container. There are two rooms: a wide one for
// desktops and tablets and a tall one for phones, where the foods and the
// avatar are drawn about twice as large so they can be tapped.
// ============================================================================

export interface Box {
  readonly x0: number;
  readonly x1: number;
  readonly y0: number;
  readonly y1: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface RoomGeometry {
  readonly w: number;
  readonly h: number;
  readonly floorTop: number;
  /** Table top as drawn. */
  readonly table: Box;
  /** Where the table legs end. */
  readonly tableBottom: number;
  /** Where the avatar cannot stand. */
  readonly block: Box;
  readonly board: Box;
  /** Where the avatar stands to read the board. */
  readonly boardSpot: Point;
  readonly start: Point;
  /** Sprite and avatar widths, in percent of the room width. */
  readonly spriteW: number;
  readonly avatarW: number;
  /** Foods per row on the table, and the y of each row's base line. */
  readonly rows: readonly number[];
  readonly rowYs: readonly number[];
  /** Space kept clear at each end of a row. */
  readonly rowInset: number;
  /** Decor, in percent of the room: [left, top, width, height]. */
  readonly window: readonly [number, number, number, number];
  readonly plant: readonly [number, number, number];
  /** Floor tile size as CSS background-size. */
  readonly tile: string;
}

export const WIDE_ROOM: RoomGeometry = {
  w: 1000,
  h: 625,
  floorTop: 262,
  table: { x0: 300, x1: 700, y0: 330, y1: 470 },
  tableBottom: 560,
  block: { x0: 290, x1: 710, y0: 320, y1: 560 },
  board: { x0: 60, x1: 340, y0: 34, y1: 214 },
  boardSpot: { x: 200, y: 300 },
  start: { x: 520, y: 590 },
  spriteW: 7.2,
  avatarW: 6.4,
  rows: [5, 5],
  rowYs: [395, 462],
  rowInset: 40,
  window: [70, 6, 20, 26],
  plant: [92, 24, 6],
  tile: "8% 12.8%",
};

export const TALL_ROOM: RoomGeometry = {
  w: 600,
  h: 800,
  floorTop: 250,
  table: { x0: 60, x1: 540, y0: 380, y1: 650 },
  tableBottom: 730,
  block: { x0: 50, x1: 550, y0: 368, y1: 730 },
  board: { x0: 28, x1: 330, y0: 30, y1: 196 },
  boardSpot: { x: 180, y: 305 },
  start: { x: 300, y: 786 },
  spriteW: 14,
  avatarW: 11,
  rows: [4, 3, 3],
  rowYs: [474, 552, 630],
  rowInset: 56,
  window: [62, 5, 30, 19],
  plant: [86, 17, 11],
  tile: "16.66% 12%",
};

export interface RoomItem {
  readonly id: string;
  readonly foods: readonly TopFood[];
  readonly x: number;
  readonly y: number;
}

export function maxOnTable(g: RoomGeometry): number {
  return g.rows.reduce((sum, n) => sum + n, 0);
}

/** Sets the most eaten foods out in rows on the table. */
export function layoutItems(foods: readonly TopFood[], g: RoomGeometry): RoomItem[] {
  const top = foods.slice(0, maxOnTable(g));
  const span = g.table.x1 - g.table.x0 - g.rowInset * 2;
  const items: RoomItem[] = [];
  let index = 0;
  g.rows.forEach((size, r) => {
    const row = top.slice(index, index + size);
    index += size;
    row.forEach((food, i) => {
      const x = g.table.x0 + g.rowInset + (row.length > 1 ? (span * i) / (row.length - 1) : span / 2);
      items.push({ id: food.key, foods: [food], x, y: g.rowYs[r] });
    });
  });
  return items;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function inBox(box: Box, x: number, y: number): boolean {
  return x > box.x0 && x < box.x1 && y > box.y0 && y < box.y1;
}

const BOARD_REACH = 110;

export function nearBoard(g: RoomGeometry, x: number, y: number): boolean {
  return Math.hypot(x - g.boardSpot.x, y - g.boardSpot.y) < BOARD_REACH;
}
