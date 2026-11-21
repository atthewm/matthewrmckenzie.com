"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { getRootItems, findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useOwnerSession } from "@/hooks/useOwnerSession";
import Springboard from "@/components/home/Springboard";
import WindowContent from "./WindowContent";
import BoardView from "@/components/board/BoardView";

// ============================================================================
// MOBILE VIEW
// ============================================================================
// Phone layout: a home screen of apps, and each opened item full screen.
// Shares the desktop store, so anything that calls openItem (Spotlight, Start
// Here, folder lists, ?open= links) shows up here. Back closes the top window.
// ============================================================================

interface MobileViewProps {
  contentMap: Record<string, string>;
}

export default function MobileView({ contentMap }: MobileViewProps) {
  const { state, openItem, closeWindow, dispatch } = useDesktop();
  const { owner } = useOwnerSession();
  const rootItems = getRootItems(false, owner);
  const startedRef = useRef(false);

  // Start every phone visit on the home screen; honor ?open=<id> deep links.
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    dispatch({ type: "CLOSE_ALL_WINDOWS" });
    const id = new URLSearchParams(window.location.search).get("open");
    const item = id ? findFSItem(id) : undefined;
    // Owner-only apps cannot be opened by link.
    if (item && !item.ownerOnly) {
      openItem(item);
      window.history.replaceState({}, "", "/");
    }
  }, [dispatch, openItem]);

  const top = useMemo(
    () =>
      [...state.windows]
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0],
    [state.windows],
  );
  const currentItem = top ? findFSItem(top.fsItemId) : undefined;

  function open(item: FSItem) {
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    openItem(item);
  }

  if (top && currentItem) {
    return (
      <div className="fixed inset-0 bg-desktop-surface flex flex-col z-50">
        <div className="flex items-center h-12 px-2 border-b border-desktop-border shrink-0 safe-area-top">
          <button
            onClick={() => closeWindow(top.id)}
            className="flex items-center gap-1 text-desktop-accent text-sm px-2 py-2"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex-1 text-center text-sm font-semibold text-desktop-text truncate px-2">
            {currentItem.name}
          </div>
          <div className="w-16" />
        </div>
        <div className={`flex-1 overscroll-contain ${currentItem.type === "folder" ? "overflow-hidden" : "overflow-auto"}`}>
          {currentItem.type === "folder" ? (
            <BoardView item={currentItem} contentMap={contentMap} onOpen={open} />
          ) : (
            <WindowContent windowState={top} contentMap={contentMap} />
          )}
        </div>
      </div>
    );
  }

  return <Springboard items={rootItems} onOpen={open} />;
}
