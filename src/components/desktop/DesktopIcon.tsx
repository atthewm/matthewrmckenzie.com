"use client";

import React, { useCallback, useState } from "react";
import type { FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";
import { PantherIcon } from "./PantherIcons";

// ============================================================================
// DESKTOP ICON (Mac OS X 10.3 Panther)
// ============================================================================
// Authentic Panther PNG icons. Double-click to open. Selected state shows
// accent blue highlight on the label.
// ============================================================================

interface DesktopIconProps {
  item: FSItem;
}

export default function DesktopIcon({ item }: DesktopIconProps) {
  const { openItem } = useDesktop();
  const { settings } = useSettings();
  const [selected, setSelected] = useState(false);

  const handleOpen = useCallback(() => {
    if (item.type === "link" && item.href) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    openItem(item);
  }, [item, openItem]);

  // Icon sizes based on settings
  const sizeMap = { small: 40, medium: 48, large: 56 };
  const boxSize = sizeMap[settings.iconSize];

  return (
    <button
      className={`
        flex flex-col items-center gap-1 p-1.5 rounded w-[80px]
        focus-visible:outline-none
        transition-all duration-100 group
      `}
      onDoubleClick={handleOpen}
      onClick={() => setSelected(true)}
      onBlur={() => setSelected(false)}
      aria-label={`Open ${item.name}`}
      title={item.description || item.name}
    >
      {/* Panther PNG icon */}
      <div
        className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-150"
        style={{
          width: boxSize,
          height: boxSize,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
        }}
      >
        <PantherIcon itemId={item.id} size={boxSize} />
      </div>

      {/* Label */}
      <span
        className={`
          text-[10px] font-medium text-center leading-tight line-clamp-2 px-1 py-0.5 rounded
          ${selected
            ? "bg-desktop-accent text-white"
            : "text-desktop-text"
          }
        `}
        style={{
          textShadow: selected ? "none" : "0 1px 2px rgba(255,255,255,0.5)",
        }}
      >
        {item.name}
      </span>
    </button>
  );
}
