"use client";

import React, { useCallback, useState, useRef } from "react";
import type { FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";
import { PantherIcon } from "./PantherIcons";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// DESKTOP ICON (Mac OS X 10.3 Panther) - Draggable
// ============================================================================
// Authentic Panther PNG icons. Double-click to open. Click to select.
// Drag to reposition on the desktop. Position saved via onDrag callback.
// ============================================================================

interface DesktopIconProps {
  item: FSItem;
  x: number;
  y: number;
  onDragEnd: (id: string, x: number, y: number) => void;
}

export default function DesktopIcon({ item, x, y, onDragEnd }: DesktopIconProps) {
  const { openItem } = useDesktop();
  const { settings } = useSettings();
  const [selected, setSelected] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const handleOpen = useCallback(() => {
    if (didDrag.current) return; // Ignore if we just finished dragging
    trackEvent("app_opened", { app: item.id, source: "desktop_icon" });
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    openItem(item);
  }, [item, openItem]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setSelected(true);
    didDrag.current = false;
    dragOffset.current = { x: e.clientX - x, y: e.clientY - y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [x, y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    // Only start dragging after moving more than 4px
    if (!dragging && (Math.abs(newX - x) > 4 || Math.abs(newY - y) > 4)) {
      setDragging(true);
      didDrag.current = true;
    }
    if (dragging || didDrag.current) {
      setDragPos({ x: newX, y: newY });
    }
  }, [dragging, x, y]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (dragging && dragPos) {
      onDragEnd(item.id, dragPos.x, dragPos.y);
    }
    setDragging(false);
    setDragPos(null);
  }, [dragging, dragPos, item.id, onDragEnd]);

  // Icon sizes based on settings
  const sizeMap = { small: 40, medium: 48, large: 56 };
  const boxSize = sizeMap[settings.iconSize];

  const currentX = dragPos?.x ?? x;
  const currentY = dragPos?.y ?? y;

  return (
    <button
      className={`
        absolute flex flex-col items-center gap-1 p-1.5 rounded w-[80px]
        focus-visible:outline-none
        transition-shadow duration-100 group
        ${dragging ? "opacity-80" : ""}
      `}
      style={{
        left: currentX,
        top: currentY,
        zIndex: dragging ? 9998 : 1,
        cursor: dragging ? "grabbing" : "default",
        touchAction: "none",
      }}
      onDoubleClick={handleOpen}
      onClick={() => { if (!didDrag.current) setSelected(true); }}
      onBlur={() => setSelected(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      aria-label={`Open ${item.name}`}
      title={item.description || item.name}
    >
      {/* Panther PNG icon */}
      <div
        className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-150"
        style={{
          width: boxSize,
          height: boxSize,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      >
        <PantherIcon itemId={item.id} size={boxSize} />
      </div>

      {/* Label */}
      <span
        className={`
          text-[10px] font-medium text-center leading-tight line-clamp-2 px-1 py-0.5 rounded
          ${selected
            ? "bg-desktop-accent text-white"
            : "text-desktop-text"
          }
        `}
        style={{
          textShadow: selected ? "none" : "0 1px 2px rgba(255,255,255,0.5)",
        }}
      >
        {item.name}
      </span>
    </button>
  );
}
