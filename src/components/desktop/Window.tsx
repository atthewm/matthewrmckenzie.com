"use client";

import React, { useCallback, useRef, useEffect, useState } from "react";
import { useDesktop, type WindowState } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";
import { useIsMobile } from "@/hooks/useIsMobile";

// ============================================================================
// WINDOW COMPONENT (Mac OS X 10.3 Panther Aqua)
// ============================================================================
// Brushed metal title bar with glossy gradient, rounded 10px corners,
// Aqua traffic lights with gloss highlight, soft drop shadow.
// Drag from title bar, resize from edges/corners.
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
  const isMobile = useIsMobile();

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

  // Mobile fullscreen: push history state when maximized, pop to exit
  useEffect(() => {
    if (!isMobile || !windowState.isMaximized) return;

    // Push a state so the browser back button can exit fullscreen
    const stateKey = { ui: "fullscreen", windowId: windowState.id };
    history.pushState(stateKey, "");

    const onPopState = () => {
      // Exit fullscreen on back
      dispatch({ type: "UNMAXIMIZE_WINDOW", payload: { id: windowState.id } });
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isMobile, windowState.isMaximized, windowState.id, dispatch]);

  const handleExitFullscreen = useCallback(() => {
    dispatch({ type: "UNMAXIMIZE_WINDOW", payload: { id: windowState.id } });
    // Also go back in history to clean up the pushed state
    if (isMobile) history.back();
  }, [dispatch, windowState.id, isMobile]);

  if (windowState.isMinimized) return null;

  const cursorMap: Record<string, string> = {
    n: "cursor-n-resize", s: "cursor-s-resize",
    e: "cursor-e-resize", w: "cursor-w-resize",
    ne: "cursor-ne-resize", nw: "cursor-nw-resize",
    se: "cursor-se-resize", sw: "cursor-sw-resize",
  };

  // Panther Aqua shadows
  const focusedShadow = "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)";
  const unfocusedShadow = "0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)";

  // Title bar gradient from CSS vars
  const titleBarBg = isFocused
    ? "var(--window-title-focused)"
    : "var(--window-title-unfocused)";

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label={windowState.title}
      className={`
        fixed select-none flex flex-col overflow-hidden
        ${windowState.isMaximized ? "rounded-none" : ""}
        ${isClosing ? "animate-window-close" : "animate-window-open"}
      `}
      style={{
        left: isMobile && !windowState.isMaximized
          ? Math.max(0, Math.min(windowState.x, window.innerWidth - Math.min(windowState.width, window.innerWidth - 4)))
          : windowState.x,
        top: isMobile && !windowState.isMaximized
          ? Math.max(22, Math.min(windowState.y, window.innerHeight - 120))
          : windowState.y,
        width: isMobile && !windowState.isMaximized
          ? Math.min(windowState.width, window.innerWidth - 4)
          : windowState.width,
        height: isMobile && !windowState.isMaximized
          ? Math.min(windowState.height, window.innerHeight - 94)
          : windowState.height,
        zIndex: windowState.zIndex,
        borderRadius: windowState.isMaximized ? 0 : 10,
        boxShadow: isFocused ? focusedShadow : unfocusedShadow,
        border: `0.5px solid ${isFocused ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.15)"}`,
      }}
      onPointerDown={handleWindowPointerDown}
    >
      {/* RESIZE HANDLES (hidden on mobile) */}
      {!windowState.isMaximized && !isMobile && (
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

      {/* TITLE BAR - Panther Aqua brushed metal */}
      <div
        className={`
          flex items-center ${isMobile ? "h-[32px]" : "h-[22px]"} px-2 shrink-0
          ${windowState.isMaximized ? "" : "cursor-grab active:cursor-grabbing"}
        `}
        style={{
          background: titleBarBg,
          borderBottom: `0.5px solid ${isFocused ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)"}`,
        }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onDoubleClick={handleTitleDoubleClick}
      >
        {/* Traffic lights - larger touch targets on mobile */}
        <div
          className={`flex items-center ${isMobile ? "gap-[10px]" : "gap-[8px]"} mr-3 z-20 ${isFocused ? "" : "aqua-buttons-unfocused"}`}
        >
          <button onClick={handleClose} aria-label="Close window" className={`aqua-btn aqua-close ${isMobile ? "aqua-btn-mobile" : ""}`} />
          <button onClick={() => minimizeWindow(windowState.id)} aria-label="Minimize window" className={`aqua-btn aqua-minimize ${isMobile ? "aqua-btn-mobile" : ""}`} />
          <button onClick={() => toggleMaximize(windowState.id)} aria-label={windowState.isMaximized ? "Restore window" : "Maximize window"} className={`aqua-btn aqua-zoom ${isMobile ? "aqua-btn-mobile" : ""}`} />
        </div>

        {/* Title */}
        <div
          className="flex-1 text-center text-[13px] font-semibold truncate pointer-events-none"
          style={{
            color: isFocused ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.35)",
            textShadow: isFocused ? "0 1px 0 rgba(255,255,255,0.5)" : "none",
          }}
        >
          {windowState.title}
        </div>

        {/* Exit fullscreen button on mobile */}
        {isMobile && windowState.isMaximized ? (
          <button
            onClick={handleExitFullscreen}
            className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded z-20
                       hover:bg-black/5 active:bg-black/10 transition-colors"
            style={{ color: isFocused ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)" }}
          >
            Exit
          </button>
        ) : (
          <div className="w-[54px]" />
        )}
      </div>

      {/* WINDOW BODY */}
      <div
        className="flex-1 overflow-auto scrollbar-thin"
        style={{
          backgroundColor: "var(--desktop-surface)",
          fontFamily: "var(--user-font-family, inherit)",
          fontSize: "var(--user-font-size, 13px)",
          lineHeight: "var(--user-line-height, 1.5)",
          color: "var(--desktop-text)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
