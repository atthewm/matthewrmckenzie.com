import React from "react";
import { AquaIcon, hasAquaIcon } from "@/components/icons/AquaIcons";

// ============================================================================
// APP ICONS
// ============================================================================
// One lookup for every icon on the desktop, dock, Spotlight and phone. Apps
// with a fitting Mac OS X 10.3 Panther PNG use it; the rest use the hand-built
// Aqua SVGs in components/icons/AquaIcons.tsx. scripts/qa/check-icons.mjs
// fails the build if two apps that can sit side by side share an icon.
// ============================================================================

interface IconProps {
  size?: number;
}

/** fsItem id to PNG filename in /icons/panther/. */
export const pantherIconMap: Record<string, string> = {
  "start-here": "help.png",
  about: "finder.png",
  work: "applications-folder.png",
  writing: "documents-folder.png",
  now: "sherlock.png",
  browser: "safari.png",
  settings: "system-preferences.png",
  terminal: "terminal.png",
  stickies: "stickies.png",
  contact: "mail.png",
  guestbook: "address-book.png",
  linktree: "internet-connection.png",
  schedule: "ical.png",
  ichat: "ichat.png",
  "photo-booth": "image-capture.png",
  minesweeper: "calculator.png",
  more: "applications.png",

  media: "movies-folder.png",
  photos: "iphoto.png",
  music: "music-folder.png",
  videos: "quicktime-player.png",
  "apple-music": "itunes-3.png",
  "media-movies": "dvd-player.png",
  "media-tv": "imovie-hd.png",
  "media-audiobooks": "itunes-2.png",

  "work-overview": "preview.png",
  resume: "textedit.png",
  essays: "documents.png",

  health: "disk-utility.png",
  "health-overview": "documents.png",
  "whoop-splits": "folder.png",
  recipes: "library-folder.png",

  readme: "documents.png",
  linkedin: "external-link.png",
  github: "sites-folder.png",
  secrets: "smart-folder.png",
  "secrets-readme": "documents.png",
};

/** Items without their own entry: documents get the page icon, the rest a folder or app. */
function fallbackFile(id: string): string {
  if (id.startsWith("whoop-split-")) return "documents.png";
  return "documents.png";
}

function PantherIconImg({ src, size = 32, alt }: { src: string; size?: number; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      width={size}
      height={size}
      draggable={false}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

/** PNG path for an item, or null when the item uses an Aqua SVG. */
export function getPantherIconPath(fsItemId: string): string {
  return `/icons/panther/${pantherIconMap[fsItemId] ?? fallbackFile(fsItemId)}`;
}

/** Render the icon for any fsItem id. */
export function PantherIcon({ itemId, size = 32 }: { itemId: string; size?: number }) {
  return (
    <span data-icon={iconKey(itemId)} className="inline-flex shrink-0" style={{ width: size, height: size }}>
      {hasAquaIcon(itemId) ? (
        <AquaIcon id={itemId} size={size} />
      ) : (
        <PantherIconImg src={getPantherIconPath(itemId)} size={size} />
      )}
    </span>
  );
}

const iconCache = new Map<string, React.FC<IconProps>>();

/** Component form, used by the dock. Never null: every item has an icon. */
export function getPantherIcon(fsItemId: string): React.FC<IconProps> {
  const cached = iconCache.get(fsItemId);
  if (cached) return cached;
  const IconComponent: React.FC<IconProps> = ({ size = 32 }) => <PantherIcon itemId={fsItemId} size={size} />;
  IconComponent.displayName = `AppIcon_${fsItemId}`;
  iconCache.set(fsItemId, IconComponent);
  return IconComponent;
}

/** Stable key describing which artwork an item shows, for the duplicate check. */
export function iconKey(fsItemId: string): string {
  if (hasAquaIcon(fsItemId)) return `aqua:${fsItemId}`;
  return `png:${pantherIconMap[fsItemId] ?? fallbackFile(fsItemId)}`;
}

export type { IconProps };
