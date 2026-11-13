"use client";

import React, { useRef, useState } from "react";
import { useDesktop } from "@/hooks/useDesktopStore";

// ============================================================================
// DUO TRACKPAD
// ============================================================================
// The bottom screen as a trackpad for the top screen: slide to move the
// pointer, tap to click, and press and hold for a moment, then slide, to drag
// the window under the pointer by its title bar.
// ============================================================================

const HOLD_MS = 320;
const TAP_SLOP = 6;
const GAIN = 1.6;

export default function Trackpad({ topRect }: { topRect: { x: number; y: number; width: number; height: number } }) {
  const { state, dispatch } = useDesktop();
  const [cursor, setCursor] = useState({ x: topRect.width / 2, y: topRect.height / 2 });
  const [dragging, setDragging] = useState(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const dragWin = useRef<string | null>(null);

  function elementAtCursor(c = cursor): Element | null {
    return document.elementFromPoint(topRect.x + c.x, topRect.y + c.y);
  }

  function onDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
    moved.current = 0;
    holdTimer.current = window.setTimeout(() => {
      const el = elementAtCursor();
      const winEl = el?.closest("[data-window-id]") as HTMLElement | null;
      const win = winEl ? state.windows.find((w) => w.fsItemId === winEl.dataset.windowId) : undefined;
      if (win) {
        dragWin.current = win.id;
        setDragging(true);
      }
    }, HOLD_MS);
  }

  function onMove(e: React.PointerEvent) {
    if (!last.current) return;
    const dx = (e.clientX - last.current.x) * GAIN;
    const dy = (e.clientY - last.current.y) * GAIN;
    last.current = { x: e.clientX, y: e.clientY };
    moved.current += Math.abs(dx) + Math.abs(dy);
    if (moved.current > TAP_SLOP && holdTimer.current && !dragging) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setCursor((c) => ({
      x: Math.max(0, Math.min(topRect.width - 1, c.x + dx)),
      y: Math.max(0, Math.min(topRect.height - 1, c.y + dy)),
    }));
    if (dragging && dragWin.current) {
      const win = state.windows.find((w) => w.id === dragWin.current);
      if (win) dispatch({ type: "MOVE_WINDOW", payload: { id: win.id, x: win.x + dx, y: Math.max(22, win.y + dy) } });
    }
  }

  function onUp() {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (!dragging && moved.current <= TAP_SLOP) {
      const el = elementAtCursor() as HTMLElement | null;
      // Desktop icons open on double-click; everything else on click.
      const icon = el?.closest(".desktop-icon");
      if (icon) icon.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      else el?.click();
    }
    setDragging(false);
    dragWin.current = null;
    last.current = null;
  }

  return (
    <>
      <div
        className="duo-trackpad"
        role="application"
        aria-label="Trackpad for the top screen. Slide to move the pointer, tap to click, hold then slide to drag a window."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <span>{dragging ? "Dragging" : "Trackpad"}</span>
      </div>
      <span
        className="duo-cursor"
        aria-hidden="true"
        style={{ transform: `translate(${topRect.x + cursor.x}px, ${topRect.y + cursor.y}px)` }}
      />
    </>
  );
}
