"use client";

import React, { useCallback, useState } from "react";
import * as Icons from "lucide-react";
import type { FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import { useSettings } from "@/hooks/useSettingsStore";

// ============================================================================
// DESKTOP ICON (Aqua Era OS X)
// ============================================================================
// Glossy, saturated Aqua-style icons with white label text and drop shadow.
// Double-click to open. Selected state shows blue highlight behind label.
// ============================================================================

interface DesktopIconProps {
  item: FSItem;
}

// Map of icon name -> gradient colors for the Aqua glossy look
const iconGradients: Record<string, [string, string]> = {
  User:        ["#4facfe", "#00f2fe"],
  Briefcase:   ["#667eea", "#764ba2"],
  PenTool:     ["#f093fb", "#f5576c"],
  Image:       ["#4facfe", "#00f2fe"],
  Mail:        ["#43e97b", "#38f9d7"],
  Sparkles:    ["#fa709a", "#fee140"],
  Settings:    ["#a8b8d8", "#c0c0c0"],
  Music:       ["#ff6b6b", "#ee5a24"],
  Video:       ["#6c5ce7", "#a29bfe"],
  Headphones:  ["#fd79a8", "#e84393"],
  Layers:      ["#0984e3", "#74b9ff"],
  FileText:    ["#dfe6e9", "#b2bec3"],
  BookOpen:    ["#fdcb6e", "#e17055"],
  Linkedin:    ["#0077b5", "#00a0dc"],
  Github:      ["#333333", "#666666"],
  GalleryHorizontalEnd: ["#00cec9", "#81ecec"],
  Disc3:       ["#e84393", "#fd79a8"],
  ListMusic:   ["#6c5ce7", "#a29bfe"],
};

const defaultGradient: [string, string] = ["#636e72", "#b2bec3"];

function getIcon(name: string) {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>>)[name];
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
  const sizeMap = { small: 40, medium: 52, large: 64 };
  const iconSizeMap = { small: 20, medium: 26, large: 32 };
  const boxSize = sizeMap[settings.iconSize];
  const iconSize = iconSizeMap[settings.iconSize];

  return (
    <button
      className={`
        flex flex-col items-center gap-1 p-2 rounded w-[88px]
        focus-visible:outline-none
        transition-all duration-100 group
      `}
      onDoubleClick={handleOpen}
      onClick={() => setSelected(true)}
      onBlur={() => setSelected(false)}
      aria-label={`Open ${item.name}`}
      title={item.description || item.name}
    >
      {/* Aqua glossy icon */}
      <div
        className="relative flex items-center justify-center rounded-[12px] group-hover:scale-105 transition-transform duration-150"
        style={{
          width: boxSize,
          height: boxSize,
          background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
          boxShadow: `
            0 4px 12px rgba(0,0,0,0.3),
            inset 0 1px 1px rgba(255,255,255,0.5),
            inset 0 -1px 2px rgba(0,0,0,0.15)
          `,
          border: "1px solid rgba(255,255,255,0.3)",
        }}
      >
        {/* Glossy highlight overlay */}
        <div
          className="absolute inset-x-0 top-0 rounded-t-[11px]"
          style={{
            height: "50%",
            background: "linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.05) 100%)",
          }}
        />
        <Icon size={iconSize} className="text-white relative z-10 drop-shadow-sm" strokeWidth={1.8} />
      </div>

      {/* Label with classic OS X styling */}
      <span
        className={`
          text-[11px] font-medium text-center leading-tight line-clamp-2 px-1 py-0.5 rounded
          ${selected
            ? "bg-[#3b82f6] text-white"
            : "text-white"
          }
        `}
        style={{
          textShadow: selected ? "none" : "0 1px 3px rgba(0,0,0,0.7), 0 0px 1px rgba(0,0,0,0.5)",
        }}
      >
        {item.name}
      </span>
    </button>
  );
}

export { getIcon };
