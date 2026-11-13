"use client";

import React from "react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { findFSItem } from "@/data/fs";
import { PantherIcon } from "@/components/desktop/PantherIcons";
import { setLaunchOrigin } from "@/lib/motion";

// ============================================================================
// START HERE
// ============================================================================
// The welcome window. Sized so everything fits without an inner scroll bar at
// its default size, with full size icons and text that meets AA contrast.
// ============================================================================

const quickLinks = [
  { id: "about", label: "About", desc: "Who I am and what I do" },
  { id: "work", label: "Work", desc: "Capital formation and resume" },
  { id: "health", label: "Health", desc: "Training, recovery, nutrition" },
  { id: "recipes", label: "Recipes", desc: "Sourdough and tested recipes" },
];

const exploreLinks = ["contact", "card", "hobbies", "apple-music", "photos", "chess"];

const tips = [
  ["⌘ Space", "Spotlight, to find anything"],
  ["F9", "Exposé, to see every open window"],
  ["Double-click", "an icon on the desktop to open it"],
];

export default function StartHereApp() {
  const { openItem } = useDesktop();

  const open = (id: string, el?: HTMLElement | null) => {
    const item = findFSItem(id);
    if (!item) return;
    setLaunchOrigin(id, el?.querySelector("[data-icon]") ?? el);
    openItem(item);
  };

  return (
    <div className="h-full overflow-auto px-6 pt-5 pb-6">
      <h2 className="text-[20px] font-semibold leading-tight text-desktop-text">Welcome to McKenzie OS</h2>
      <p className="text-[14px] mt-1.5 leading-snug text-desktop-text-secondary">
        I&apos;m Matthew McKenzie. Open anything from the dock or the icons on the right.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {quickLinks.map((card) => (
          <button
            key={card.id}
            onClick={(e) => open(card.id, e.currentTarget)}
            className="aqua-tile flex items-center gap-3 p-3 text-left"
          >
            <PantherIcon itemId={card.id} size={40} />
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-desktop-text">{card.label}</span>
              <span className="block text-[13px] leading-snug text-desktop-text-secondary">{card.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <h3 className="text-[13px] font-semibold text-desktop-text-secondary mt-5 mb-2">More to open</h3>
      <div className="flex flex-wrap gap-2">
        {exploreLinks.map((id) => {
          const item = findFSItem(id);
          if (!item) return null;
          return (
            <button key={id} onClick={(e) => open(id, e.currentTarget)} className="aqua-chip">
              <PantherIcon itemId={id} size={22} />
              {item.name}
            </button>
          );
        })}
      </div>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[13px]">
        {tips.map(([key, desc]) => (
          <React.Fragment key={key}>
            <dt className="font-semibold text-desktop-text whitespace-nowrap">{key}</dt>
            <dd className="text-desktop-text-secondary">{desc}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}
