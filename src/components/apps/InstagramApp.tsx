"use client";

import React from "react";
import { ExternalLink, Camera } from "lucide-react";
import { siteConfig } from "@/lib/config";

// ============================================================================
// INSTAGRAM APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Displays a stable link to the public Instagram profile @mrem with a grid
// of placeholder thumbnails and an "Open Instagram" button.
// No scraping, no iframes, no auth - just a clean launcher.
// ============================================================================

const PLACEHOLDER_COUNT = 12;

export default function InstagramApp() {
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
        <a
          href={siteConfig.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-0.5 rounded
                     text-desktop-accent hover:bg-desktop-accent/10 transition-colors"
        >
          <ExternalLink size={10} />
          <span>@{siteConfig.instagram.handle}</span>
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {/* Profile header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            }}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
              style={{ background: "var(--desktop-surface)" }}
            >
              <Camera size={20} className="text-desktop-text-secondary" />
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-desktop-text">
              @{siteConfig.instagram.handle}
            </p>
            <p className="text-[11px] text-desktop-text-secondary">
              Photos currently mirror Instagram.
            </p>
          </div>
        </div>

        {/* Open Instagram button */}
        <a
          href={siteConfig.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 mb-4 rounded text-[12px] font-medium
                     bg-desktop-accent text-white hover:opacity-90 transition-opacity"
        >
          <ExternalLink size={13} />
          Open Instagram in New Tab
        </a>

        {/* Placeholder grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
            <a
              key={i}
              href={siteConfig.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square rounded flex items-center justify-center cursor-pointer
                         hover:opacity-80 transition-opacity"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid var(--desktop-border)",
              }}
            >
              <Camera size={16} className="text-desktop-text-secondary/20" />
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        Photos currently mirror Instagram
      </div>
    </div>
  );
}
