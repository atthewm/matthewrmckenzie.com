"use client";

import React from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import Window from "./Window";
import WindowContent from "./WindowContent";

// ============================================================================
// WINDOW MANAGER
// ============================================================================
// Renders all open (non-minimized) windows.
// ============================================================================

interface WindowManagerProps {
  contentMap: Record<string, string>;
}

export default function WindowManager({ contentMap }: WindowManagerProps) {
  const { state } = useDesktop();

  return (
    <>
      {state.windows.map((win) => (
        <Window key={win.id} windowState={win}>
          <WindowContent windowState={win} contentMap={contentMap} />
        </Window>
      ))}
    </>
  );
}
