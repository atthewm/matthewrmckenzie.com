"use client";

import React, { useCallback, useState } from "react";
import * as Icons from "lucide-react";
import type { FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";

// ============================================================================
// DESKTOP ICON (Mac OS X 10.3 Panther Aqua)
// ============================================================================
// Glossy gradient icon backgrounds, Aqua-toned palette, soft shadows.
// Double-click to open. Selected state shows accent blue highlight.
// ============================================================================

interface DesktopIconProps {
  item: FSItem;
}

// Glossy Aqua color palette
const iconGradients: Record<string, [string, string]> = {
  User:        ["#6CB4E8", "#3A8AD0"],
  Briefcase:   ["#8890D0", "#5A62B0"],
  PenTool:     ["#D090B8", "#B06898"],
  Image:       ["#6CB4E8", "#3A8AD0"],
  Mail:        ["#68C890", "#40A868"],
  Sparkles:    ["#E8A860", "#D08840"],
  Settings:    ["#A0AAC0", "#7880A0"],
  Music:       ["#E08080", "#C05050"],
  Video:       ["#9888C8", "#7060A8"],
  Headphones:  ["#D088A8", "#B06888"],
  Layers:      ["#58A0D0", "#3878B0"],
  FileText:    ["#B0B8C8", "#8890A0"],
  BookOpen:    ["#D0B078", "#B09058"],
  Linkedin:    ["#4A8AD0", "#2868B0"],
  Github:      ["#585858", "#383838"],
  GalleryHorizontalEnd: ["#58B8B8", "#389898"],
  Disc3:       ["#D078A0", "#B05880"],
  ListMusic:   ["#8878C0", "#6058A0"],
  Heart:       ["#E06060", "#C03838"],
  UtensilsCrossed: ["#E89050", "#D07030"],
};

const defaultGradient: [string, string] = ["#7888A0", "#586880"];

function getIcon(name: string) {
  const lib = Icons as Record<string, unknown>;
  const IconComponent = lib[name] as React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> | undefined;
  return IconComponent || Icons.File;
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

  const Icon = getIcon(item.icon);
  const [c1, c2] = iconGradients[item.icon] || defaultGradient;

  // Icon sizes based on settings
  const sizeMap = { small: 40, medium: 48, large: 56 };
  const iconSizeMap = { small: 20, medium: 24, large: 28 };
  const boxSize = sizeMap[settings.iconSize];
  const iconSize = iconSizeMap[settings.iconSize];

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
      {/* Muted retro icon */}
      <div
        className="relative flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform duration-150"
        style={{
          width: boxSize,
          height: boxSize,
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Icon size={iconSize} className="text-white relative z-10 drop-shadow-sm" strokeWidth={1.8} />
      </div>

      {/* Label with dark text */}
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

export { getIcon };
