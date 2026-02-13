"use client";

import React, { useState, useCallback, useRef } from "react";
import * as Icons from "lucide-react";
import { dockItemIds, findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";

// ============================================================================
// DOCK - Retro Mac Launcher
// ============================================================================
// Primary navigation dock fixed to bottom center. Shows all main app/folder
// icons with retro styling: bevels, drop shadows, pixel-ish edges.
// Single click to open/focus. Hover magnification. Active dot indicators.
// ============================================================================

// ---------------------------------------------------------------------------
// Icon helpers
// ---------------------------------------------------------------------------

function getIcon(name: string) {
  const lib = Icons as Record<string, unknown>;
  const IconComponent = lib[name] as React.ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }> | undefined;
  return IconComponent || Icons.File;
}

// Retro muted color palette - lower saturation, warmer tones
const retroColors: Record<string, [string, string]> = {
  Sparkles:    ["#c9a96e", "#a88a50"],
  User:        ["#6da0c0", "#4d7fa0"],
  Briefcase:   ["#7a7db0", "#5e6190"],
  PenTool:     ["#b88aa0", "#9a6e85"],
  Image:       ["#6da0c0", "#4d7fa0"],
  Mail:        ["#6aad82", "#4d9068"],
  Settings:    ["#90989e", "#78808a"],
  Headphones:  ["#b87878", "#985858"],
  Disc3:       ["#8078a8", "#605888"],
  ListMusic:   ["#7870a0", "#585088"],
  Heart:       ["#c07878", "#a06060"],
  Activity:    ["#60a880", "#488868"],
};

const defaultRetroColor: [string, string] = ["#808080", "#606068"];

// ---------------------------------------------------------------------------
// Tooltip component
// ---------------------------------------------------------------------------

function DockTooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      className={`
        absolute -top-8 left-1/2 -translate-x-1/2
        px-2 py-0.5 rounded
        text-[11px] font-medium text-white whitespace-nowrap
        pointer-events-none transition-all duration-150
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
      `}
      style={{
        background: "rgba(30, 30, 30, 0.85)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single dock icon
// ---------------------------------------------------------------------------

interface DockIconProps {
  item: FSItem;
  isOpen: boolean;
  isFocused: boolean;
  hoveredIndex: number | null;
  myIndex: number;
  onHover: (index: number | null) => void;
  onClick: () => void;
}

function DockIcon({
  item,
  isOpen,
  isFocused,
  hoveredIndex,
  myIndex,
  onHover,
  onClick,
}: DockIconProps) {
  const Icon = getIcon(item.icon);
  const [c1, c2] = retroColors[item.icon] || defaultRetroColor;

  // Magnification: full scale at hovered, slightly less for neighbors
  let scale = 1;
  if (hoveredIndex !== null) {
    const distance = Math.abs(hoveredIndex - myIndex);
    if (distance === 0) scale = 1.35;
    else if (distance === 1) scale = 1.15;
    else if (distance === 2) scale = 1.05;
  }

  const isHovered = hoveredIndex === myIndex;

  return (
    <button
      className="relative flex flex-col items-center focus-visible:outline-none dock-icon-btn"
      style={{
        transition: "transform 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: `scale(${scale}) translateY(${scale > 1 ? -(scale - 1) * 20 : 0}px)`,
        transformOrigin: "bottom center",
      }}
      onMouseEnter={() => onHover(myIndex)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      aria-label={`Open ${item.name}`}
    >
      <DockTooltip label={item.name} visible={isHovered} />

      {/* Retro icon tile */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: `linear-gradient(145deg, ${c1} 0%, ${c2} 100%)`,
          boxShadow: `
            0 3px 8px rgba(0,0,0,0.3),
            0 1px 2px rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.35),
            inset 0 -1px 0 rgba(0,0,0,0.15)
          `,
          border: "1px solid rgba(0,0,0,0.18)",
          imageRendering: "auto",
        }}
      >
        {/* Inner bevel highlight */}
        <div
          className="absolute inset-0 rounded-[9px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)",
            pointerEvents: "none",
          }}
        />
        <Icon
          size={22}
          className="text-white relative z-10"
          strokeWidth={1.6}
          style={{
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
          }}
        />
      </div>

      {/* Active indicator dot */}
      <span
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 transition-all duration-200"
        style={{
          width: isOpen ? 4 : 0,
          height: isOpen ? 4 : 0,
          borderRadius: "50%",
          background: isFocused ? "var(--desktop-accent)" : "var(--desktop-text-secondary)",
          boxShadow: isOpen ? `0 0 4px ${isFocused ? "var(--desktop-accent)" : "transparent"}` : "none",
          opacity: isOpen ? 1 : 0,
        }}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------

function DockSeparator() {
  return (
    <div
      className="self-center mx-1"
      style={{
        width: 1,
        height: 32,
        background: "var(--desktop-border)",
        opacity: 0.5,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Dock
// ---------------------------------------------------------------------------

export default function Dock() {
  const { state, openItem, focusWindow, restoreWindow } = useDesktop();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Build resolved dock items (skip separators for indexing purposes)
  const dockEntries: { type: "item" | "separator"; item?: FSItem; itemIndex?: number }[] = [];
  let itemCounter = 0;
  for (const entry of dockItemIds) {
    if (entry === "|") {
      dockEntries.push({ type: "separator" });
    } else {
      const fsItem = findFSItem(entry);
      if (fsItem) {
        dockEntries.push({ type: "item", item: fsItem, itemIndex: itemCounter });
        itemCounter++;
      }
    }
  }

  const handleHover = useCallback((index: number | null) => {
    setHoveredIndex(index);
  }, []);

  // Reset hover when mouse leaves dock entirely
  const handleDockLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  const handleClick = useCallback((item: FSItem) => {
    // If link, open externally
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    // If already open, focus or restore
    const existingWindow = state.windows.find((w) => w.fsItemId === item.id);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        restoreWindow(existingWindow.id);
      } else {
        focusWindow(existingWindow.id);
      }
      return;
    }
    // Open new
    openItem(item);
  }, [state.windows, openItem, focusWindow, restoreWindow]);

  return (
    <div
      ref={dockRef}
      className="fixed bottom-1.5 left-1/2 -translate-x-1/2 z-[9999]
                  flex items-end px-2 pb-1.5 pt-1
                  rounded-2xl animate-fade-in"
      style={{
        background: "var(--desktop-dock)",
        border: "1px solid var(--desktop-border)",
        boxShadow: `
          0 4px 20px rgba(0,0,0,0.15),
          0 1px 4px rgba(0,0,0,0.1),
          inset 0 1px 0 rgba(255,255,255,0.15)
        `,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onMouseLeave={handleDockLeave}
    >
      {dockEntries.map((entry, i) => {
        if (entry.type === "separator") {
          return <DockSeparator key={`sep-${i}`} />;
        }

        const item = entry.item!;
        const isOpen = state.windows.some((w) => w.fsItemId === item.id);
        const isFocused = state.windows.some(
          (w) => w.fsItemId === item.id && state.focusedWindowId === w.id && !w.isMinimized
        );

        return (
          <DockIcon
            key={item.id}
            item={item}
            isOpen={isOpen}
            isFocused={isFocused}
            hoveredIndex={hoveredIndex}
            myIndex={entry.itemIndex!}
            onHover={handleHover}
            onClick={() => handleClick(item)}
          />
        );
      })}
    </div>
  );
}
