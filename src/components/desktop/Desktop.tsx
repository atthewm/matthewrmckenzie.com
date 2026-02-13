"use client";

import React from "react";
import WindowManager from "./WindowManager";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import ZenBackground from "./ZenBackground";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDesktop } from "@/hooks/useDesktopStore";

// ============================================================================
// DESKTOP
// ============================================================================
// Main desktop view: wallpaper, menu bar, windows, and bottom dock.
// Icons are now in the Dock; the desktop surface is clean.
// ============================================================================

interface DesktopProps {
  contentMap: Record<string, string>;
}

export default function Desktop({ contentMap }: DesktopProps) {
  useKeyboardShortcuts();
  const { dispatch } = useDesktop();

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Wallpaper background */}
      <ZenBackground />

      {/* Menu bar */}
      <MenuBar />

      {/* Click on empty desktop to unfocus */}
      <div
        className="absolute top-[26px] left-0 right-0 bottom-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            dispatch({ type: "FOCUS_WINDOW", payload: { id: "" } });
          }
        }}
      />

      {/* Windows */}
      <WindowManager contentMap={contentMap} />

      {/* Dock */}
      <Dock />
    </div>
  );
}
