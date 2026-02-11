"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { useDesktop, type WindowState } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";

// ============================================================================
// WINDOW COMPONENT (Aqua Era OS X)
// ============================================================================
// Brushed metal title bar, classic traffic lights, soft drop shadow,
// rounded corners. Drag from title bar, resize from edges/corners.
// ============================================================================

interface WindowProps {
  windowState: WindowState;
  children: React.ReactNode;
}

type ResizeDirection =
  | "n" | "s" | "e" | "w"
  | "ne" | "nw" | "se" | "sw"
  | null;

const RESIZE_HANDLE_SIZE = 6;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;

export default function Window({ windowState, children }: WindowProps) {
  const { state, dispatch, closeWindow, minimizeWindow, toggleMaximize, focusWindow } = useDesktop();
  const { settings } = useSettings();
  const windowRef = useRef<HTMLDivElement>(null);
  const isFocused = state.focusedWindowId === windowState.id;

  // Drag state
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Resize state
  const isResizing = useRef(false);
  const resizeDir = useRef<ResizeDirection>(null);
  const resizeStart = useRef({ x: 0, y: 0, winX: 0, winY: 0, winW: 0, winH: 0 });

  // Closing animation
  const [isClosing, setIsClosing] = useState(false);

  const handleWindowPointerDown = useCallback(() => {
    if (!isFocused) focusWindow(windowState.id);
  }, [isFocused, focusWindow, windowState.id]);

  // -- DRAG --
  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (windowState.isMaximized) return;
      isDragging.current = true;
      dragOffset.current = { x: e.clientX - windowState.x, y: e.clientY - windowState.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
    },
    [windowState.x, windowState.y, windowState.isMaximized]
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      dispatch({
        type: "MOVE_WINDOW",
        payload: {
          id: windowState.id,
          x: e.clientX - dragOffset.current.x,
          y: Math.max(0, e.clientY - dragOffset.current.y),
        },
      });
    },
    [dispatch, windowState.id]
  );

  const handleDragEnd = useCallback(() => { isDragging.current = false; }, []);

  // -- RESIZE --
  const handleResizeStart = useCallback(
    (e: React.PointerEvent, direction: ResizeDirection) => {
      if (windowState.isMaximized) return;
      isResizing.current = true;
      resizeDir.current = direction;
      resizeStart.current = {
        x: e.clientX, y: e.clientY,
        winX: windowState.x, winY: windowState.y,
        winW: windowState.width, winH: windowState.height,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    },
    [windowState]
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
      if (dir.includes("w")) { const nw = Math.max(MIN_WIDTH, w - dx); x += w - nw; w = nw; }
      if (dir.includes("n")) { const nh = Math.max(MIN_HEIGHT, h - dy); y = Math.max(0, y + (h - nh)); h = nh; }
      dispatch({ type: "RESIZE_WINDOW", payload: { id: windowState.id, width: w, height: h, x, y } });
    },
    [dispatch, windowState.id]
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

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => closeWindow(windowState.id), 150);
  }, [closeWindow, windowState.id]);

  const handleTitleDoubleClick = useCallback(() => {
    toggleMaximize(windowState.id);
  }, [toggleMaximize, windowState.id]);

  if (windowState.isMinimized) return null;

  const cursorMap: Record<string, string> = {
    n: "cursor-n-resize", s: "cursor-s-resize",
    e: "cursor-e-resize", w: "cursor-w-resize",
    ne: "cursor-ne-resize", nw: "cursor-nw-resize",
    se: "cursor-se-resize", sw: "cursor-sw-resize",
  };

  const surfaceOpacity = settings.highContrast ? 0.98 : 0.92;

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label={windowState.title}
      className={`
        fixed select-none flex flex-col overflow-hidden
        ${windowState.isMaximized ? "rounded-none" : "rounded-lg"}
        ${isClosing ? "animate-window-close" : "animate-window-open"}
      `}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
        boxShadow: isFocused
          ? "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)"
          : "0 4px 16px rgba(0,0,0,0.2), 0 1px 4px rgba(0,0,0,0.1)",
        border: "1px solid rgba(0,0,0,0.3)",
      }}
      onPointerDown={handleWindowPointerDown}
    >
      {/* RESIZE HANDLES */}
      {!windowState.isMaximized && (
        <>
          {(["n","s","e","w","ne","nw","se","sw"] as ResizeDirection[]).map((dir) => {
            if (!dir) return null;
            const s: React.CSSProperties = { position: "absolute", zIndex: 10 };
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

      {/* AQUA TITLE BAR */}
      <div
        className={`
          flex items-center h-[26px] px-2 shrink-0
          ${windowState.isMaximized ? "" : "cursor-grab active:cursor-grabbing"}
        `}
        style={{
          background: isFocused
            ? "linear-gradient(180deg, #e8e8e8 0%, #d0d0d0 45%, #b8b8b8 50%, #c8c8c8 55%, #c0c0c0 100%)"
            : "linear-gradient(180deg, #f0f0f0 0%, #e0e0e0 45%, #d8d8d8 50%, #e0e0e0 55%, #dcdcdc 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.25)",
        }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onDoubleClick={handleTitleDoubleClick}
      >
        {/* Aqua traffic lights */}
        <div className="flex items-center gap-[7px] mr-3 z-20 aqua-buttons">
          <button onClick={handleClose} aria-label="Close window" className="aqua-btn aqua-close" />
          <button onClick={() => minimizeWindow(windowState.id)} aria-label="Minimize window" className="aqua-btn aqua-minimize" />
          <button onClick={() => toggleMaximize(windowState.id)} aria-label={windowState.isMaximized ? "Restore window" : "Maximize window"} className="aqua-btn aqua-zoom" />
        </div>

        {/* Title */}
        <div
          className="flex-1 text-center text-[11px] font-bold truncate pointer-events-none"
          style={{ color: isFocused ? "#222" : "#888", textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
        >
          {windowState.title}
        </div>

        <div className="w-[54px]" />
      </div>

      {/* WINDOW BODY */}
      <div
        className="flex-1 overflow-auto scrollbar-thin"
        style={{
          backgroundColor: `rgba(255,255,255,${surfaceOpacity})`,
          fontFamily: "var(--user-font-family, inherit)",
          fontSize: "var(--user-font-size, 14px)",
          lineHeight: "var(--user-line-height, 1.6)",
          color: settings.highContrast ? "#000" : "#1d1d1f",
        }}
      >
        {children}
      </div>
    </div>
  );
}
