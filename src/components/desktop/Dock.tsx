"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { dockItemIds, findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { getPantherIcon } from "./PantherIcons";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// DOCK - Mac OS X 10.3 Panther Style Launcher
// ============================================================================
// Primary navigation dock fixed to bottom center. Glossy Aqua icons,
// glassy translucent shelf. Single click to open/focus. Hover magnification.
// Active dot indicators.
// ============================================================================

// ---------------------------------------------------------------------------
// Tooltip component
// ---------------------------------------------------------------------------

function DockTooltip({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      className={`
        absolute -top-8 left-1/2 -translate-x-1/2
        px-2 py-0.5 rounded
        text-2xs font-medium text-white whitespace-nowrap
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
  /** Roving tabindex: only the active item is a tab stop. */
  tabIndex: number;
  /** Toggle state for window-backed items; undefined for plain links. */
  pressed?: boolean;
  onFocus: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function DockIcon({
  item,
  isOpen,
  isFocused,
  hoveredIndex,
  myIndex,
  onHover,
  onClick,
  tabIndex,
  pressed,
  onFocus,
  buttonRef,
  compact,
  reduceMotion,
}: DockIconProps & { compact?: boolean; reduceMotion?: boolean }) {
  const PantherIcon = getPantherIcon(item.id);

  const iconBox = compact ? 34 : 44;
  const iconSize = compact ? 28 : 38;

  // Magnification: full scale at hovered, slightly less for neighbors.
  // Disabled when the user prefers reduced motion.
  let scale = 1;
  if (!reduceMotion && hoveredIndex !== null) {
    const distance = Math.abs(hoveredIndex - myIndex);
    if (distance === 0) scale = 1.4;
    else if (distance === 1) scale = 1.18;
    else if (distance === 2) scale = 1.06;
  }

  const isHovered = hoveredIndex === myIndex;

  return (
    <button
      ref={buttonRef}
      className="relative flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-1 rounded"
      style={{
        transition: "transform 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        transform: `scale(${scale}) translateY(${scale > 1 ? -(scale - 1) * 22 : 0}px)`,
        transformOrigin: "bottom center",
      }}
      onMouseEnter={() => onHover(myIndex)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      onFocus={onFocus}
      tabIndex={tabIndex}
      aria-pressed={pressed}
      aria-label={`Open ${item.name}`}
    >
      {!compact && <DockTooltip label={item.name} visible={isHovered} />}

      {/* Panther Aqua Icon */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: iconBox,
          height: iconBox,
          filter: isHovered
            ? "drop-shadow(0 3px 8px rgba(0,0,0,0.35))"
            : "drop-shadow(0 1px 4px rgba(0,0,0,0.2))",
          transition: "filter 150ms ease",
        }}
      >
        {PantherIcon ? (
          <PantherIcon size={iconSize} />
        ) : (
          /* Fallback: generic document icon */
          <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none">
            <rect x="5" y="3" width="22" height="26" rx="3" fill="#F8F8F5" stroke="#AAA" strokeWidth="1" />
            <path d="M5 6a3 3 0 013-3h12l7 7v19a3 3 0 01-3 3H8a3 3 0 01-3-3V6z" fill="#F8F8F5" stroke="#AAA" strokeWidth="1" />
            <path d="M20 3v7h7" fill="#EEEEE5" stroke="#AAA" strokeWidth="1" strokeLinejoin="round" />
            <line x1="9" y1="15" x2="23" y2="15" stroke="#DDD" strokeWidth="0.8" />
            <line x1="9" y1="18" x2="23" y2="18" stroke="#DDD" strokeWidth="0.8" />
            <line x1="9" y1="21" x2="18" y2="21" stroke="#DDD" strokeWidth="0.8" />
          </svg>
        )}
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

interface DockProps {
  onStickiesToggle?: () => void;
  stickiesActive?: boolean;
}

export default function Dock({ onStickiesToggle, stickiesActive }: DockProps = {}) {
  const { state, openItem, focusWindow, restoreWindow } = useDesktop();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  // Roving tabindex (WAI-ARIA toolbar pattern): one item is the tab stop,
  // arrow keys move focus between items.
  const [rovingIndex, setRovingIndex] = useState(0);
  const itemButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Build resolved dock items (skip separators for indexing purposes)
  const dockEntries: { type: "item" | "separator"; item?: FSItem; itemIndex?: number }[] = [];
  let itemCounter = 0;
  for (const entry of dockItemIds) {
    if (entry === "|") {
      // Skip separators on mobile to save space
      if (!isMobile) dockEntries.push({ type: "separator" });
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

  const itemCount = itemCounter;
  // Keep the tab stop valid when the item list shrinks (mobile layout).
  const activeRovingIndex = Math.min(rovingIndex, Math.max(0, itemCount - 1));

  const focusItemAt = useCallback((index: number) => {
    setRovingIndex(index);
    itemButtonRefs.current[index]?.focus();
  }, []);

  const handleToolbarKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (itemCount === 0) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          focusItemAt((activeRovingIndex + 1) % itemCount);
          break;
        case "ArrowLeft":
          e.preventDefault();
          focusItemAt((activeRovingIndex - 1 + itemCount) % itemCount);
          break;
        case "Home":
          e.preventDefault();
          focusItemAt(0);
          break;
        case "End":
          e.preventDefault();
          focusItemAt(itemCount - 1);
          break;
      }
    },
    [itemCount, activeRovingIndex, focusItemAt]
  );

  const handleClick = useCallback((item: FSItem) => {
    trackEvent("app_opened", { app: item.id, source: "dock" });
    // Stickies: toggle floating stickies instead of opening a window
    if (item.id === "stickies" && onStickiesToggle) {
      onStickiesToggle();
      return;
    }
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
  }, [state.windows, openItem, focusWindow, restoreWindow, onStickiesToggle]);

  return (
    <div
      ref={dockRef}
      role="toolbar"
      aria-label="Dock"
      aria-orientation="horizontal"
      onKeyDown={handleToolbarKeyDown}
      className={`fixed left-1/2 -translate-x-1/2 z-dock
                  flex items-end
                  rounded-2xl animate-fade-in
                  ${isMobile
                    ? "bottom-0 px-1.5 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))] max-w-[calc(100%-8px)] overflow-x-auto scrollbar-none"
                    : "bottom-1.5 px-2.5 pt-1.5 pb-1.5"
                  }`}
      style={{
        background: "var(--desktop-dock)",
        border: "1px solid rgba(255,255,255,0.35)",
        boxShadow: `
          0 4px 24px rgba(0,0,0,0.18),
          0 1px 6px rgba(0,0,0,0.12),
          inset 0 1px 0 rgba(255,255,255,0.45)
        `,
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        ...(isMobile ? { borderRadius: "16px 16px 0 0", borderBottom: "none" } : {}),
      }}
      onMouseLeave={handleDockLeave}
    >
      {dockEntries.map((entry, i) => {
        if (entry.type === "separator") {
          return <DockSeparator key={`sep-${i}`} />;
        }

        const item = entry.item!;
        const isOpen = item.id === "stickies" ? !!stickiesActive : state.windows.some((w) => w.fsItemId === item.id);
        const isFocused = item.id === "stickies" ? !!stickiesActive : state.windows.some(
          (w) => w.fsItemId === item.id && state.focusedWindowId === w.id && !w.isMinimized
        );

        const itemIndex = entry.itemIndex!;
        return (
          <DockIcon
            key={item.id}
            item={item}
            isOpen={isOpen}
            isFocused={isFocused}
            hoveredIndex={isMobile ? null : hoveredIndex}
            myIndex={itemIndex}
            onHover={isMobile ? () => {} : handleHover}
            onClick={() => handleClick(item)}
            tabIndex={itemIndex === activeRovingIndex ? 0 : -1}
            pressed={item.type === "link" ? undefined : isFocused}
            onFocus={() => setRovingIndex(itemIndex)}
            buttonRef={(el) => { itemButtonRefs.current[itemIndex] = el; }}
            compact={isMobile}
            reduceMotion={reduceMotion}
          />
        );
      })}
    </div>
  );
}
