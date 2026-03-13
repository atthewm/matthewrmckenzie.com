"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import { useDesktop, type WindowState } from "@/hooks/useDesktopStore";
import { getPantherIconPath } from "./PantherIcons";

// ============================================================================
// EXPOSÉ (Mac OS X 10.3 Panther)
// ============================================================================
// F9 / Ctrl+Down: Show all open windows as scaled thumbnails.
// Click a thumbnail to focus & exit Exposé. Press F9/Esc to cancel.
// ============================================================================

interface ExposeProps {
  active: boolean;
  onClose: () => void;
}

interface ThumbnailLayout {
  win: WindowState;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

function calculateGrid(windows: WindowState[], viewW: number, viewH: number): ThumbnailLayout[] {
  if (windows.length === 0) return [];

  // Account for menu bar (26px) and dock (60px)
  const padding = 40;
  const topOffset = 46; // menu bar + extra
  const bottomOffset = 80; // dock + extra
  const availW = viewW - padding * 2;
  const availH = viewH - topOffset - bottomOffset;

  // Determine grid dimensions
  const count = windows.length;
  let cols = Math.ceil(Math.sqrt(count));
  let rows = Math.ceil(count / cols);

  // Gap between thumbnails
  const gap = 16;

  // Cell size
  const cellW = (availW - gap * (cols - 1)) / cols;
  const cellH = (availH - gap * (rows - 1)) / rows;

  return windows.map((win, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);

    // Scale window to fit in cell while maintaining aspect ratio
    const scaleX = cellW / win.width;
    const scaleY = cellH / win.height;
    const scale = Math.min(scaleX, scaleY, 0.85);

    const thumbW = win.width * scale;
    const thumbH = win.height * scale;

    // Center in cell
    const cellX = padding + col * (cellW + gap);
    const cellY = topOffset + row * (cellH + gap);
    const x = cellX + (cellW - thumbW) / 2;
    const y = cellY + (cellH - thumbH) / 2;

    return { win, x, y, width: thumbW, height: thumbH, scale };
  });
}

export default function Expose({ active, onClose }: ExposeProps) {
  const { state, focusWindow, restoreWindow } = useDesktop();

  // Get all non-minimized windows (include minimized for Exposé "all windows" view)
  const visibleWindows = useMemo(
    () => state.windows.filter((w) => !w.isMinimized),
    [state.windows]
  );

  const viewW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewH = typeof window !== "undefined" ? window.innerHeight : 800;

  const layout = useMemo(
    () => (active ? calculateGrid(visibleWindows, viewW, viewH) : []),
    [active, visibleWindows, viewW, viewH]
  );

  const handleThumbnailClick = useCallback((win: WindowState) => {
    if (win.isMinimized) {
      restoreWindow(win.id);
    } else {
      focusWindow(win.id);
    }
    onClose();
  }, [focusWindow, restoreWindow, onClose]);

  // Esc to exit
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "F9") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onClose]);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-[99990]"
      style={{
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      {/* "Exposé" label */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 text-white/70 text-[11px] font-medium tracking-wide"
        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
      >
        {visibleWindows.length === 0 ? "No open windows" : "Click a window to focus • Esc to exit"}
      </div>

      {/* Window thumbnails */}
      {layout.map((thumb) => {
        const iconPath = getPantherIconPath(thumb.win.fsItemId);

        return (
          <button
            key={thumb.win.id}
            className="absolute group transition-all duration-300 ease-out"
            style={{
              left: thumb.x,
              top: thumb.y,
              width: thumb.width,
              height: thumb.height,
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 1px 6px rgba(0,0,0,0.2)",
              border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleThumbnailClick(thumb.win);
            }}
          >
            {/* Window chrome preview */}
            <div className="w-full h-full flex flex-col" style={{ background: "var(--desktop-surface)" }}>
              {/* Mini title bar */}
              <div
                className="shrink-0 flex items-center px-2"
                style={{
                  height: Math.max(16, 22 * thumb.scale),
                  background: "var(--window-title-focused)",
                  borderBottom: "0.5px solid rgba(0,0,0,0.15)",
                }}
              >
                <div className="flex gap-1">
                  <div className="rounded-full" style={{ width: Math.max(6, 10 * thumb.scale), height: Math.max(6, 10 * thumb.scale), background: "#FF5F57" }} />
                  <div className="rounded-full" style={{ width: Math.max(6, 10 * thumb.scale), height: Math.max(6, 10 * thumb.scale), background: "#FFBD2E" }} />
                  <div className="rounded-full" style={{ width: Math.max(6, 10 * thumb.scale), height: Math.max(6, 10 * thumb.scale), background: "#28C840" }} />
                </div>
                <div
                  className="flex-1 text-center truncate font-semibold"
                  style={{
                    fontSize: Math.max(8, 11 * thumb.scale),
                    color: "var(--window-title-text, rgba(0,0,0,0.85))",
                  }}
                >
                  {thumb.win.title}
                </div>
              </div>
              {/* Body placeholder */}
              <div className="flex-1 flex items-center justify-center" style={{ opacity: 0.5 }}>
                <img
                  src={iconPath}
                  alt=""
                  width={Math.max(24, 48 * thumb.scale)}
                  height={Math.max(24, 48 * thumb.scale)}
                  style={{ opacity: 0.4 }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{
                background: "rgba(var(--desktop-accent-rgb, 0,122,255), 0.1)",
                border: "2px solid var(--desktop-accent)",
                borderRadius: 8,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
