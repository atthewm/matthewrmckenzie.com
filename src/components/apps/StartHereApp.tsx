"use client";

import React from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { findFSItem } from "@/data/fs";
import { PantherIcon } from "@/components/desktop/PantherIcons";

// ============================================================================
// START HERE APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// Welcome hub with quick-access grid + tips for navigating the desktop OS.
// ============================================================================

const quickLinks = [
  { id: "about", label: "About", desc: "Who I am" },
  { id: "work", label: "Work", desc: "Capital formation" },
  { id: "health", label: "Health and Fitness", desc: "Training and recovery" },
  { id: "recipes", label: "Cooking and Baking", desc: "Tested recipes" },
];

const exploreLinks = [
  { id: "now", label: "Now" },
  { id: "resume", label: "Resume" },
  { id: "contact", label: "Contact" },
  { id: "card", label: "Business Card" },
  { id: "linktree", label: "Links" },
  { id: "more", label: "More" },
];

const tips = [
  "⌘+Space: Spotlight search to find anything",
  "F9: Exposé to see all open windows",
  "Right-click the desktop for quick actions",
  "Drag the desktop icons to rearrange them",
  "Try typing \"whoami\" in Terminal",
];

export default function StartHereApp() {
  const { openItem } = useDesktop();

  const open = (id: string) => {
    const item = findFSItem(id);
    if (item) openItem(item);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--desktop-surface)" }}>
      {/* Hero header */}
      <div className="shrink-0 px-5 pt-5 pb-3">
        <h1 className="text-[18px] font-bold" style={{ color: "var(--desktop-text)" }}>
          Welcome
        </h1>
        <p className="text-[12px] mt-1" style={{ color: "var(--desktop-text-secondary)" }}>
          I raise capital for real estate at Menlo Equities. Outside of work I train and cook.
          Pick a section below, or use the dock at the bottom of the screen.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {/* Quick access grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickLinks.map((card) => (
            <button
              key={card.id}
              onClick={() => open(card.id)}
              className="flex items-center gap-3 p-3 rounded-lg text-left
                         transition-all duration-150
                         hover:shadow-md active:scale-[0.98]"
              style={{
                background: "var(--desktop-bg)",
                border: "1px solid var(--desktop-border)",
              }}
            >
              <PantherIcon itemId={card.id} size={36} />
              <div>
                <div className="text-[12px] font-semibold" style={{ color: "var(--desktop-text)" }}>
                  {card.label}
                </div>
                <div className="text-[10px]" style={{ color: "var(--desktop-text-secondary)" }}>
                  {card.desc}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Explore row */}
        <div className="mb-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2"
               style={{ color: "var(--desktop-text-secondary)" }}>
            Explore
          </div>
          <div className="flex flex-wrap gap-2">
            {exploreLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => open(link.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px]
                           font-medium transition-colors hover:bg-desktop-accent hover:text-white"
                style={{
                  background: "var(--desktop-bg)",
                  border: "1px solid var(--desktop-border)",
                  color: "var(--desktop-text)",
                }}
              >
                <PantherIcon itemId={link.id} size={16} />
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div
          className="rounded-lg p-3"
          style={{ background: "var(--desktop-bg)", border: "1px solid var(--desktop-border)" }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
               style={{ color: "var(--desktop-text-secondary)" }}>
            Tips &amp; Shortcuts
          </div>
          {tips.map((tip, i) => (
            <div key={i} className="text-[11px] py-0.5" style={{ color: "var(--desktop-text)" }}>
              {tip}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 flex items-center justify-center py-1.5 border-t text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          color: "var(--desktop-text-secondary)",
        }}
      >
        Built with Next.js • Deployed on Vercel • View source on GitHub
      </div>
    </div>
  );
}
