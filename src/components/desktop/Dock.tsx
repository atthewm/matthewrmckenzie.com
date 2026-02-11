"use client";

import React from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { getIcon } from "./DesktopIcon";

// ============================================================================
// DOCK / TASKBAR
// ============================================================================
// Shows open and minimized windows. Click to focus/restore.
// ============================================================================

export default function Dock() {
  const { state, focusWindow, restoreWindow } = useDesktop();

  if (state.windows.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999]
                    flex items-center gap-1 px-2 py-1.5
                    bg-desktop-dock/80 backdrop-blur-xl
                    border border-white/15 dark:border-white/10
                    rounded-2xl shadow-2xl
                    animate-fade-in">
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
              relative flex items-center justify-center w-10 h-10 rounded-xl
              transition-all duration-150
              ${isFocused
                ? "bg-desktop-accent/20 shadow-inner"
                : "hover:bg-white/10 dark:hover:bg-white/10"
              }
              ${win.isMinimized ? "opacity-50" : "opacity-100"}
            `}
          >
            <Icon size={20} className="text-desktop-text" />
            {/* Active indicator dot */}
            <span
              className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2
                         w-1 h-1 rounded-full transition-colors duration-150
                         ${isFocused ? "bg-desktop-accent" : "bg-desktop-text/30"}`}
            />
          </button>
        );
      })}
    </div>
  );
}
