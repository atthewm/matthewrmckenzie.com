"use client";

import React from "react";
import { useSettings } from "@/hooks/useSettingsStore";

// ============================================================================
// DESKTOP WALLPAPER
// ============================================================================
// Classic Mac-inspired wallpaper with smooth gradient and subtle texture.
// Supports dim/blur overlays from settings.
// ============================================================================

export default function ZenBackground() {
  const { settings } = useSettings();

  return (
    <div className="absolute inset-0">
      {/* Base gradient - classic Mac blue/teal inspired */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(140, 180, 220, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(120, 160, 190, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(160, 195, 215, 0.3) 0%, transparent 70%),
            var(--desktop-bg)
          `,
        }}
      />

      {/* Subtle linen / noise texture overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {/* Soft vignette edges */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* Dim overlay */}
      {settings.backgroundDim > 0 && (
        <div
          className="absolute inset-0 bg-black transition-opacity duration-500"
          style={{ opacity: settings.backgroundDim / 100 }}
        />
      )}

      {/* Blur overlay */}
      {settings.backgroundBlur > 0 && (
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{ backdropFilter: `blur(${settings.backgroundBlur}px)` }}
        />
      )}
    </div>
  );
}
