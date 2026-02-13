import React from "react";

// ============================================================================
// RETRO MAC OS 9 ICONS
// ============================================================================
// Hand-drawn pixel-art inspired SVG icons that evoke the classic Mac OS 9
// aesthetic: black outlines, limited muted palettes, chunky shapes, subtle
// highlights, and that unmistakable late-90s Finder charm.
// ============================================================================

interface IconProps {
  size?: number;
}

// ---------------------------------------------------------------------------
// Start Here - classic Mac "Read Me" / starburst document
// ---------------------------------------------------------------------------
function StartHereIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document body */}
      <rect x="6" y="4" width="20" height="24" rx="2" fill="#FFFFCC" stroke="#333" strokeWidth="1.5" />
      <path d="M6 6a2 2 0 012-2h12l6 6v18a2 2 0 01-2 2H8a2 2 0 01-2-2V6z" fill="#FFFFCC" stroke="#333" strokeWidth="1.5" />
      {/* Folded corner */}
      <path d="M20 4v6h6" fill="#EEE8AA" stroke="#333" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Star burst */}
      <path d="M14 15l1.5-3.5L17 15l3.2.8-2.5 2.2.8 3.5-3-1.8-3 1.8.8-3.5-2.5-2.2L14 15z" fill="#FF9933" stroke="#333" strokeWidth="0.8" strokeLinejoin="round" />
      {/* Text lines */}
      <line x1="9" y1="23" x2="18" y2="23" stroke="#999" strokeWidth="1" strokeLinecap="round" />
      <line x1="9" y1="25.5" x2="15" y2="25.5" stroke="#999" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// About - classic Mac "About This Mac" happy face icon
// ---------------------------------------------------------------------------
function AboutIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Monitor body */}
      <rect x="4" y="3" width="24" height="18" rx="2" fill="#D4D0C8" stroke="#333" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="6" y="5" width="20" height="13" rx="1" fill="#336699" />
      {/* Happy Mac face */}
      <rect x="13" y="8" width="2" height="2" rx="0.5" fill="#FFFFCC" />
      <rect x="17" y="8" width="2" height="2" rx="0.5" fill="#FFFFCC" />
      <path d="M12.5 13c0 0 1.5 2.5 3.5 2.5s3.5-2.5 3.5-2.5" stroke="#FFFFCC" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Monitor stand */}
      <path d="M12 21h8v2H12z" fill="#C0BDB5" stroke="#333" strokeWidth="1" />
      <path d="M10 23h12" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      {/* Base */}
      <rect x="9" y="23" width="14" height="2" rx="1" fill="#C0BDB5" stroke="#333" strokeWidth="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Work - classic Mac OS briefcase / portfolio
// ---------------------------------------------------------------------------
function WorkIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Handle */}
      <path d="M12 9V7a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#333" strokeWidth="1.5" fill="none" />
      {/* Briefcase body */}
      <rect x="4" y="9" width="24" height="16" rx="2" fill="#996633" stroke="#333" strokeWidth="1.5" />
      {/* Highlight band */}
      <rect x="4" y="9" width="24" height="5" rx="2" fill="#AA7744" />
      <line x1="4" y1="14" x2="28" y2="14" stroke="#333" strokeWidth="0.8" />
      {/* Center clasp */}
      <rect x="13" y="13" width="6" height="4" rx="1" fill="#DDBB77" stroke="#333" strokeWidth="1" />
      <circle cx="16" cy="15" r="1" fill="#333" />
      {/* Bottom shadow */}
      <line x1="5" y1="24" x2="27" y2="24" stroke="#7A5522" strokeWidth="1" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Writing - classic Mac notepad with pencil
// ---------------------------------------------------------------------------
function WritingIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Notepad */}
      <rect x="5" y="5" width="18" height="23" rx="1" fill="#FFFFF0" stroke="#333" strokeWidth="1.5" />
      {/* Spiral binding */}
      <circle cx="8" cy="7" r="1.2" fill="none" stroke="#333" strokeWidth="1" />
      <circle cx="8" cy="11" r="1.2" fill="none" stroke="#333" strokeWidth="1" />
      <circle cx="8" cy="15" r="1.2" fill="none" stroke="#333" strokeWidth="1" />
      <circle cx="8" cy="19" r="1.2" fill="none" stroke="#333" strokeWidth="1" />
      {/* Lines */}
      <line x1="11" y1="10" x2="20" y2="10" stroke="#CCCCBB" strokeWidth="0.7" />
      <line x1="11" y1="14" x2="20" y2="14" stroke="#CCCCBB" strokeWidth="0.7" />
      <line x1="11" y1="18" x2="20" y2="18" stroke="#CCCCBB" strokeWidth="0.7" />
      <line x1="11" y1="22" x2="18" y2="22" stroke="#CCCCBB" strokeWidth="0.7" />
      {/* Pencil */}
      <g transform="translate(18, 2) rotate(30)">
        <rect x="0" y="0" width="4" height="18" rx="0.5" fill="#FFCC33" stroke="#333" strokeWidth="1" />
        <rect x="0" y="0" width="4" height="3" rx="0.5" fill="#FF9999" stroke="#333" strokeWidth="0.8" />
        <path d="M0.5 18L2 22L3.5 18" fill="#FFE0B0" stroke="#333" strokeWidth="0.8" />
        <rect x="0" y="17" width="4" height="1.5" fill="#C0C0C0" stroke="#333" strokeWidth="0.5" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Photos - classic polaroid / picture icon
// ---------------------------------------------------------------------------
function PhotosIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back photo (tilted) */}
      <g transform="rotate(-8, 16, 16)">
        <rect x="6" y="4" width="20" height="24" rx="1" fill="#F5F5F0" stroke="#333" strokeWidth="1" />
      </g>
      {/* Front polaroid */}
      <rect x="6" y="4" width="20" height="24" rx="1" fill="#FFFFF5" stroke="#333" strokeWidth="1.5" />
      {/* Photo area */}
      <rect x="8" y="6" width="16" height="14" fill="#6699AA" />
      {/* Mountain landscape */}
      <path d="M8 17l5-6 4 4 3-2 4 4v3H8z" fill="#558866" />
      <path d="M8 18l6-4 4 3 6-2v5H8z" fill="#447755" />
      {/* Sun */}
      <circle cx="20" cy="9" r="2" fill="#FFCC44" />
      {/* White border bottom */}
      <rect x="8" y="20" width="16" height="6" fill="#FFFFF5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Music - classic headphones icon
// ---------------------------------------------------------------------------
function MusicIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Headband */}
      <path d="M7 18V14a9 9 0 0118 0v4" stroke="#333" strokeWidth="2" fill="none" />
      <path d="M8 17V14a8 8 0 0116 0v3" stroke="#555" strokeWidth="1" fill="none" />
      {/* Left ear cup */}
      <rect x="4" y="16" width="6" height="10" rx="2" fill="#CC3333" stroke="#333" strokeWidth="1.5" />
      <rect x="5" y="17" width="4" height="3" rx="1" fill="#DD5555" />
      {/* Right ear cup */}
      <rect x="22" y="16" width="6" height="10" rx="2" fill="#CC3333" stroke="#333" strokeWidth="1.5" />
      <rect x="23" y="17" width="4" height="3" rx="1" fill="#DD5555" />
      {/* Cushion detail */}
      <rect x="5" y="22" width="4" height="2" rx="0.5" fill="#AA2222" />
      <rect x="23" y="22" width="4" height="2" rx="0.5" fill="#AA2222" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Videos - classic TV set
// ---------------------------------------------------------------------------
function VideosIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <line x1="12" y1="4" x2="16" y2="9" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="4" x2="16" y2="9" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1" fill="#666" />
      <circle cx="20" cy="4" r="1" fill="#666" />
      {/* TV body */}
      <rect x="4" y="9" width="24" height="18" rx="3" fill="#D4D0C8" stroke="#333" strokeWidth="1.5" />
      {/* Screen */}
      <rect x="6" y="11" width="15" height="12" rx="2" fill="#223344" stroke="#333" strokeWidth="1" />
      {/* Screen glare */}
      <path d="M7 12h4v2H7z" fill="rgba(255,255,255,0.15)" rx="0.5" />
      {/* Play triangle on screen */}
      <path d="M11 14.5l5 3-5 3z" fill="#66AACC" opacity="0.8" />
      {/* Knobs */}
      <circle cx="24" cy="15" r="2" fill="#999" stroke="#333" strokeWidth="1" />
      <circle cx="24" cy="15" r="0.5" fill="#333" />
      <circle cx="24" cy="20" r="2" fill="#999" stroke="#333" strokeWidth="1" />
      <circle cx="24" cy="20" r="0.5" fill="#333" />
      {/* Speaker grille */}
      <line x1="22" y1="24" x2="26" y2="24" stroke="#999" strokeWidth="0.7" />
      <line x1="22" y1="25.5" x2="26" y2="25.5" stroke="#999" strokeWidth="0.7" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Apple Music - classic CD / disc with music note
// ---------------------------------------------------------------------------
function AppleMusicIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* CD disc */}
      <circle cx="16" cy="16" r="12" fill="#E8E8E8" stroke="#333" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10.5" fill="linear-gradient(#DDD, #BBB)" />
      {/* Rainbow sheen rings */}
      <circle cx="16" cy="16" r="10" fill="none" stroke="#CCCCDD" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="8.5" fill="none" stroke="#DDCCDD" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="7" fill="none" stroke="#CCDDCC" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="5.5" fill="none" stroke="#DDDDCC" strokeWidth="0.5" />
      {/* Sheen effect */}
      <path d="M10 8a10.5 10.5 0 014-2.5" stroke="rgba(180,160,220,0.4)" strokeWidth="2" fill="none" />
      <path d="M22 10a10.5 10.5 0 011 3" stroke="rgba(160,200,180,0.3)" strokeWidth="2" fill="none" />
      {/* Center hole */}
      <circle cx="16" cy="16" r="3" fill="#F8F8F8" stroke="#333" strokeWidth="1" />
      <circle cx="16" cy="16" r="1" fill="#333" />
      {/* Music note overlay */}
      <g transform="translate(18, 7)">
        <line x1="0" y1="2" x2="0" y2="10" stroke="#333" strokeWidth="1.5" />
        <ellipse cx="-1.5" cy="10" rx="2.5" ry="1.8" fill="#333" />
        <path d="M0 2l5-1.5v2L0 4" fill="#333" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Contact - classic Mac mail / envelope
// ---------------------------------------------------------------------------
function ContactIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Envelope body */}
      <rect x="3" y="8" width="26" height="17" rx="2" fill="#F5F0E0" stroke="#333" strokeWidth="1.5" />
      {/* Envelope flap */}
      <path d="M3 10l13 8 13-8" stroke="#333" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* Inner flap shading */}
      <path d="M3.5 10l12.5 7.5L28.5 10" fill="#EBE5D5" />
      <path d="M3 10l13 8 13-8" stroke="#333" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* Bottom fold lines */}
      <line x1="3" y1="25" x2="12" y2="17" stroke="#DDD5C5" strokeWidth="0.8" />
      <line x1="29" y1="25" x2="20" y2="17" stroke="#DDD5C5" strokeWidth="0.8" />
      {/* Stamp */}
      <rect x="22" y="9" width="5" height="4" rx="0.5" fill="#CC6666" stroke="#333" strokeWidth="0.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Health - classic heart with pulse line
// ---------------------------------------------------------------------------
function HealthIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Heart shape */}
      <path
        d="M16 27s-10-6.5-10-13c0-4 3-7 6.5-7 2 0 3.5 1.2 3.5 1.2S17.5 7 19.5 7C23 7 26 10 26 14c0 6.5-10 13-10 13z"
        fill="#DD4444" stroke="#333" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Heart highlight */}
      <path d="M10 11c0-2 1.5-3.5 3-3.5" stroke="#FF8888" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Pulse line */}
      <polyline
        points="6,18 11,18 13,14 15,22 17,16 19,20 21,18 26,18"
        stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Settings - classic Mac control panel / gear
// ---------------------------------------------------------------------------
function SettingsIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Gear outer shape */}
      <path
        d="M14 3h4l1 3.2a9.5 9.5 0 012.2 1.3l3-1.2 2 3.4-2.2 2.2a9.5 9.5 0 010 2.6l2.2 2.2-2 3.4-3-1.2a9.5 9.5 0 01-2.2 1.3L18 29h-4l-1-3.2a9.5 9.5 0 01-2.2-1.3l-3 1.2-2-3.4 2.2-2.2a9.5 9.5 0 010-2.6L5.8 15.3l2-3.4 3 1.2A9.5 9.5 0 0113 11.8L14 3z"
        fill="#999999" stroke="#333" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Gear highlight */}
      <path
        d="M14.5 4h3l0.8 2.8"
        stroke="#BBBBBB" strokeWidth="1" strokeLinecap="round" fill="none"
      />
      {/* Center circle */}
      <circle cx="16" cy="16" r="5" fill="#D4D0C8" stroke="#333" strokeWidth="1.5" />
      {/* Inner detail */}
      <circle cx="16" cy="16" r="2.5" fill="#AAAAAA" stroke="#333" strokeWidth="1" />
      {/* Screwdriver slot */}
      <line x1="14.5" y1="16" x2="17.5" y2="16" stroke="#333" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ICON REGISTRY
// ---------------------------------------------------------------------------
// Maps fsItem.id to the appropriate OS 9 icon component.
// ---------------------------------------------------------------------------

const os9Icons: Record<string, React.FC<IconProps>> = {
  "start-here":   StartHereIcon,
  "about":        AboutIcon,
  "work":         WorkIcon,
  "writing":      WritingIcon,
  "photos":       PhotosIcon,
  "music":        MusicIcon,
  "videos":       VideosIcon,
  "apple-music":  AppleMusicIcon,
  "contact":      ContactIcon,
  "health":       HealthIcon,
  "settings":     SettingsIcon,
};

export function getOS9Icon(fsItemId: string): React.FC<IconProps> | null {
  return os9Icons[fsItemId] || null;
}

export type { IconProps };
