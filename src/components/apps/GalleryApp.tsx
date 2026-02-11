"use client";

import React from "react";
import { ImageIcon } from "lucide-react";

// ============================================================================
// GALLERY APP (Placeholder)
// ============================================================================

export default function GalleryApp() {
  const placeholders = Array.from({ length: 6 }, (_, i) => i + 1);

  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold text-desktop-text mb-4">Photos</h1>
      <div className="grid grid-cols-3 gap-2">
        {placeholders.map((i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-desktop-border/30 border border-desktop-border
                       flex items-center justify-center"
          >
            <ImageIcon size={24} className="text-desktop-text-secondary/30" />
          </div>
        ))}
      </div>
      <p className="text-xs text-desktop-text-secondary mt-4 text-center">
        Add your photos to the gallery. This is a placeholder.
      </p>
    </div>
  );
}
