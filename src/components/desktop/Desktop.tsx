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
// Main desktop view: wallpaper, right-side icons, menu bar, windows, dock.
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
      {/* Wallpaper background */}
      <ZenBackground />

      {/* Menu bar */}
      <MenuBar />

      {/* Desktop icons - right-side vertical column */}
      <div
        className="absolute top-[26px] right-0 bottom-14 w-[88px] p-1 overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            dispatch({ type: "FOCUS_WINDOW", payload: { id: "" } });
          }
        }}
      >
        <div className="flex flex-col gap-0.5">
          {rootItems.map((item) => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>
      </div>

      {/* Click on empty desktop to unfocus */}
      <div
        className="absolute top-[26px] left-0 right-[88px] bottom-14"
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
