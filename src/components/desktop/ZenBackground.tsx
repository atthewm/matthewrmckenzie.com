"use client";

import React from "react";
import { useSettings } from "@/hooks/useSettingsStore";

// ============================================================================
// DESKTOP WALLPAPER
// ============================================================================
// Static pale blue background with faint abstract SVG blob shapes,
// inspired by the ryOS retro Mac aesthetic. Supports dim/blur overlays.
// ============================================================================

export default function ZenBackground() {
  const { settings } = useSettings();

  return (
    <div className="absolute inset-0 bg-desktop-bg">
      {/* Abstract blob shapes */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large soft circle - top left */}
        <ellipse
          cx="280"
          cy="220"
          rx="320"
          ry="280"
          fill="white"
          opacity="0.07"
        />
        {/* Mid blob - center right */}
        <ellipse
          cx="1100"
          cy="400"
          rx="260"
          ry="240"
          fill="white"
          opacity="0.05"
        />
        {/* Small accent - bottom left */}
        <circle
          cx="500"
          cy="700"
          r="180"
          fill="white"
          opacity="0.06"
        />
        {/* Tall soft shape - right edge */}
        <ellipse
          cx="1350"
          cy="650"
          rx="200"
          ry="300"
          fill="white"
          opacity="0.04"
        />
      </svg>

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
