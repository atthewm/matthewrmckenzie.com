"use client";

import React from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { getIcon } from "./DesktopIcon";

// ============================================================================
// DOCK (Shelf-Style)
// ============================================================================
// Centered bottom dock with opaque shelf background, soft shadow, and
// accent blue active indicators. Inspired by ryOS retro Mac dock.
// ============================================================================

export default function Dock() {
  const { state, focusWindow, restoreWindow } = useDesktop();

  if (state.windows.length === 0) return null;

  return (
    <div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999]
                  flex items-center gap-1 px-2.5 py-1.5
                  rounded-xl animate-fade-in"
      style={{
        background: "var(--desktop-dock)",
        border: "1px solid var(--desktop-border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      {state.windows.map((win) => {
        const Icon = getIcon(win.icon);
        const isFocused = state.focusedWindowId === win.id && !win.isMinimized;

        return (
          <button
            key={win.id}
            onClick={() => {
              if (win.isMinimized) {
                restoreWindow(win.id);
              } else {
                focusWindow(win.id);
              }
            }}
            aria-label={`${win.isMinimized ? "Restore" : "Focus"} ${win.title}`}
            title={win.title}
            className={`
              relative flex items-center justify-center w-10 h-10 rounded-lg
              transition-all duration-150
              ${isFocused
                ? "bg-desktop-accent/15"
                : "hover:bg-desktop-border/40"
              }
              ${win.isMinimized ? "opacity-50" : "opacity-100"}
            `}
          >
            <Icon size={20} className="text-desktop-text" />
            {/* Active indicator dot */}
            <span
              className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2
                         w-1 h-1 rounded-full transition-colors duration-150
                         ${isFocused ? "bg-desktop-accent" : "bg-transparent"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
