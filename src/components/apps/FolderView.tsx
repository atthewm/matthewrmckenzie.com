"use client";

import React from "react";
import type { FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { getIcon } from "@/components/desktop/DesktopIcon";

// ============================================================================
// FOLDER VIEW
// ============================================================================
// Grid of icons showing the children of a folder item.
// ============================================================================

interface FolderViewProps {
  item: FSItem;
}

export default function FolderView({ item }: FolderViewProps) {
  const { openItem } = useDesktop();

  if (!item.children || item.children.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-desktop-text-secondary text-sm">
        This folder is empty.
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
        {item.children.map((child) => {
          const Icon = getIcon(child.icon);
          return (
            <button
              key={child.id}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl
                         hover:bg-desktop-border/50 transition-colors duration-100
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
              <div className="w-11 h-11 flex items-center justify-center
                              bg-desktop-accent/10 rounded-xl">
                <Icon size={22} className="text-desktop-accent" />
              </div>
              <span className="text-[11px] font-medium text-desktop-text text-center leading-tight">
                {child.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
