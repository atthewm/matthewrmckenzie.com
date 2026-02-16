"use client";

import React from "react";
import { Camera } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { useOpenInBrowser } from "@/lib/browserStore";

// ============================================================================
// INSTAGRAM APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Minimal launcher that opens the Instagram profile in the in-OS Browser
// window rather than a new browser tab.
// ============================================================================

export default function InstagramApp() {
  const openInBrowser = useOpenInBrowser();

  const handleOpen = () => {
    openInBrowser(siteConfig.instagram.url, `Instagram (@${siteConfig.instagram.handle})`);
  };

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
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          {/* Instagram icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            }}
          >
            <div
              className="w-[56px] h-[56px] rounded-xl flex items-center justify-center"
              style={{ background: "var(--desktop-surface)" }}
            >
              <Camera size={24} className="text-desktop-text-secondary" />
            </div>
          </div>

          <p className="text-[14px] font-semibold text-desktop-text mb-0.5">
            Instagram
          </p>
          <p className="text-[11px] text-desktop-text-secondary mb-5">
            @{siteConfig.instagram.handle}
          </p>

          {/* Open Instagram button */}
          <button
            onClick={handleOpen}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-[12px] font-medium
                       bg-desktop-accent text-white hover:opacity-90 transition-opacity"
          >
            <Camera size={14} />
            Open Instagram
          </button>

          <p className="text-[10px] text-desktop-text-secondary mt-4">
            Photos currently mirror Instagram.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center border-t text-[10px] text-desktop-text-secondary"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        Photos
      </div>
    </div>
  );
}
