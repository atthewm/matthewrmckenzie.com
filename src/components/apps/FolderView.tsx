"use client";

import React from "react";
import type { FSItem } from "@/data/fs";
import { getRootItems } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { getIcon } from "@/components/desktop/DesktopIcon";

// ============================================================================
// FOLDER VIEW (Mac OS X 10.3 Panther Finder-Style)
// ============================================================================
// Left sidebar with "Favorites" listing root folders, main area with icon
// grid, footer bar with item count. Panther Aqua styling.
// ============================================================================

interface FolderViewProps {
  item: FSItem;
}

function Sidebar({ currentId }: { currentId: string }) {
  const { openItem } = useDesktop();
  const rootItems = getRootItems();
  const folders = rootItems.filter((i) => i.type === "folder");

  return (
    <div
      className="w-[150px] shrink-0 border-r overflow-y-auto py-2 px-1"
      style={{
        borderColor: "var(--desktop-border)",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <p className="text-[9px] font-semibold uppercase tracking-wider text-desktop-text-secondary px-2 mb-1">
        Favorites
      </p>
      {folders.map((folder) => {
        const Icon = getIcon(folder.icon);
        const isActive = folder.id === currentId;
        return (
          <button
            key={folder.id}
            onClick={() => openItem(folder)}
            className={`
              w-full flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px]
              transition-colors duration-75
              ${isActive
                ? "bg-desktop-accent text-white"
                : "text-desktop-text hover:bg-desktop-border/40"
              }
            `}
          >
            <Icon size={14} className={isActive ? "text-white" : "text-desktop-text-secondary"} />
            <span className="truncate">{folder.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FolderView({ item }: FolderViewProps) {
  const { openItem } = useDesktop();

  if (!item.children || item.children.length === 0) {
    return (
      <div className="flex h-full">
        <Sidebar currentId={item.id} />
        <div className="flex-1 flex items-center justify-center text-desktop-text-secondary text-sm">
          This folder is empty.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <Sidebar currentId={item.id} />

        {/* Main icon grid */}
        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-1">
            {item.children.map((child) => {
              const Icon = getIcon(child.icon);
              return (
                <button
                  key={child.id}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg
                             hover:bg-desktop-border/40 transition-colors duration-100
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent"
                  onDoubleClick={() => {
                    if (child.type === "link" && child.href) {
                      window.open(child.href, "_blank", "noopener,noreferrer");
                      return;
                    }
                    openItem(child);
                  }}
                  aria-label={`Open ${child.name}`}
                  title={child.description}
                >
                  <div className="w-10 h-10 flex items-center justify-center
                                  bg-desktop-accent/10 rounded-xl">
                    <Icon size={20} className="text-desktop-accent" />
                  </div>
                  <span className="text-[10px] font-medium text-desktop-text text-center leading-tight line-clamp-2">
                    {child.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        {item.children.length} item{item.children.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
