"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FSItem } from "@/data/fs";
import { getRootItems } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useBoardCamera, zoomAround, type Camera } from "@/hooks/useBoardCamera";
import { BOARD_MARGIN, buildGroups, cardKind, computeLayout, hashString } from "@/lib/boardLayout";
import { packItem } from "@/lib/boardExport";
import { clearSaved, readSaved, writeSaved, type Point } from "@/lib/boardStorage";
import { getBoardTheme, PIN_COLORS } from "@/config/boards";
import BoardCard from "./BoardCard";
import Backpack from "./Backpack";
import BoardToolbar from "./BoardToolbar";

// ============================================================================
// BOARD VIEW
// ============================================================================
// Replaces the Finder folder window. Items are pinned to a themed surface;
// visitors pan (drag the board), zoom (scroll or pinch), rearrange (drag a
// card), open (click a card), and download (drop a card in the backpack).
// Card positions are a per-visitor convenience saved in localStorage.
// ============================================================================

interface BoardViewProps {
  item: FSItem;
  contentMap: Record<string, string>;
  /** Desktop window hosting this board, so switching boards replaces it. */
  windowId?: string;
  /** Override how an item opens (the phone view manages its own stack). */
  onOpen?: (item: FSItem) => void;
}

interface CardDrag {
  kind: "card";
  id: string;
  pointerId: number;
  start: Point;
  origin: Point;
  moved: boolean;
}
interface PanDrag {
  kind: "pan";
  start: Point;
  origin: Camera;
}
interface PinchDrag {
  kind: "pinch";
  startDist: number;
  startMid: Point;
  origin: Camera;
}
type Gesture = CardDrag | PanDrag | PinchDrag | null;

const DRAG_THRESHOLD = 5;
const KEY_PAN_STEP = 80;
const KEY_NUDGE_STEP = 12;
const TOAST_MS = 2800;

function distance(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export default function BoardView({ item: board, contentMap, windowId, onOpen }: BoardViewProps) {
  const { openItem, closeWindow } = useDesktop();
  const reducedMotion = useReducedMotion();
  const theme = getBoardTheme(board.id);

  const groups = useMemo(() => buildGroups(board), [board]);
  const layout = useMemo(() => computeLayout(groups), [groups]);
  const items = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const backpackRef = useRef<HTMLDivElement>(null);
  const { camera, cameraRef, setCamera, fit, reset, zoomBy, panBy } = useBoardCamera(viewportRef, layout, BOARD_MARGIN);

  const [positions, setPositions] = useState<Record<string, Point>>({});
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const [zOrder, setZOrder] = useState<string[]>(() => items.map((i) => i.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overBackpack, setOverBackpack] = useState(false);
  const [gulping, setGulping] = useState(false);
  const [packedCount, setPackedCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  const gesture = useRef<Gesture>(null);
  const pointers = useRef(new Map<number, Point>());

  useEffect(() => {
    setPositions(readSaved(board.id));
  }, [board.id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const positionOf = useCallback(
    (id: string): Point => positionsRef.current[id] ?? layout.cards[id] ?? { x: 0, y: 0 },
    [layout],
  );

  const bringToFront = useCallback((id: string) => {
    setZOrder((order) => [...order.filter((o) => o !== id), id]);
  }, []);

  const open = useCallback(
    (target: FSItem) => {
      if (onOpen) return onOpen(target);
      if (target.type === "link" && target.href) {
        window.open(target.href, "_blank", "noopener,noreferrer");
        return;
      }
      openItem(target);
    },
    [onOpen, openItem],
  );

  const pack = useCallback(
    async (target: FSItem) => {
      const result = await packItem(target, contentMap);
      if (result.ok) {
        setPackedCount((n) => n + 1);
        setGulping(true);
        setTimeout(() => setGulping(false), 600);
        setToast(`Packed ${result.filename}`);
      } else {
        setToast(result.reason);
      }
    },
    [contentMap],
  );

  const commitPosition = useCallback(
    (id: string, point: Point) => {
      setPositions((prev) => {
        const next = { ...prev, [id]: point };
        writeSaved(board.id, next);
        return next;
      });
    },
    [board.id],
  );

  const isOverBackpack = (clientX: number, clientY: number) => {
    const rect = backpackRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const pad = 16;
    return clientX > rect.left - pad && clientX < rect.right + pad && clientY > rect.top - pad && clientY < rect.bottom + pad;
  };

  const localPoint = (e: React.PointerEvent): Point => {
    const rect = viewportRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    gesture.current = {
      kind: "pinch",
      startDist: Math.max(1, distance(a, b)),
      startMid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      origin: cameraRef.current,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-board-ui]")) return;
    viewportRef.current?.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, localPoint(e));

    const current = gesture.current;
    if (pointers.current.size === 2) {
      // A second finger turns any drag into a pinch; a lifted card snaps back.
      if (current?.kind === "card") {
        setPositions((p) => ({ ...p, [current.id]: current.origin }));
        setDraggingId(null);
      }
      startPinch();
      return;
    }
    if (pointers.current.size > 2) return;

    const cardEl = target.closest<HTMLElement>("[data-card-id]");
    if (cardEl) {
      const id = cardEl.dataset.cardId!;
      gesture.current = { kind: "card", id, pointerId: e.pointerId, start: { x: e.clientX, y: e.clientY }, origin: positionOf(id), moved: false };
      bringToFront(id);
      return;
    }
    gesture.current = { kind: "pan", start: { x: e.clientX, y: e.clientY }, origin: cameraRef.current };
    setIsPanning(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, localPoint(e));
    const g = gesture.current;
    if (!g) return;

    if (g.kind === "pinch" && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const shifted = { ...g.origin, x: g.origin.x + mid.x - g.startMid.x, y: g.origin.y + mid.y - g.startMid.y };
      setCamera(zoomAround(shifted, mid.x, mid.y, g.origin.scale * (distance(a, b) / g.startDist)));
      return;
    }
    if (g.kind === "pan") {
      setCamera({ ...g.origin, x: g.origin.x + e.clientX - g.start.x, y: g.origin.y + e.clientY - g.start.y });
      return;
    }
    if (g.kind === "card" && e.pointerId === g.pointerId) {
      const dx = e.clientX - g.start.x;
      const dy = e.clientY - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!g.moved) {
        g.moved = true;
        setDraggingId(g.id);
      }
      const scale = cameraRef.current.scale;
      setPositions((p) => ({ ...p, [g.id]: { x: g.origin.x + dx / scale, y: g.origin.y + dy / scale } }));
      setOverBackpack(isOverBackpack(e.clientX, e.clientY));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const g = gesture.current;

    if (g?.kind === "pinch") {
      // Keep panning with the remaining finger instead of jumping.
      const rest = [...pointers.current.values()][0];
      gesture.current = rest ? { kind: "pan", start: rest, origin: cameraRef.current } : null;
      return;
    }
    gesture.current = null;
    setIsPanning(false);

    if (g?.kind === "card") {
      const target = itemById.get(g.id);
      setDraggingId(null);
      setOverBackpack(false);
      if (!target) return;
      if (!g.moved) {
        open(target);
        return;
      }
      if (isOverBackpack(e.clientX, e.clientY)) {
        setPositions((p) => ({ ...p, [g.id]: g.origin }));
        void pack(target);
        return;
      }
      commitPosition(g.id, positionsRef.current[g.id] ?? g.origin);
    }
  };

  const handleCardKey = useCallback(
    (e: React.KeyboardEvent, target: FSItem) => {
      const nudges: Record<string, Point> = {
        ArrowLeft: { x: -KEY_NUDGE_STEP, y: 0 },
        ArrowRight: { x: KEY_NUDGE_STEP, y: 0 },
        ArrowUp: { x: 0, y: -KEY_NUDGE_STEP },
        ArrowDown: { x: 0, y: KEY_NUDGE_STEP },
      };
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(target);
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        void pack(target);
      } else if (nudges[e.key]) {
        e.preventDefault();
        e.stopPropagation();
        const p = positionOf(target.id);
        commitPosition(target.id, { x: p.x + nudges[e.key].x, y: p.y + nudges[e.key].y });
      }
    },
    [open, pack, positionOf, commitPosition],
  );

  const handleViewportKey = (e: React.KeyboardEvent) => {
    if (e.target !== viewportRef.current) return;
    const pans: Record<string, Point> = {
      ArrowLeft: { x: KEY_PAN_STEP, y: 0 },
      ArrowRight: { x: -KEY_PAN_STEP, y: 0 },
      ArrowUp: { x: 0, y: KEY_PAN_STEP },
      ArrowDown: { x: 0, y: -KEY_PAN_STEP },
    };
    if (e.key === "+" || e.key === "=") zoomBy(1.2);
    else if (e.key === "-" || e.key === "_") zoomBy(1 / 1.2);
    else if (e.key === "0") fit();
    else if (pans[e.key]) panBy(pans[e.key].x, pans[e.key].y);
    else return;
    e.preventDefault();
  };

  const tidyUp = () => {
    clearSaved(board.id);
    setPositions({});
    reset();
  };

  const switchBoard = (next: FSItem) => {
    if (next.id === board.id) return;
    open(next);
    if (!onOpen && windowId) closeWindow(windowId);
  };

  const boards = getRootItems().filter((i) => i.type === "folder");

  return (
    <div className="board flex flex-col h-full" data-surface={theme.surface}>
      <BoardToolbar
        boards={boards}
        currentId={board.id}
        tagline={theme.tagline}
        scale={camera.scale}
        onSwitch={switchBoard}
        onZoomIn={() => zoomBy(1.2)}
        onZoomOut={() => zoomBy(1 / 1.2)}
        onFit={fit}
        onTidy={tidyUp}
      />

      <div
        ref={viewportRef}
        className={`board-viewport ${isPanning ? "is-panning" : ""} ${reducedMotion ? "reduce-motion" : ""}`}
        style={
          {
            "--board-x": `${camera.x}px`,
            "--board-y": `${camera.y}px`,
            "--board-scale": camera.scale,
          } as React.CSSProperties
        }
        tabIndex={0}
        role="region"
        aria-label={`${board.name} board. Arrow keys pan, plus and minus zoom, 0 fits the board. Tab to reach pinned cards.`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleViewportKey}
      >
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <radialGradient id="board-pin-shine" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.25)" />
            </radialGradient>
          </defs>
        </svg>

        <div
          className="board-world"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
          }}
        >
          {layout.groups.map((g) => (
            <div key={g.id} className="board-group-head" style={{ width: g.width, transform: `translate(${g.x}px, ${g.y}px)` }}>
              <h2 className="board-group-label">
                {g.label}
                <span className="board-group-count">{g.count}</span>
              </h2>
            </div>
          ))}

          {items.map((child) => {
            const kind = cardKind(child);
            const base = layout.cards[child.id];
            const pos = positions[child.id] ?? base;
            const h = hashString(child.id);
            return (
              <BoardCard
                key={child.id}
                item={child}
                kind={kind}
                x={pos.x}
                y={pos.y}
                rotation={base.rotation}
                z={zOrder.indexOf(child.id) + 2}
                fastener={theme.fastener}
                pinColor={PIN_COLORS[h % PIN_COLORS.length]}
                isDragging={draggingId === child.id}
                isOverBackpack={draggingId === child.id && overBackpack}
                onKeyDown={handleCardKey}
              />
            );
          })}
        </div>

        <Backpack ref={backpackRef} isOpen={draggingId !== null} isHot={overBackpack} isGulping={gulping} packedCount={packedCount} />

        <p className="board-hint" data-board-ui>
          Scroll to zoom · Drag the board to pan · Drag a card into the backpack to download it
        </p>

        <div className="board-toast" role="status" aria-live="polite" data-visible={toast ? "true" : "false"}>
          {toast}
        </div>
      </div>
    </div>
  );
}
