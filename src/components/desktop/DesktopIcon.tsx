"use client";

import React, { useCallback, useState } from "react";
import * as Icons from "lucide-react";
import type { FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";

// ============================================================================
// DESKTOP ICON (ryOS Retro Mac Style)
// ============================================================================
// Muted gradient colors, dark text labels, softer shadows. Double-click to
// open. Selected state shows accent blue highlight behind label.
// ============================================================================

interface DesktopIconProps {
  item: FSItem;
}

// Muted, softer color palette for retro Mac feel
const iconGradients: Record<string, [string, string]> = {
  User:        ["#7eb8da", "#5a9cbf"],
  Briefcase:   ["#8b8fc7", "#6e72a8"],
  PenTool:     ["#d4a0c0", "#b87da0"],
  Image:       ["#7eb8da", "#5a9cbf"],
  Mail:        ["#7bc89a", "#5aad7d"],
  Sparkles:    ["#d4a07a", "#c08860"],
  Settings:    ["#a8b0c0", "#8e96a8"],
  Music:       ["#d49090", "#b87070"],
  Video:       ["#9088c0", "#7570a0"],
  Headphones:  ["#c890a8", "#a87090"],
  Layers:      ["#6898c0", "#5080a8"],
  FileText:    ["#b8c0c8", "#98a0a8"],
  BookOpen:    ["#c8b080", "#a89068"],
  Linkedin:    ["#5a8aaa", "#4878a0"],
  Github:      ["#606060", "#484848"],
  GalleryHorizontalEnd: ["#68b0b0", "#509898"],
  Disc3:       ["#c080a0", "#a06888"],
  ListMusic:   ["#8880b0", "#706898"],
};

const defaultGradient: [string, string] = ["#808890", "#687078"];

function getIcon(name: string) {
  const IconComponent = (Icons as Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>>)[name];
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
