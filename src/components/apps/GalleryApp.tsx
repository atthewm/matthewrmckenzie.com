"use client";

import React from "react";
import { ImageIcon } from "lucide-react";

// ============================================================================
// GALLERY APP (ryOS iPhoto-Inspired)
// ============================================================================

export default function GalleryApp() {
  const placeholders = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-between px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Photos
        </span>
        <span className="text-desktop-text-secondary">
          {placeholders.length} items
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-3" style={{ background: "rgba(0,0,0,0.01)" }}>
        <div className="grid grid-cols-3 gap-1.5">
          {placeholders.map((i) => (
            <div
              key={i}
              className="aspect-square rounded flex items-center justify-center cursor-pointer
                         hover:opacity-80 transition-opacity"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid var(--desktop-border)",
              }}
            >
              <ImageIcon size={20} className="text-desktop-text-secondary/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        Add photos to populate the gallery
      </div>
    </div>
  );
}
