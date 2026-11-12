import React from "react";
import { whoopCircle } from "@/config/brands";

// Official WHOOP circle mark, for the WHOOP entries below.
const WHOOP_ICON = whoopCircle.light;

// ============================================================================
// MAC OS X 10.3 PANTHER ICONS - PNG Assets
// ============================================================================
// Authentic Mac OS X 10.3 Panther PNG icons mapped to filesystem items.
// ============================================================================

interface IconProps {
  size?: number;
}

// ---------------------------------------------------------------------------
// Icon filename mapping: fsItem ID -> PNG filename in /icons/panther/
// ---------------------------------------------------------------------------

const iconMap: Record<string, string> = {
  // Core apps
  "start-here":     "help.png",
  "about":          "finder.png",
  "work":           "applications-folder.png",
  "writing":        "textedit.png",
  "now":            "stickies.png",
  "browser":        "safari.png",
  "settings":       "system-preferences.png",
  "terminal":       "terminal.png",
  "stickies":       "stickies.png",
  "contact":        "mail.png",
  "guestbook":      "address-book.png",
  "linktree":       "internet-connection.png",
  "schedule":       "ical.png",
  "ichat":          "ichat.png",
  "photo-booth":    "image-capture.png",
  "chess":          "/icons/custom/chess.svg",
  "minesweeper":    "/icons/custom/minesweeper.svg",
  "whats-new":      "macosx.png",
  "card":           "/icons/custom/card.svg",

  // Media
  "media":          "movies-folder.png",
  "photos":         "iphoto.png",
  "music":          "itunes-2.png",
    "apple-music":    "itunes-3.png",
  "media-movies":   "dvd-player.png",
  "media-tv":       "imovie-hd.png",
  "media-audiobooks": "/icons/custom/audiobooks.svg",

  // Work children
  "more":           "applications.png",
  "resume":         "textedit.png",

  // Writing children
  "essays":         "documents.png",

  // Life + Health
  "life":           "/icons/custom/life.svg",
  "health":         "disk-utility.png",
  "health-overview":"documents.png",
  "whoop-dashboard":WHOOP_ICON,
  "nutrition":      "/icons/custom/nutrition.svg",
  "top-foods":      "/icons/custom/top-foods.svg",
  "hobbies":        "/icons/custom/hobbies.svg",
  "whoop-splits":   "folder.png",
  "whoop-split-arms-abs":   WHOOP_ICON,
  "whoop-split-back":       WHOOP_ICON,
  "whoop-split-chest":      WHOOP_ICON,
  "whoop-split-legs":       WHOOP_ICON,
  "whoop-split-shoulders":  WHOOP_ICON,
  "get-whoop":      "external-link.png",

  // Recipes
  "recipes":                "library-folder.png",
  "rye-starter":            "documents.png",
  "city-loaf-master-recipe":"documents.png",
  "strawberry-jam-honey":   "documents.png",
  "cinnamon-protein-overnight-oats": "documents.png",
  "brownies-9x13":          "documents.png",
  "high-protein-heirloom-blue-corn-tortillas": "documents.png",
  "mamas-healthy-meatballs":"documents.png",
  "parmesan-crusted-baked-chicken-tenders": "documents.png",

  // Start Here children
  "readme":         "documents.png",
  "linkedin":       "external-link.png",
  "github":         "external-link.png",

  // Secrets
  "secrets":        "smart-folder.png",
  "secrets-readme": "documents.png",
};

// Fallback icon for items not in the map
const FALLBACK_ICON = "generic-application.png";

// Entries that start with "/" are full paths (custom SVG icons); everything
// else is a filename in /icons/panther/.
function resolveIcon(filename: string): string {
  return filename.startsWith("/") ? filename : `/icons/panther/${filename}`;
}

// ---------------------------------------------------------------------------
// Icon component that renders a PNG <img>
// ---------------------------------------------------------------------------

// Official brand marks (public/brands/) are single-colour and transparent, so
// they sit on a white rounded tile to read as an icon in both desktop themes.
function isBrandIcon(src: string): boolean {
  return src.startsWith("/brands/");
}

function PantherIconImg({ src, size = 32, alt }: { src: string; size?: number; alt?: string }) {
  const brand = isBrandIcon(src);
  return (
    <img
      src={src}
      alt={alt || (brand ? "WHOOP logo" : "")}
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: "auto",
        ...(brand
          ? { background: "#fff", borderRadius: "22%", padding: Math.round(size * 0.14), boxSizing: "border-box" as const }
          : {}),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Get a Panther icon React component for an fsItem ID (used by Dock)
// ---------------------------------------------------------------------------

const iconCache = new Map<string, React.FC<IconProps>>();

export function getPantherIcon(fsItemId: string): React.FC<IconProps> | null {
  const filename = iconMap[fsItemId];
  if (!filename) return null;

  const cached = iconCache.get(fsItemId);
  if (cached) return cached;

  const IconComponent: React.FC<IconProps> = ({ size = 32 }) => (
    <PantherIconImg src={resolveIcon(filename)} size={size} alt={fsItemId} />
  );
  IconComponent.displayName = `PantherIcon_${fsItemId}`;
  iconCache.set(fsItemId, IconComponent);
  return IconComponent;
}

// ---------------------------------------------------------------------------
// Get the PNG path for an fsItem ID (used by DesktopIcon, FolderView, etc.)
// ---------------------------------------------------------------------------

export function getPantherIconPath(fsItemId: string): string {
  const filename = iconMap[fsItemId] || FALLBACK_ICON;
  return resolveIcon(filename);
}

// ---------------------------------------------------------------------------
// Direct render helper: renders a Panther PNG icon by fsItem ID
// ---------------------------------------------------------------------------

export function PantherIcon({ itemId, size = 32 }: { itemId: string; size?: number }) {
  const path = getPantherIconPath(itemId);
  return <PantherIconImg src={path} size={size} alt={itemId} />;
}

export type { IconProps };
