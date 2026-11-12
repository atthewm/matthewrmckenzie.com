"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NutritionDay, TopFood } from "@/data/notion/types";
import FoodSprite from "./FoodSprite";
import { foodKind } from "./foodKinds";
import { SAMPLE_FOODS } from "./sampleFoods";
import StatCard from "./StatCard";
import BoardDashboard from "./BoardDashboard";
import Avatar from "./Avatar";
import RoomScene from "./RoomScene";
import { useCompactRoom } from "./useCompactRoom";
import { TALL_ROOM, WIDE_ROOM, clamp, inBox, layoutItems, nearBoard, type RoomItem } from "./roomGeometry";

// ============================================================================
// FOOD ROOM
// ============================================================================
// A small game-style room: my most eaten foods sit on a table as characters.
// Walk with the arrow keys or WASD, or tap the floor. Tap a food for its stat
// card, drag foods onto each other to make a plate, and walk to the board on
// the wall (or press "Open board") for the food dashboard.
//
// Diet only: the data is the public top-foods rollup from the Notion meal log.
// The room has a wide layout and a tall one for phones (see roomGeometry.ts).
// ============================================================================

const SPEED = 280; // logical units per second
const EDGE = 30; // how close the avatar can get to the side walls
const DRAG_START = 8; // movement before a press counts as a drag
const MERGE_REACH = 60; // drop distance that makes a plate
const MOVE_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "w", "a", "s", "d"];

type Target = { x: number; y: number; thenBoard?: boolean };
type Drag = { id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean };

async function loadTopFoods(): Promise<{ rows: TopFood[]; syncedAt: string | null }> {
  const res = await fetch("/api/notion/data?dataset=top-foods");
  if (!res.ok) throw new Error(`top-foods responded ${res.status}`);
  const json: unknown = await res.json();
  const body = (typeof json === "object" && json !== null ? json : {}) as { items?: unknown; syncedAt?: unknown };
  const rows = Array.isArray(body.items) ? (body.items as TopFood[]).filter((f) => f && typeof f.name === "string") : [];
  return { rows, syncedAt: typeof body.syncedAt === "string" ? body.syncedAt : null };
}

export default function FoodRoom() {
  const compact = useCompactRoom();
  const g = compact ? TALL_ROOM : WIDE_ROOM;
  const geometry = useRef(g);

  const [foods, setFoods] = useState<TopFood[] | null>(null);
  const [sample, setSample] = useState(false);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [days, setDays] = useState<NutritionDay[] | null>(null);
  const [items, setItems] = useState<RoomItem[]>([]);
  const [avatar, setAvatar] = useState({ x: g.start.x, y: g.start.y, facing: 1 as 1 | -1, moving: false });
  const [card, setCard] = useState<string | null>(null);
  const [boardOpen, setBoardOpen] = useState(false);

  const roomRef = useRef<HTMLDivElement>(null);
  const keys = useRef(new Set<string>());
  const target = useRef<Target | null>(null);
  const pos = useRef({ x: g.start.x, y: g.start.y });
  const facing = useRef<1 | -1>(1);
  const drag = useRef<Drag | null>(null);
  const overlayOpen = boardOpen || card != null;

  const closeOverlays = useCallback(() => {
    setCard(null);
    setBoardOpen(false);
    roomRef.current?.focus({ preventScroll: true });
  }, []);

  // ---- data ---------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    loadTopFoods()
      .catch(() => ({ rows: [] as TopFood[], syncedAt: null })) // fall back to the labeled sample data
      .then(({ rows, syncedAt: synced }) => {
        if (!alive) return;
        const useSample = rows.length === 0;
        setSample(useSample);
        setSyncedAt(synced);
        setFoods(useSample ? SAMPLE_FOODS : [...rows].sort((a, b) => a.rank - b.rank));
      });
    // The daily log is private: this is a 401 for everyone but the signed-in owner.
    fetch("/api/notion/data?dataset=nutrition")
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { items?: unknown } | null) => {
        if (alive && json && Array.isArray(json.items) && json.items.length) setDays(json.items as NutritionDay[]);
      })
      .catch(() => undefined); // private or unavailable: the board says so
    return () => {
      alive = false;
    };
  }, []);

  // Set the table whenever the foods arrive or the room switches layout.
  useEffect(() => {
    geometry.current = g;
    target.current = null;
    pos.current = { x: g.start.x, y: g.start.y };
    setAvatar({ x: g.start.x, y: g.start.y, facing: 1, moving: false });
    setItems(foods ? layoutItems(foods, g) : []);
    setCard(null);
  }, [g, foods]);

  // Escape closes the stat card and the board wherever the focus is.
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOverlays();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [overlayOpen, closeOverlays]);

  // ---- movement loop ------------------------------------------------------
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const room = geometry.current;
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

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        let nx = clamp(p.x + (dx / len) * SPEED * dt, EDGE, room.w - EDGE);
        let ny = clamp(p.y + (dy / len) * SPEED * dt, room.floorTop + 10, room.h - 12);
        if (inBox(room.block, nx, ny)) {
          // slide along whichever axis is still free
          if (!inBox(room.block, nx, p.y)) ny = p.y;
          else if (!inBox(room.block, p.x, ny)) nx = p.x;
          else {
            nx = p.x;
            ny = p.y;
            target.current = null;
          }
        }
        if (dx) facing.current = dx < 0 ? -1 : 1;
        pos.current = { x: nx, y: ny };
        setAvatar({ x: nx, y: ny, facing: facing.current, moving: true });
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
    const el = roomRef.current;
    const room = geometry.current;
    if (!el) return { x: room.start.x, y: room.start.y };
    const r = el.getBoundingClientRect();
    return { x: ((clientX - r.left) / r.width) * room.w, y: ((clientY - r.top) / r.height) * room.h };
  }, []);

  const goToBoard = useCallback(() => {
    const room = geometry.current;
    if (nearBoard(room, pos.current.x, pos.current.y)) setBoardOpen(true);
    else target.current = { ...room.boardSpot, thenBoard: true };
  }, []);

  // ---- input --------------------------------------------------------------
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (overlayOpen) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (MOVE_KEYS.includes(k)) {
      e.preventDefault();
      keys.current.add(k);
    }
    if ((k === "e" || k === "Enter") && e.target === roomRef.current && nearBoard(g, pos.current.x, pos.current.y)) {
      e.preventDefault();
      setBoardOpen(true);
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  };

  // A tap or click on the floor walks there. Using click (not pointerdown)
  // means a finger that starts a page scroll inside the room does not move
  // the avatar.
  const onFloorClick = (e: React.MouseEvent) => {
    if (overlayOpen) return;
    roomRef.current?.focus({ preventScroll: true });
    const p = toLogical(e.clientX, e.clientY);
    target.current = { x: clamp(p.x, EDGE, g.w - EDGE), y: clamp(p.y, g.floorTop + 10, g.h - 12) };
  };

  const onItemPointerDown = (e: React.PointerEvent, item: RoomItem) => {
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
    if (!d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) < DRAG_START) return;
    d.moved = true;
    const x = clamp(p.x + d.ox, EDGE, g.w - EDGE);
    const y = clamp(p.y + d.oy, 80, g.h - 4);
    setItems((list) => list.map((it) => (it.id === d.id ? { ...it, x, y } : it)));
  };

  const onItemPointerUp = (item: RoomItem) => {
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
      const other = list.find((it) => it.id !== me.id && Math.hypot(it.x - me.x, it.y - me.y) < MERGE_REACH);
      if (!other) return list;
      const merged: RoomItem = {
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
      const gap = (g.spriteW / 100) * g.w;
      const parts = it.foods.map((f, i) => ({
        id: f.key,
        foods: [f],
        x: clamp(it.x + (i - (it.foods.length - 1) / 2) * gap, EDGE, g.w - EDGE),
        y: it.y,
      }));
      return [...list.filter((x) => x.id !== id), ...parts];
    });
    setCard(null);
  };

  const reset = () => {
    if (foods) setItems(layoutItems(foods, g));
    setCard(null);
  };

  const openItem = useMemo(() => items.find((it) => it.id === card) ?? null, [items, card]);
  const showBoardPrompt = !overlayOpen && nearBoard(g, avatar.x, avatar.y);
  const boardFoods = foods ?? [];
  // Draw back to front so lower things overlap higher ones.
  const sorted = [...items].sort((a, b) => a.y - b.y);

  return (
    <div className="w-full">
      <div className="food-room-bar">
        <p className="food-room-hint">
          <span className="only-phone">Tap the floor to walk. Tap a food for its stats. Drag one food onto another to make a plate.</span>
          <span className="only-wide">Arrow keys or WASD to walk, or click the floor. Click a food for its stats. Drag one food onto another to make a plate. Press E at the board.</span>
        </p>
        <div className="food-room-actions">
          {sample && <span className="food-room-tag">Sample data</span>}
          <button type="button" onClick={reset} className="site-btn site-btn-ghost">
            Reset table
          </button>
          <button type="button" onClick={() => setBoardOpen(true)} className="site-btn site-btn-primary">
            Open board
          </button>
        </div>
      </div>

      <div
        ref={roomRef}
        tabIndex={0}
        role="application"
        aria-label="Food room. Arrow keys to walk, E to read the board."
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={() => keys.current.clear()}
        onClick={onFloorClick}
        className="food-room"
        style={{ aspectRatio: `${g.w} / ${g.h}` }}
      >
        <RoomScene g={g} boardFoods={boardFoods} onBoard={goToBoard} />

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
              onPointerCancel={() => {
                drag.current = null;
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  setCard(item.id);
                }
              }}
              className="food-room-item group"
              style={{
                left: `${(item.x / g.w) * 100}%`,
                top: `${(item.y / g.h) * 100}%`,
                width: `${g.spriteW * (combo ? 1.35 : 1)}%`,
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
              <span className="food-room-label">{combo ? `${item.foods.length} foods` : f.name}</span>
            </button>
          );
        })}

        <div
          className="pointer-events-none absolute"
          style={{
            left: `${(avatar.x / g.w) * 100}%`,
            top: `${(avatar.y / g.h) * 100}%`,
            width: `${g.avatarW}%`,
            transform: "translate(-50%,-100%)",
            zIndex: Math.round(avatar.y),
          }}
        >
          <Avatar facing={avatar.facing} moving={avatar.moving} />
        </div>

        {showBoardPrompt && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBoardOpen(true);
            }}
            className="food-room-prompt"
            style={{ left: `${(g.boardSpot.x / g.w) * 100}%`, top: `${((g.board.y1 + 14) / g.h) * 100}%` }}
          >
            Read the board<span className="only-wide"> (E)</span>
          </button>
        )}

        {foods === null && <div className="food-room-loading">Setting the table</div>}
      </div>

      {/* The card and the board open over the page, so they fit on a phone. */}
      {overlayOpen && (
        <div className="food-room-veil" onClick={closeOverlays}>
          {boardOpen ? (
            <BoardDashboard foods={boardFoods} days={days} sample={sample} syncedAt={syncedAt} onClose={closeOverlays} />
          ) : openItem ? (
            <StatCard
              foods={[...openItem.foods]}
              onClose={closeOverlays}
              onSplit={openItem.foods.length > 1 ? () => split(openItem.id) : undefined}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
