"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NutritionDay, TopFood } from "@/data/notion/types";
import FoodSprite from "./FoodSprite";
import { foodKind } from "./foodKinds";
import { SAMPLE_FOODS } from "./sampleFoods";
import StatCard from "./StatCard";
import BoardDashboard from "./BoardDashboard";

// ============================================================================
// FOOD ROOM
// ============================================================================
// A small game-style room: my most eaten foods sit on a table as characters.
// Walk with the arrow keys or WASD (or tap the floor), drag foods onto each
// other to make a plate, tap one for its stat card, and walk to the board on
// the wall to open the food dashboard.
//
// Everything is laid out in a fixed 1000 x 625 logical space and positioned in
// percentages, so the room scales with its container.
// ============================================================================

const W = 1000;
const H = 625;
const FLOOR_TOP = 262;
const TABLE = { x0: 300, x1: 700, y0: 330, y1: 470 }; // table top, drawn
const TABLE_BLOCK = { x0: 290, x1: 710, y0: 320, y1: 560 }; // where the avatar can't stand
const BOARD = { x0: 60, x1: 340, y0: 34, y1: 214 };
const BOARD_SPOT = { x: 200, y: 300 };
const SPEED = 280; // logical units per second
const SPRITE_W = 7.2; // % of room width
const MAX_ON_TABLE = 10;

type Item = { id: string; foods: TopFood[]; x: number; y: number };

function layout(foods: TopFood[]): Item[] {
  const top = foods.slice(0, MAX_ON_TABLE);
  const rows = [top.slice(0, 5), top.slice(5)];
  const items: Item[] = [];
  rows.forEach((row, r) => {
    row.forEach((f, i) => {
      const span = TABLE.x1 - TABLE.x0 - 80;
      const x = TABLE.x0 + 40 + (row.length > 1 ? (span * i) / (row.length - 1) : span / 2);
      items.push({ id: f.key, foods: [f], x, y: r === 0 ? 395 : 462 });
    });
  });
  return items;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const inBlock = (x: number, y: number) =>
  x > TABLE_BLOCK.x0 && x < TABLE_BLOCK.x1 && y > TABLE_BLOCK.y0 && y < TABLE_BLOCK.y1;
const nearBoard = (x: number, y: number) => Math.hypot(x - BOARD_SPOT.x, y - BOARD_SPOT.y) < 110;

function Avatar({ facing, moving }: { facing: 1 | -1; moving: boolean }) {
  return (
    <svg viewBox="0 0 64 96" className={moving ? "food-room-bob" : undefined} style={{ width: "100%", overflow: "visible", transform: `scaleX(${facing})` }} aria-hidden="true">
      <ellipse cx={32} cy={93} rx={16} ry={3.5} fill="#000" opacity={0.18} />
      {/* legs */}
      <rect x={22} y={72} width={8} height={18} rx={3} fill="#2c3e50" />
      <rect x={34} y={72} width={8} height={18} rx={3} fill="#2c3e50" />
      {/* body */}
      <path d="M16 52 Q16 44 24 44 L40 44 Q48 44 48 52 L48 76 L16 76 Z" fill="#e4572e" stroke="#3b2a22" strokeWidth={2} />
      {/* head */}
      <circle cx={32} cy={28} r={20} fill="#f6d2b5" stroke="#3b2a22" strokeWidth={2} />
      <path d="M12 26 Q14 6 34 8 Q52 10 52 26 Q44 16 30 18 Q20 18 12 26 Z" fill="#4a3426" stroke="#3b2a22" strokeWidth={2} />
      {/* face (looks to the right; flipped with the body) */}
      <ellipse cx={30} cy={30} rx={2.6} ry={3.4} fill="#1f1530" />
      <ellipse cx={42} cy={30} rx={2.6} ry={3.4} fill="#1f1530" />
      <circle cx={29} cy={28.6} r={1} fill="#fff" />
      <circle cx={41} cy={28.6} r={1} fill="#fff" />
      <ellipse cx={26} cy={36} rx={2.6} ry={1.4} fill="#ff8fa3" opacity={0.7} />
      <path d="M33 37 Q36 39.5 39 37" fill="none" stroke="#3b2a22" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}

export default function FoodRoom() {
  const [foods, setFoods] = useState<TopFood[] | null>(null);
  const [sample, setSample] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [days, setDays] = useState<NutritionDay[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [avatar, setAvatar] = useState({ x: 520, y: 590, facing: 1 as 1 | -1, moving: false });
  const [card, setCard] = useState<string | null>(null);
  const [boardOpen, setBoardOpen] = useState(false);

  const roomRef = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const target = useRef<{ x: number; y: number; thenBoard?: boolean } | null>(null);
  const pos = useRef({ x: 520, y: 590 });
  const drag = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const overlayOpen = boardOpen || card != null;

  // ---- data ---------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      let rows: TopFood[] = [];
      try {
        const res = await fetch("/api/notion/data?dataset=top-foods");
        if (res.ok) {
          const json = await res.json();
          rows = (json.items ?? []) as TopFood[];
          if (alive) setSyncedAt(json.syncedAt ?? null);
        }
      } catch {
        /* fall through to sample data */
      }
      if (!alive) return;
      const useSample = rows.length === 0;
      const list = useSample ? SAMPLE_FOODS : [...rows].sort((a, b) => a.rank - b.rank);
      setSample(useSample);
      setFoods(list);
      setItems(layout(list));
    })();
    (async () => {
      try {
        const res = await fetch("/api/notion/data?dataset=nutrition");
        if (!res.ok) return; // 401 for everyone but me
        const json = await res.json();
        if (alive && Array.isArray(json.items) && json.items.length) setDays(json.items as NutritionDay[]);
      } catch {
        /* private or unavailable */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---- movement loop ------------------------------------------------------
  const avatarFacing = useRef<1 | -1>(1);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let dx = 0;
      let dy = 0;
      const k = keys.current;
      if (k.has("ArrowLeft") || k.has("a")) dx -= 1;
      if (k.has("ArrowRight") || k.has("d")) dx += 1;
      if (k.has("ArrowUp") || k.has("w")) dy -= 1;
      if (k.has("ArrowDown") || k.has("s")) dy += 1;
      if (dx || dy) target.current = null;

      const p = pos.current;
      const t = target.current;
      if (!dx && !dy && t) {
        const dist = Math.hypot(t.x - p.x, t.y - p.y);
        if (dist < 6) {
          target.current = null;
          if (t.thenBoard) setBoardOpen(true);
        } else {
          dx = (t.x - p.x) / dist;
          dy = (t.y - p.y) / dist;
        }
      }

      const moving = dx !== 0 || dy !== 0;
      if (moving) {
        const len = Math.hypot(dx, dy) || 1;
        let nx = clamp(p.x + (dx / len) * SPEED * dt, 30, W - 30);
        let ny = clamp(p.y + (dy / len) * SPEED * dt, FLOOR_TOP + 10, H - 12);
        if (inBlock(nx, ny)) {
          // slide along whichever axis is still free
          if (!inBlock(nx, p.y)) ny = p.y;
          else if (!inBlock(p.x, ny)) nx = p.x;
          else {
            nx = p.x;
            ny = p.y;
            target.current = null;
          }
        }
        pos.current = { x: nx, y: ny };
        setAvatar({ x: nx, y: ny, facing: dx < 0 ? -1 : dx > 0 ? 1 : (avatarFacing.current as 1 | -1), moving: true });
        if (dx) avatarFacing.current = dx < 0 ? -1 : 1;
      } else {
        setAvatar((a) => (a.moving ? { ...a, moving: false } : a));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- helpers ------------------------------------------------------------
  const toLogical = useCallback((clientX: number, clientY: number) => {
    const r = roomRef.current!.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * W, y: ((clientY - r.top) / r.height) * H };
  }, []);

  const goToBoard = useCallback(() => {
    if (nearBoard(pos.current.x, pos.current.y)) setBoardOpen(true);
    else target.current = { ...BOARD_SPOT, thenBoard: true };
  }, []);

  // ---- input --------------------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setCard(null);
      setBoardOpen(false);
      return;
    }
    if (overlayOpen) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"].includes(k)) {
      e.preventDefault();
      keys.current.add(k);
    }
    if ((k === "e" || k === "Enter") && nearBoard(pos.current.x, pos.current.y)) {
      e.preventDefault();
      setBoardOpen(true);
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    keys.current.delete(k);
  };

  const onFloorPointerDown = (e: React.PointerEvent) => {
    if (overlayOpen) return;
    roomRef.current?.focus();
    const p = toLogical(e.clientX, e.clientY);
    if (p.x >= BOARD.x0 && p.x <= BOARD.x1 && p.y >= BOARD.y0 && p.y <= BOARD.y1) {
      goToBoard();
      return;
    }
    target.current = { x: clamp(p.x, 30, W - 30), y: clamp(p.y, FLOOR_TOP + 10, H - 12) };
  };

  const onItemPointerDown = (e: React.PointerEvent, item: Item) => {
    e.stopPropagation();
    if (overlayOpen) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = toLogical(e.clientX, e.clientY);
    drag.current = { id: item.id, sx: p.x, sy: p.y, ox: item.x - p.x, oy: item.y - p.y, moved: false };
  };

  const onItemPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = toLogical(e.clientX, e.clientY);
    if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) < 8) return;
    d.moved = true;
    const x = clamp(p.x + d.ox, 30, W - 30);
    const y = clamp(p.y + d.oy, 80, H - 4);
    setItems((list) => list.map((it) => (it.id === d.id ? { ...it, x, y } : it)));
  };

  const onItemPointerUp = (item: Item) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (!d.moved) {
      setCard(item.id);
      return;
    }
    // Dropped on another food? Make a plate.
    setItems((list) => {
      const me = list.find((it) => it.id === d.id);
      if (!me) return list;
      const other = list.find((it) => it.id !== me.id && Math.hypot(it.x - me.x, it.y - me.y) < 60);
      if (!other) return list;
      const merged: Item = {
        id: `${other.id}+${me.id}`,
        foods: [...other.foods, ...me.foods].slice(0, 6),
        x: other.x,
        y: other.y,
      };
      setTimeout(() => setCard(merged.id), 0);
      return [...list.filter((it) => it.id !== me.id && it.id !== other.id), merged];
    });
  };

  const split = (id: string) => {
    setItems((list) => {
      const it = list.find((x) => x.id === id);
      if (!it) return list;
      const parts = it.foods.map((f, i) => ({ id: f.key, foods: [f], x: clamp(it.x + (i - (it.foods.length - 1) / 2) * 70, 30, W - 30), y: it.y }));
      return [...list.filter((x) => x.id !== id), ...parts];
    });
    setCard(null);
  };

  const reset = () => {
    if (foods) setItems(layout(foods));
    setCard(null);
  };

  const openItem = useMemo(() => items.find((it) => it.id === card) ?? null, [items, card]);
  const showBoardPrompt = !overlayOpen && nearBoard(avatar.x, avatar.y);
  const boardFoods = foods ?? [];

  // Draw back to front so lower things overlap higher ones.
  const sorted = [...items].sort((a, b) => a.y - b.y);
  const avatarLayer = Math.round(avatar.y);

  return (
    <div className="w-full">
      <style>{`
        @keyframes foodRoomBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3%) } }
        .food-room-bob { animation: foodRoomBob 0.32s ease-in-out infinite; }
        @keyframes foodRoomIdle { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4%) } }
        .food-room-idle { animation: foodRoomIdle 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .food-room-bob, .food-room-idle { animation: none; } }
      `}</style>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-desktop-text-secondary">
        <span>
          Walk with the arrow keys or WASD, or tap the floor. Drag foods onto each other to make a plate. Tap a food for its stats. Walk to the board for the dashboard.
        </span>
        <span className="flex items-center gap-2">
          {sample && <span className="rounded bg-desktop-surface px-1.5 py-0.5 font-medium">Sample data</span>}
          <button onClick={reset} className="rounded border border-desktop-border px-2 py-0.5 hover:bg-desktop-surface">Reset table</button>
          <button onClick={goToBoard} className="rounded border border-desktop-border px-2 py-0.5 hover:bg-desktop-surface">Open board</button>
        </span>
      </div>

      <div
        ref={roomRef}
        tabIndex={0}
        role="application"
        aria-label="Food room. Arrow keys to walk, E to read the board."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => keys.current.clear()}
        onPointerDown={onFloorPointerDown}
        className="relative w-full touch-none select-none overflow-hidden rounded-xl border border-desktop-border outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* wall */}
        <div className="absolute inset-x-0 top-0" style={{ height: `${(FLOOR_TOP / H) * 100}%`, background: "repeating-linear-gradient(90deg,#f7e6d0 0 38px,#f2dcc2 38px 40px)" }} />
        <div className="absolute inset-x-0" style={{ top: `${(FLOOR_TOP / H) * 100 - 1.5}%`, height: "1.5%", background: "#c89f74" }} />
        {/* floor */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            top: `${(FLOOR_TOP / H) * 100}%`,
            background:
              "repeating-conic-gradient(#e9d3b4 0% 25%, #dcc29d 0% 50%) 0 0 / 8% 12.8%",
          }}
        />

        {/* window */}
        <div className="absolute rounded-md border-4" style={{ left: "70%", top: "6%", width: "20%", height: "26%", borderColor: "#c89f74", background: "linear-gradient(#9ad1f5,#d9f0ff)" }}>
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2" style={{ background: "#c89f74" }} />
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2" style={{ background: "#c89f74" }} />
        </div>
        {/* plant */}
        <div className="absolute" style={{ left: "92%", top: "24%", width: "6%" }}>
          <svg viewBox="0 0 40 60" style={{ width: "100%" }} aria-hidden="true">
            <path d="M20 30 Q6 20 8 6 Q18 14 20 30 Q22 12 34 6 Q34 22 20 30" fill="#5cb85c" stroke="#2f6b2f" strokeWidth={1.5} />
            <path d="M10 30 L30 30 L27 56 L13 56 Z" fill="#c0634a" stroke="#3b2a22" strokeWidth={1.5} />
          </svg>
        </div>

        {/* board */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            goToBoard();
          }}
          className="absolute rounded-md border-[6px] text-left shadow-md transition-transform hover:scale-[1.02]"
          style={{
            left: `${(BOARD.x0 / W) * 100}%`,
            top: `${(BOARD.y0 / H) * 100}%`,
            width: `${((BOARD.x1 - BOARD.x0) / W) * 100}%`,
            height: `${((BOARD.y1 - BOARD.y0) / H) * 100}%`,
            borderColor: "#8a5a3c",
            background: "#2f4f3a",
          }}
          aria-label="Board: open the food dashboard"
        >
          <span className="absolute left-[6%] top-[6%] font-mono text-[clamp(7px,1.3vw,13px)] font-bold text-white/90">FOOD BOARD</span>
          <svg viewBox="0 0 100 50" className="absolute bottom-[8%] left-[6%] w-[88%]" aria-hidden="true">
            {boardFoods.slice(0, 6).map((f, i) => {
              const max = boardFoods[0]?.count || 1;
              const h = (f.count / max) * 40;
              return <rect key={f.key} x={i * 16 + 2} y={48 - h} width={11} height={h} fill={["#f2b705", "#e4572e", "#7ae582", "#4e8fd8", "#9b5de5", "#f3a712"][i]} rx={1.5} />;
            })}
          </svg>
        </button>

        {/* table */}
        <div className="absolute" style={{ left: `${(TABLE.x0 / W) * 100}%`, top: `${(TABLE.y0 / H) * 100}%`, width: `${((TABLE.x1 - TABLE.x0) / W) * 100}%`, height: `${((560 - TABLE.y0) / H) * 100}%` }}>
          <div className="absolute inset-x-[4%] bottom-0 top-[60%] flex justify-between">
            <div className="h-full w-[5%] rounded-b" style={{ background: "#7a4a2c" }} />
            <div className="h-full w-[5%] rounded-b" style={{ background: "#7a4a2c" }} />
          </div>
          <div className="absolute inset-x-0 top-0 rounded-[1.2rem]" style={{ height: "60%", background: "linear-gradient(#c98a55,#b06f3d)", boxShadow: "inset 0 -10px 0 #8f5530, 0 8px 14px rgba(0,0,0,.18)" }} />
        </div>

        {/* foods and avatar, drawn in depth order */}
        {sorted.map((item) => {
          const combo = item.foods.length > 1;
          const f = item.foods[0];
          return (
            <button
              key={item.id}
              type="button"
              onPointerDown={(e) => onItemPointerDown(e, item)}
              onPointerMove={onItemPointerMove}
              onPointerUp={() => onItemPointerUp(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setCard(item.id);
                }
              }}
              className="group absolute cursor-grab touch-none active:cursor-grabbing focus-visible:outline-none"
              style={{
                left: `${(item.x / W) * 100}%`,
                top: `${(item.y / H) * 100}%`,
                width: `${SPRITE_W * (combo ? 1.35 : 1)}%`,
                transform: "translate(-50%,-100%)",
                zIndex: Math.round(item.y),
              }}
              aria-label={combo ? `Plate: ${item.foods.map((x) => x.name).join(", ")}` : `${f.name}, eaten ${f.count} times`}
            >
              {combo ? (
                <span className="relative block">
                  <svg viewBox="0 0 80 30" className="absolute bottom-0 left-0 w-full" aria-hidden="true">
                    <ellipse cx={40} cy={22} rx={38} ry={7} fill="#fff" stroke="#3b2a22" strokeWidth={2} />
                  </svg>
                  <span className="relative flex justify-center -space-x-[30%]">
                    {item.foods.slice(0, 3).map((x) => (
                      <span key={x.key} className="block w-1/2">
                        <FoodSprite kind={foodKind(x.name)} size={64} className="h-auto w-full" />
                      </span>
                    ))}
                  </span>
                </span>
              ) : (
                <span className="food-room-idle block" style={{ animationDelay: `${(f.rank % 5) * 0.3}s` }}>
                  <FoodSprite kind={foodKind(f.name)} size={64} className="h-auto w-full" />
                </span>
              )}
              <span className="pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/65 px-1 text-[clamp(7px,1vw,11px)] text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {combo ? `${item.foods.length} foods` : f.name}
              </span>
            </button>
          );
        })}

        <div
          className="pointer-events-none absolute"
          style={{ left: `${(avatar.x / W) * 100}%`, top: `${(avatar.y / H) * 100}%`, width: "6.4%", transform: "translate(-50%,-100%)", zIndex: avatarLayer }}
        >
          <Avatar facing={avatar.facing} moving={avatar.moving} />
        </div>

        {showBoardPrompt && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              setBoardOpen(true);
            }}
            className="absolute z-[2000] rounded-md bg-black/75 px-2 py-1 text-[11px] font-medium text-white"
            style={{ left: `${(BOARD_SPOT.x / W) * 100}%`, top: `${((BOARD.y1 + 14) / H) * 100}%`, transform: "translateX(-50%)" }}
          >
            Read the board (E)
          </button>
        )}

        {foods === null && (
          <div className="absolute inset-0 z-[3000] grid place-items-center bg-black/10 text-xs text-desktop-text-secondary">Setting the table…</div>
        )}

        {overlayOpen && (
          <div
            className="absolute inset-0 z-[4000] grid place-items-center bg-black/40 p-2"
            onPointerDown={(e) => {
              e.stopPropagation();
              setCard(null);
              setBoardOpen(false);
            }}
          >
            {openItem && !boardOpen && (
              <StatCard
                foods={openItem.foods}
                onClose={() => setCard(null)}
                onSplit={openItem.foods.length > 1 ? () => split(openItem.id) : undefined}
              />
            )}
          </div>
        )}
      </div>

      {/* The dashboard is bigger than the room on a phone, so it opens over the page. */}
      {boardOpen && (
        <div className="fixed inset-0 z-[5000] grid place-items-center bg-black/50 p-2" onPointerDown={() => setBoardOpen(false)}>
          <BoardDashboard foods={boardFoods} days={days} sample={sample} syncedAt={syncedAt} onClose={() => setBoardOpen(false)} />
        </div>
      )}
    </div>
  );
}
