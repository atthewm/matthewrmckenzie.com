"use client";

import React from "react";
import { getRootItems } from "@/data/fs";
import DesktopIcon from "./DesktopIcon";
import WindowManager from "./WindowManager";
import Dock from "./Dock";
import MenuBar from "./MenuBar";
import ZenBackground from "./ZenBackground";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useDesktop } from "@/hooks/useDesktopStore";

// ============================================================================
// DESKTOP
// ============================================================================
// Main desktop view: wallpaper, icons, menu bar, windows, dock.
// ============================================================================

interface DesktopProps {
  contentMap: Record<string, string>;
}

export default function Desktop({ contentMap }: DesktopProps) {
  useKeyboardShortcuts();
  const { dispatch } = useDesktop();
  const rootItems = getRootItems();

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Zen wallpaper background (video/image + ambient audio) */}
      <ZenBackground />

      {/* Menu bar */}
      <MenuBar />

      {/* Desktop icons */}
      <div
        className="absolute top-10 left-0 right-0 bottom-14 p-4 overflow-hidden"
        onClick={(e) => {
          // Click on empty desktop space → unfocus all windows
          if (e.target === e.currentTarget) {
            dispatch({ type: "FOCUS_WINDOW", payload: { id: "" } });
          }
        }}
      >
        <div className="flex flex-col flex-wrap gap-1 h-full content-start">
          {rootItems.map((item) => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Windows */}
      <WindowManager contentMap={contentMap} />

      {/* Dock */}
      <Dock />
    </div>
  );
}
