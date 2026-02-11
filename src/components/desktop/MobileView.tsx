"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getRootItems, type FSItem } from "@/data/fs";
import { getIcon } from "./DesktopIcon";
import WindowContent from "./WindowContent";

// ============================================================================
// MOBILE VIEW
// ============================================================================
// Simplified mobile layout: home grid → full-screen card navigation.
// Uses the same fs model and content as the desktop.
// ============================================================================

interface MobileViewProps {
  contentMap: Record<string, string>;
}

export default function MobileView({ contentMap }: MobileViewProps) {
  const [stack, setStack] = useState<FSItem[]>([]);
  const rootItems = getRootItems();
  const currentItem = stack.length > 0 ? stack[stack.length - 1] : null;

  function openItem(item: FSItem) {
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    setStack((prev) => [...prev, item]);
  }

  function goBack() {
    setStack((prev) => prev.slice(0, -1));
  }

  // If an item is open, show it full-screen
  if (currentItem) {
    return (
      <div className="fixed inset-0 bg-desktop-surface flex flex-col z-50">
        {/* Header */}
        <div className="flex items-center h-12 px-3 border-b border-desktop-border shrink-0 safe-area-top">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-desktop-accent text-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex-1 text-center text-sm font-medium text-desktop-text truncate px-2">
            {currentItem.name}
          </div>
          <div className="w-12" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {currentItem.type === "folder" ? (
            <MobileFolderView item={currentItem} onOpen={openItem} />
          ) : (
            <WindowContent
              windowState={{
                id: `mobile-${currentItem.id}`,
                fsItemId: currentItem.id,
                title: currentItem.name,
                icon: currentItem.icon,
                x: 0, y: 0, width: 0, height: 0, zIndex: 0,
                isMinimized: false, isMaximized: false,
              }}
              contentMap={contentMap}
            />
          )}
        </div>
      </div>
    );
  }

  // Home grid
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />

      {/* Content */}
      <div className="relative flex-1 flex flex-col safe-area-top">
        {/* Header */}
        <div className="px-5 pt-8 pb-4">
          <h1 className="text-white text-xl font-semibold">Matthew McKenzie</h1>
          <p className="text-white/60 text-sm mt-0.5">Explore</p>
        </div>

        {/* Grid */}
        <div className="px-4 flex-1">
          <div className="grid grid-cols-4 gap-y-5 gap-x-2">
            {rootItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="flex flex-col items-center gap-1.5"
                  aria-label={`Open ${item.name}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm
                                  flex items-center justify-center
                                  border border-white/10 shadow-lg
                                  active:scale-95 transition-transform">
                    <Icon size={26} className="text-white" />
                  </div>
                  <span className="text-[11px] text-white/90 font-medium text-center leading-tight">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile folder view with list-style items
function MobileFolderView({ item, onOpen }: { item: FSItem; onOpen: (item: FSItem) => void }) {
  if (!item.children?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-desktop-text-secondary text-sm">
        This folder is empty.
      </div>
    );
  }

  return (
    <div className="p-3">
      {item.children.map((child) => {
        const Icon = getIcon(child.icon);
        return (
          <button
            key={child.id}
            onClick={() => onOpen(child)}
            className="w-full flex items-center gap-3 p-3 rounded-xl
                       hover:bg-desktop-border/50 active:bg-desktop-border/70
                       transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-desktop-accent/10 flex items-center justify-center">
              <Icon size={20} className="text-desktop-accent" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-desktop-text">{child.name}</div>
              {child.description && (
                <div className="text-xs text-desktop-text-secondary line-clamp-1">{child.description}</div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
