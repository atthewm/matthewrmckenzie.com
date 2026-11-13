"use client";

import React, { useCallback, useRef, useEffect, useLayoutEffect, useState } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useDesktop, type WindowState } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";
import { playWindowClose, playMinimize } from "@/lib/soundEffects";
import { springs, FADE, GENIE_DURATION, peekLaunchOrigin, dockRectFor, dockCenterRect, type OriginRect } from "@/lib/motion";
import { useExpose, setExpose, getExpose } from "@/lib/exposeStore";
import { Z_INDEX } from "@/lib/z-index";

// ============================================================================
// WINDOW (Aqua, remastered)
// ============================================================================
// Light metal title bar, gel traffic lights, token shadows. Motion:
//   open      zooms out of the icon or dock item that launched it
//   close     zooms back into that origin
//   minimize  a Genie (clip-path funnel plus transform) into the dock
//   Exposé    springs into a grid slot and back
// Only transform, opacity and clip-path animate. With reduced motion every
// one of these becomes a short crossfade.
// ============================================================================

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw" | null;

const RESIZE_HANDLE_SIZE = 6;
const RESIZE_HANDLE_Z_INDEX = 10;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const MENU_BAR = 22;
const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)";

/** Transform that maps the window's box onto a small origin rect. */
function towards(win: { x: number; y: number; width: number; height: number }, o: OriginRect) {
  const scale = Math.max(0.06, Math.min(o.width / win.width, o.height / win.height));
  return {
    x: o.x + o.width / 2 - (win.x + win.width / 2),
    y: o.y + o.height / 2 - (win.y + win.height / 2),
    scale,
  };
}

export default function Window({ windowState, children }: WindowProps) {
  const { state, dispatch, closeWindow, minimizeWindow, toggleMaximize, focusWindow } = useDesktop();
  const { settings } = useSettings();
  const reduceMotion = !!useReducedMotion() || settings.reduceMotion;
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const isFocused = state.focusedWindowId === windowState.id;
  const expose = useExpose();
  const slot = expose.active ? expose.slots[windowState.id] : undefined;

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isResizing = useRef(false);
  const resizeDir = useRef<ResizeDirection>(null);
  const resizeStart = useRef({ x: 0, y: 0, winX: 0, winY: 0, winW: 0, winH: 0 });
  const origin = useRef<OriginRect | undefined>(peekLaunchOrigin(windowState.fsItemId));
  const busy = useRef(false);
  const [minimizing, setMinimizing] = useState(false);
  const prevMinimized = useRef(windowState.isMinimized);
  const geometryRef = useRef({ x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height });
  geometryRef.current = { x: windowState.x, y: windowState.y, width: windowState.width, height: windowState.height };

  // OPEN: zoom out of the launch origin. The start pose is written straight to
  // the element before paint, so the window never flashes at full size.
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    if (reduceMotion) {
      el.style.opacity = "0";
      animate(el, { opacity: 1 }, FADE);
      return;
    }
    const o = origin.current;
    const from = o ? towards(geometryRef.current, o) : { x: 0, y: 12, scale: 0.92 };
    el.style.transform = `translateX(${from.x}px) translateY(${from.y}px) scale(${from.scale})`;
    el.style.opacity = o ? "0.6" : "0";
    animate(el, { x: [from.x, 0], y: [from.y, 0], scale: [from.scale, 1], opacity: 1 }, springs.window);
    // Mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // EXPOSÉ: spring into the grid slot, and back out.
  const hadSlot = useRef(false);
  useEffect(() => {
    const el = scope.current;
    if (!el || windowState.isMinimized || busy.current) return;
    const t = reduceMotion ? FADE : springs.window;
    if (slot) {
      hadSlot.current = true;
      animate(el, { x: slot.dx, y: slot.dy, scale: slot.scale }, t);
    } else if (hadSlot.current) {
      hadSlot.current = false;
      animate(el, { x: 0, y: 0, scale: 1 }, t);
    }
  }, [slot, animate, scope, reduceMotion, windowState.isMinimized]);

  const handleWindowPointerDown = useCallback(() => {
    if (getExpose().active) {
      focusWindow(windowState.id);
      setExpose({ active: false, slots: {} });
      return;
    }
    if (!isFocused) focusWindow(windowState.id);
  }, [isFocused, focusWindow, windowState.id]);

  // CLOSE: zoom back into the origin (or the dock item), then remove.
  const handleClose = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    if (settings.uiSoundsEnabled) playWindowClose();
    const el = scope.current;
    if (el) {
      if (reduceMotion) {
        await animate(el, { opacity: 0 }, FADE);
      } else {
        const target = origin.current ?? dockRectFor(windowState.fsItemId);
        const to = target ? towards(geometryRef.current, target) : { x: 0, y: 8, scale: 0.9 };
        await animate(el, { x: to.x, y: to.y, scale: to.scale, opacity: 0 }, { ...springs.window, opacity: { duration: 0.24 } });
      }
    }
    closeWindow(windowState.id);
  }, [animate, scope, closeWindow, windowState.id, windowState.fsItemId, reduceMotion, settings.uiSoundsEnabled]);

  // MINIMIZE: Genie into the dock.
  const genieFrames = useCallback(() => {
    const t = dockRectFor(windowState.fsItemId) ?? dockCenterRect();
    const g = geometryRef.current;
    const lx = ((t.x - g.x) / g.width) * 100;
    const rx = ((t.x + t.width - g.x) / g.width) * 100;
    const funnel = `polygon(0% 0%, 100% 0%, ${100 - (100 - rx) * 0.35}% 50%, ${rx}% 100%, ${lx}% 100%, ${lx * 0.35}% 50%)`;
    const pinch = `polygon(${lx * 0.8}% 0%, ${100 - (100 - rx) * 0.8}% 0%, ${rx}% 50%, ${rx}% 100%, ${lx}% 100%, ${lx}% 50%)`;
    const dy = t.y + t.height / 2 - (g.y + g.height);
    return { funnel, pinch, dy, scaleY: Math.max(0.05, t.height / g.height) };
  }, [windowState.fsItemId]);

  const handleMinimize = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    if (settings.uiSoundsEnabled) playMinimize();
    setMinimizing(true);
    const el = scope.current;
    if (el) {
      if (reduceMotion) {
        await animate(el, { opacity: 0 }, FADE);
      } else {
        const g = genieFrames();
        el.style.transformOrigin = "50% 100%";
        await animate(
          el,
          {
            clipPath: [FULL_CLIP, g.funnel, g.pinch],
            y: [0, g.dy * 0.15, g.dy],
            scaleY: [1, 0.85, g.scaleY],
            opacity: [1, 1, 0.15],
          },
          { duration: GENIE_DURATION, ease: [0.55, 0, 0.7, 1], times: [0, 0.45, 1] },
        );
      }
    }
    minimizeWindow(windowState.id);
    setMinimizing(false);
    busy.current = false;
  }, [animate, scope, genieFrames, minimizeWindow, windowState.id, reduceMotion, settings.uiSoundsEnabled]);

  // RESTORE: Genie back out of the dock.
  useLayoutEffect(() => {
    const was = prevMinimized.current;
    prevMinimized.current = windowState.isMinimized;
    if (!(was && !windowState.isMinimized)) return;
    const el = scope.current;
    if (!el) return;
    if (reduceMotion) {
      el.style.clipPath = FULL_CLIP;
      el.style.transform = "none";
      el.style.opacity = "0";
      animate(el, { opacity: 1 }, FADE);
      return;
    }
    const g = genieFrames();
    el.style.transformOrigin = "50% 100%";
    el.style.clipPath = g.pinch;
    animate(
      el,
      {
        clipPath: [g.pinch, g.funnel, FULL_CLIP],
        y: [g.dy, g.dy * 0.15, 0],
        scaleY: [g.scaleY, 0.85, 1],
        opacity: [0.15, 1, 1],
      },
      { duration: GENIE_DURATION, ease: [0.3, 0, 0.45, 1], times: [0, 0.55, 1] },
    ).then(() => {
      el.style.transformOrigin = "50% 50%";
    });
  }, [windowState.isMinimized, animate, scope, genieFrames, reduceMotion]);

  // FOCUS MANAGEMENT
  useEffect(() => {
    const el = scope.current;
    if (isFocused && el && !el.contains(document.activeElement)) {
      el.focus({ preventScroll: true });
    }
  }, [isFocused, scope]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (getExpose().active) return;
        e.stopPropagation();
        handleClose();
        return;
      }
      const el = scope.current;
      if (e.key !== "Tab" || !el) return;
      const focusable = el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [handleClose, scope],
  );

  // DRAG: direct manipulation, the window follows the pointer.
  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (windowState.isMaximized || getExpose().active) return;
      if ((e.target as HTMLElement).closest("button")) return;
      isDragging.current = true;
      dragOffset.current = { x: e.clientX - windowState.x, y: e.clientY - windowState.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [windowState.x, windowState.y, windowState.isMaximized],
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      dispatch({
        type: "MOVE_WINDOW",
        payload: {
          id: windowState.id,
          x: e.clientX - dragOffset.current.x,
          y: Math.max(MENU_BAR, e.clientY - dragOffset.current.y),
        },
      });
    },
    [dispatch, windowState.id],
  );

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // RESIZE
  const handleResizeStart = useCallback(
    (e: React.PointerEvent, direction: ResizeDirection) => {
      if (windowState.isMaximized) return;
      isResizing.current = true;
      resizeDir.current = direction;
      resizeStart.current = {
        x: e.clientX,
        y: e.clientY,
        winX: windowState.x,
        winY: windowState.y,
        winW: windowState.width,
        winH: windowState.height,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    },
    [windowState],
  );

  const handleResizeMove = useCallback(
    (e: PointerEvent) => {
      if (!isResizing.current || !resizeDir.current) return;
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
      const dir = resizeDir.current;
      let { winX: x, winY: y, winW: w, winH: h } = resizeStart.current;
      if (dir.includes("e")) w = Math.max(MIN_WIDTH, w + dx);
      if (dir.includes("s")) h = Math.max(MIN_HEIGHT, h + dy);
      if (dir.includes("w")) {
        const nw = Math.max(MIN_WIDTH, w - dx);
        x += w - nw;
        w = nw;
      }
      if (dir.includes("n")) {
        const nh = Math.max(MIN_HEIGHT, h - dy);
        y = Math.max(MENU_BAR, y + (h - nh));
        h = nh;
      }
      dispatch({ type: "RESIZE_WINDOW", payload: { id: windowState.id, width: w, height: h, x, y } });
    },
    [dispatch, windowState.id],
  );

  const handleResizeEnd = useCallback(() => {
    isResizing.current = false;
    resizeDir.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", handleResizeEnd);
    return () => {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);

  if (windowState.isMinimized && !minimizing) return null;

  const cursorMap: Record<string, string> = {
    n: "cursor-n-resize",
    s: "cursor-s-resize",
    e: "cursor-e-resize",
    w: "cursor-w-resize",
    ne: "cursor-ne-resize",
    nw: "cursor-nw-resize",
    se: "cursor-se-resize",
    sw: "cursor-sw-resize",
  };

  return (
    <motion.div
      ref={scope}
      role="dialog"
      aria-label={windowState.title}
      tabIndex={-1}
      data-window-id={windowState.fsItemId}
      onKeyDown={handleKeyDown}
      className="fixed select-none flex flex-col overflow-hidden outline-none"
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: slot ? Z_INDEX.expose + 1 + slot.order : windowState.zIndex,
        borderRadius: windowState.isMaximized ? 0 : "var(--radius-window)",
        boxShadow: isFocused ? "var(--shadow-window)" : "var(--shadow-window-inactive)",
        border: "1px solid var(--border)",
        background: "var(--window-bg)",
      }}
      onPointerDown={handleWindowPointerDown}
    >
      {!windowState.isMaximized && (
        <>
          {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as ResizeDirection[]).map((dir) => {
            if (!dir) return null;
            const s: React.CSSProperties = { position: "absolute", zIndex: RESIZE_HANDLE_Z_INDEX };
            if (dir.includes("n")) { s.top = 0; s.height = RESIZE_HANDLE_SIZE; }
            if (dir.includes("s")) { s.bottom = 0; s.height = RESIZE_HANDLE_SIZE; }
            if (dir.includes("e")) { s.right = 0; s.width = RESIZE_HANDLE_SIZE; }
            if (dir.includes("w")) { s.left = 0; s.width = RESIZE_HANDLE_SIZE; }
            if (dir === "n" || dir === "s") { s.left = RESIZE_HANDLE_SIZE; s.right = RESIZE_HANDLE_SIZE; }
            if (dir === "e" || dir === "w") { s.top = RESIZE_HANDLE_SIZE; s.bottom = RESIZE_HANDLE_SIZE; }
            if (dir === "ne" || dir === "nw") { s.top = 0; s.height = RESIZE_HANDLE_SIZE * 2; }
            if (dir === "se" || dir === "sw") { s.bottom = 0; s.height = RESIZE_HANDLE_SIZE * 2; }
            if (dir === "ne" || dir === "se") { s.right = 0; s.width = RESIZE_HANDLE_SIZE * 2; }
            if (dir === "nw" || dir === "sw") { s.left = 0; s.width = RESIZE_HANDLE_SIZE * 2; }
            return <div key={dir} className={cursorMap[dir]} style={s} onPointerDown={(e) => handleResizeStart(e, dir)} />;
          })}
        </>
      )}

      <div
        className={`window-titlebar flex items-center px-2.5 shrink-0 ${windowState.isMaximized ? "" : "cursor-grab active:cursor-grabbing"}`}
        style={{
          height: "var(--titlebar-h)",
          background: isFocused ? "var(--titlebar)" : "var(--titlebar-inactive)",
          borderBottom: "1px solid var(--border)",
          touchAction: "none",
        }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onDoubleClick={() => toggleMaximize(windowState.id)}
      >
        <div className={`traffic mr-3 z-20 ${isFocused ? "" : "is-inactive"}`}>
          <button onClick={handleClose} aria-label="Close window" className="traffic-light is-close" />
          <button onClick={handleMinimize} aria-label="Minimize window" className="traffic-light is-min" />
          <button
            onClick={() => toggleMaximize(windowState.id)}
            aria-label={windowState.isMaximized ? "Restore window" : "Zoom window"}
            className="traffic-light is-zoom"
          />
        </div>
        <div
          className="flex-1 text-center text-[13px] font-semibold truncate pointer-events-none"
          style={{ color: isFocused ? "var(--titlebar-text)" : "var(--titlebar-text-inactive)" }}
        >
          {windowState.title}
        </div>
        <div className="w-[60px]" />
      </div>

      <div
        className="window-body flex-1 overflow-auto scrollbar-thin"
        style={{
          background: "var(--paper)",
          fontFamily: "var(--user-font-family)",
          fontSize: "var(--user-font-size)",
          lineHeight: "var(--user-line-height)",
          color: "var(--text)",
          pointerEvents: slot ? "none" : undefined,
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
