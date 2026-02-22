import React from "react";

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
  "now":            "sherlock.png",
  "browser":        "safari.png",
  "settings":       "system-preferences.png",
  "terminal":       "terminal.png",
  "stickies":       "stickies.png",
  "contact":        "mail.png",
  "guestbook":      "address-book.png",
  "linktree":       "internet-connection.png",
  "schedule":       "ical.png",

  // Media
  "photos":         "iphoto.png",
  "music":          "dvd-player.png",
  "videos":         "quicktime-player.png",
  "apple-music":    "itunes-3.png",

  // Work children
  "projects":       "applications.png",
  "resume":         "textedit.png",

  // Writing children
  "essays":         "documents.png",

  // Health
  "health":         "disk-utility.png",
  "whoop-dashboard":"generic-application.png",
  "whoop-splits":   "folder.png",
  "whoop-split-arms-abs":   "generic-application.png",
  "whoop-split-back":       "generic-application.png",
  "whoop-split-chest":      "generic-application.png",
  "whoop-split-legs":       "generic-application.png",
  "whoop-split-shoulders":  "generic-application.png",
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

// ---------------------------------------------------------------------------
// Icon component that renders a PNG <img>
// ---------------------------------------------------------------------------

function PantherIconImg({ src, size = 32, alt }: { src: string; size?: number; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt || ""}
      width={size}
      height={size}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        imageRendering: "auto",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Get a Panther icon React component for an fsItem ID (used by Dock)
// ---------------------------------------------------------------------------

export function getPantherIcon(fsItemId: string): React.FC<IconProps> | null {
  const filename = iconMap[fsItemId];
  if (!filename) return null;

  const IconComponent: React.FC<IconProps> = ({ size = 32 }) => (
    <PantherIconImg src={`/icons/panther/${filename}`} size={size} alt={fsItemId} />
  );
  IconComponent.displayName = `PantherIcon_${fsItemId}`;
  return IconComponent;
}

// ---------------------------------------------------------------------------
// Get the PNG path for an fsItem ID (used by DesktopIcon, FolderView, etc.)
// ---------------------------------------------------------------------------

export function getPantherIconPath(fsItemId: string): string {
  const filename = iconMap[fsItemId] || FALLBACK_ICON;
  return `/icons/panther/${filename}`;
}

// ---------------------------------------------------------------------------
// Direct render helper: renders a Panther PNG icon by fsItem ID
// ---------------------------------------------------------------------------

export function PantherIcon({ itemId, size = 32 }: { itemId: string; size?: number }) {
  const path = getPantherIconPath(itemId);
  return <PantherIconImg src={path} size={size} alt={itemId} />;
}

export type { IconProps };
