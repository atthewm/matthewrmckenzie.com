import React from "react";

// ============================================================================
// MAC OS X 10.3 PANTHER AQUA ICONS
// ============================================================================
// Glossy, rounded Aqua-style SVG icons with gradient fills, subtle highlights,
// and soft shadows - the signature Mac OS X Panther look.
// ============================================================================

interface IconProps {
  size?: number;
}

// ---------------------------------------------------------------------------
// Start Here - glossy blue info document with starburst
// ---------------------------------------------------------------------------
function StartHereIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sh-doc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFEF5" />
          <stop offset="100%" stopColor="#F0ECD0" />
        </linearGradient>
        <linearGradient id="sh-star" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
      </defs>
      <rect x="5" y="3" width="22" height="26" rx="3" fill="url(#sh-doc)" stroke="#B8A970" strokeWidth="1" />
      <path d="M5 6a3 3 0 013-3h12l7 7v19a3 3 0 01-3 3H8a3 3 0 01-3-3V6z" fill="url(#sh-doc)" stroke="#B8A970" strokeWidth="1" />
      <path d="M20 3v7h7" fill="#EDE7C0" stroke="#B8A970" strokeWidth="1" strokeLinejoin="round" />
      <path d="M15 14.5l1.2-3 1.2 3 3 .6-2.2 2 .6 3-2.6-1.5-2.6 1.5.6-3-2.2-2 3-.6z" fill="url(#sh-star)" stroke="#C67A00" strokeWidth="0.6" strokeLinejoin="round" />
      <rect x="8" y="22" width="10" height="1" rx="0.5" fill="#CCC5A0" />
      <rect x="8" y="24.5" width="7" height="1" rx="0.5" fill="#CCC5A0" />
      {/* Gloss */}
      <rect x="6" y="3.5" width="14" height="6" rx="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// About - glossy Aqua monitor with happy mac
// ---------------------------------------------------------------------------
function AboutIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ab-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8E8EC" />
          <stop offset="100%" stopColor="#C4C4CC" />
        </linearGradient>
        <linearGradient id="ab-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5A9FD4" />
          <stop offset="100%" stopColor="#2A6FA8" />
        </linearGradient>
      </defs>
      <rect x="3" y="2" width="26" height="19" rx="3" fill="url(#ab-body)" stroke="#888" strokeWidth="1" />
      <rect x="5.5" y="4.5" width="21" height="14" rx="1.5" fill="url(#ab-screen)" />
      {/* Happy Mac */}
      <rect x="13" y="7.5" width="2" height="2" rx="1" fill="#FFFDE0" />
      <rect x="17" y="7.5" width="2" height="2" rx="1" fill="#FFFDE0" />
      <path d="M13 13c0 0 1.2 2.5 3 2.5s3-2.5 3-2.5" stroke="#FFFDE0" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Stand */}
      <path d="M13 21h6v2.5H13z" fill="#B8B8C0" stroke="#888" strokeWidth="0.8" />
      <rect x="10" y="23.5" width="12" height="2" rx="1" fill="#C8C8D0" stroke="#888" strokeWidth="0.8" />
      {/* Gloss */}
      <rect x="5.5" y="4.5" width="21" height="5" rx="1.5" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Work - glossy Aqua briefcase
// ---------------------------------------------------------------------------
function WorkIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wk-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A67C52" />
          <stop offset="50%" stopColor="#8B5E34" />
          <stop offset="100%" stopColor="#6B3F1A" />
        </linearGradient>
      </defs>
      <path d="M12 8V6.5a2.5 2.5 0 012.5-2.5h3A2.5 2.5 0 0120 6.5V8" stroke="#5A3510" strokeWidth="1.5" fill="none" />
      <rect x="3" y="8" width="26" height="17" rx="3" fill="url(#wk-body)" stroke="#5A3510" strokeWidth="1" />
      <rect x="3" y="8" width="26" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
      <rect x="12.5" y="13" width="7" height="4" rx="1.5" fill="#D4A05A" stroke="#5A3510" strokeWidth="0.8" />
      <circle cx="16" cy="15" r="1" fill="#5A3510" />
      <path d="M3 14h26" stroke="rgba(0,0,0,0.12)" strokeWidth="0.5" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Writing - glossy yellow notepad with pen
// ---------------------------------------------------------------------------
function WritingIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wr-pad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFEF0" />
          <stop offset="100%" stopColor="#F5F0D0" />
        </linearGradient>
      </defs>
      <rect x="5" y="4" width="19" height="24" rx="2" fill="url(#wr-pad)" stroke="#C8BC8A" strokeWidth="1" />
      {/* Lines */}
      <line x1="9" y1="10" x2="21" y2="10" stroke="#D8D0B0" strokeWidth="0.6" />
      <line x1="9" y1="13.5" x2="21" y2="13.5" stroke="#D8D0B0" strokeWidth="0.6" />
      <line x1="9" y1="17" x2="21" y2="17" stroke="#D8D0B0" strokeWidth="0.6" />
      <line x1="9" y1="20.5" x2="21" y2="20.5" stroke="#D8D0B0" strokeWidth="0.6" />
      <line x1="9" y1="24" x2="17" y2="24" stroke="#D8D0B0" strokeWidth="0.6" />
      {/* Red margin line */}
      <line x1="8" y1="4" x2="8" y2="28" stroke="#E8A0A0" strokeWidth="0.5" />
      {/* Pen */}
      <g transform="translate(20, 1) rotate(25)">
        <rect x="0" y="0" width="3.5" height="16" rx="0.8" fill="#4A90D9" stroke="#2A5A8A" strokeWidth="0.7" />
        <rect x="0" y="0" width="3.5" height="2.5" rx="0.8" fill="#7AB8F0" />
        <path d="M0.3 16L1.75 20L3.2 16" fill="#E8D8B0" stroke="#2A5A8A" strokeWidth="0.5" />
        <rect x="0" y="14.5" width="3.5" height="1.5" fill="#C0C0C8" stroke="#2A5A8A" strokeWidth="0.4" />
      </g>
      {/* Gloss */}
      <rect x="5.5" y="4.5" width="10" height="4" rx="1.5" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Photos - glossy polaroid with landscape
// ---------------------------------------------------------------------------
function PhotosIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ph-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#4A9BD9" />
        </linearGradient>
      </defs>
      {/* Back photo tilted */}
      <g transform="rotate(-6, 16, 16)">
        <rect x="5" y="3.5" width="22" height="25" rx="2" fill="#F8F8F5" stroke="#BBB" strokeWidth="0.8" />
      </g>
      {/* Front polaroid */}
      <rect x="5" y="3.5" width="22" height="25" rx="2" fill="#FFFFF8" stroke="#AAA" strokeWidth="1" />
      <rect x="7.5" y="6" width="17" height="14" rx="1" fill="url(#ph-sky)" />
      {/* Mountains */}
      <path d="M7.5 17l5.5-6 4 4 3.5-2.5 4 4.5v3H7.5z" fill="#4CAF50" />
      <path d="M7.5 18l6-3.5 4 2.5 7-2v5H7.5z" fill="#388E3C" />
      {/* Sun */}
      <circle cx="20.5" cy="9" r="2.2" fill="#FFF176" />
      <circle cx="20.5" cy="9" r="1.5" fill="rgba(255,255,255,0.4)" />
      {/* Gloss on photo */}
      <rect x="7.5" y="6" width="17" height="4" rx="1" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Music - glossy Aqua headphones
// ---------------------------------------------------------------------------
function MusicIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mu-cup" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5BA3FF" />
          <stop offset="50%" stopColor="#2F6AE5" />
          <stop offset="100%" stopColor="#1A4DB8" />
        </linearGradient>
      </defs>
      <path d="M7 18V13.5a9 9 0 0118 0V18" stroke="#555" strokeWidth="2.5" fill="none" />
      <path d="M8 17V14a8 8 0 0116 0v3" stroke="#888" strokeWidth="0.8" fill="none" />
      {/* Left ear */}
      <rect x="3.5" y="16" width="7" height="11" rx="3" fill="url(#mu-cup)" stroke="#1A4DB8" strokeWidth="0.8" />
      <rect x="4.5" y="17" width="5" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
      {/* Right ear */}
      <rect x="21.5" y="16" width="7" height="11" rx="3" fill="url(#mu-cup)" stroke="#1A4DB8" strokeWidth="0.8" />
      <rect x="22.5" y="17" width="5" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Videos - glossy Aqua TV / clapperboard
// ---------------------------------------------------------------------------
function VideosIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="vi-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0E0E8" />
          <stop offset="100%" stopColor="#B0B0BC" />
        </linearGradient>
        <linearGradient id="vi-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334455" />
          <stop offset="100%" stopColor="#1A2A3A" />
        </linearGradient>
      </defs>
      <line x1="12" y1="4" x2="16" y2="8.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="4" x2="16" y2="8.5" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="8.5" width="26" height="18" rx="3" fill="url(#vi-body)" stroke="#888" strokeWidth="1" />
      <rect x="5.5" y="11" width="16" height="12" rx="2" fill="url(#vi-screen)" />
      {/* Play button */}
      <path d="M11 14l6 3.5-6 3.5z" fill="rgba(255,255,255,0.6)" />
      {/* Gloss */}
      <rect x="5.5" y="11" width="16" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
      {/* Knobs */}
      <circle cx="25" cy="15" r="2" fill="#C8C8D0" stroke="#888" strokeWidth="0.8" />
      <circle cx="25" cy="20" r="2" fill="#C8C8D0" stroke="#888" strokeWidth="0.8" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Apple Music - glossy CD with note
// ---------------------------------------------------------------------------
function AppleMusicIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="am-disc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0F0F5" />
          <stop offset="50%" stopColor="#D8D8E0" />
          <stop offset="100%" stopColor="#E8E8F0" />
        </linearGradient>
        <radialGradient id="am-sheen" cx="0.3" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="rgba(200,180,230,0.3)" />
          <stop offset="100%" stopColor="rgba(180,200,220,0.1)" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="url(#am-disc)" stroke="#999" strokeWidth="0.8" />
      <circle cx="16" cy="16" r="13" fill="url(#am-sheen)" />
      {/* Track rings */}
      <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(160,160,180,0.2)" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke="rgba(160,160,180,0.2)" strokeWidth="0.5" />
      {/* Center */}
      <circle cx="16" cy="16" r="3.5" fill="#F5F5FA" stroke="#999" strokeWidth="0.8" />
      <circle cx="16" cy="16" r="1.2" fill="#666" />
      {/* Note */}
      <g transform="translate(18, 6.5)">
        <line x1="0" y1="2" x2="0" y2="10" stroke="#E83E8C" strokeWidth="1.8" strokeLinecap="round" />
        <ellipse cx="-2" cy="10" rx="2.8" ry="2" fill="#E83E8C" />
        <path d="M0 2l5.5-1.5v2.5L0 4.5" fill="#E83E8C" />
      </g>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Contact - glossy Aqua envelope
// ---------------------------------------------------------------------------
function ContactIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ct-env" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFF0" />
          <stop offset="100%" stopColor="#F0E8D0" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="7.5" width="27" height="18" rx="3" fill="url(#ct-env)" stroke="#C0A870" strokeWidth="1" />
      <path d="M2.5 10l13.5 8.5L29.5 10" stroke="#C0A870" strokeWidth="1" fill="none" strokeLinejoin="round" />
      <path d="M3 10.2l13 7.8 13-7.8" fill="rgba(255,255,255,0.4)" />
      <path d="M2.5 10l13.5 8.5L29.5 10" stroke="#C0A870" strokeWidth="1" fill="none" strokeLinejoin="round" />
      {/* Seal */}
      <circle cx="16" cy="20" r="2.5" fill="#E55050" stroke="#B83030" strokeWidth="0.6" />
      <circle cx="16" cy="20" r="1" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Health - glossy heart with pulse
// ---------------------------------------------------------------------------
function HealthIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ht-heart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#D32F2F" />
        </linearGradient>
      </defs>
      <path
        d="M16 27s-10.5-6.5-10.5-13.5c0-4.2 3.2-7.2 6.8-7.2 2.2 0 3.7 1.3 3.7 1.3S17.5 6.3 19.7 6.3c3.6 0 6.8 3 6.8 7.2C26.5 20.5 16 27 16 27z"
        fill="url(#ht-heart)" stroke="#A01010" strokeWidth="1" strokeLinejoin="round"
      />
      {/* Gloss */}
      <path d="M9 10c0-2.5 2-4 3.5-4a3 3 0 012 .8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Pulse */}
      <polyline
        points="5.5,18 10,18 12,14 14.5,22 17,16 19,20 21,18 26.5,18"
        stroke="rgba(255,255,255,0.85)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Settings - glossy Aqua gear
// ---------------------------------------------------------------------------
function SettingsIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="st-gear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0C0CC" />
          <stop offset="50%" stopColor="#909098" />
          <stop offset="100%" stopColor="#78787F" />
        </linearGradient>
      </defs>
      <path
        d="M14 3h4l1 3.2a9.5 9.5 0 012.2 1.3l3-1.2 2 3.4-2.2 2.2a9.5 9.5 0 010 2.6l2.2 2.2-2 3.4-3-1.2a9.5 9.5 0 01-2.2 1.3L18 29h-4l-1-3.2a9.5 9.5 0 01-2.2-1.3l-3 1.2-2-3.4 2.2-2.2a9.5 9.5 0 010-2.6L5.8 15.3l2-3.4 3 1.2A9.5 9.5 0 0113 11.8L14 3z"
        fill="url(#st-gear)" stroke="#555" strokeWidth="1" strokeLinejoin="round"
      />
      {/* Gloss */}
      <path d="M14.5 4h3l0.8 2.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="16" r="5.5" fill="#D8D8E0" stroke="#555" strokeWidth="1" />
      <circle cx="16" cy="16" r="3" fill="#A0A0A8" stroke="#555" strokeWidth="0.8" />
      {/* Inner gloss */}
      <path d="M13 13.5a4.5 4.5 0 013-2" stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Recipes - glossy pot / cookbook
// ---------------------------------------------------------------------------
function RecipesIcon({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rc-pot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8A50" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
      </defs>
      {/* Steam */}
      <path d="M12 7c0-2 1-3 0-4" stroke="#BBB" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M16 6c0-2 1-3 0-4" stroke="#BBB" strokeWidth="1" strokeLinecap="round" fill="none" />
      <path d="M20 7c0-2 1-3 0-4" stroke="#BBB" strokeWidth="1" strokeLinecap="round" fill="none" />
      {/* Pot body */}
      <rect x="5" y="10" width="22" height="14" rx="3" fill="url(#rc-pot)" stroke="#B33C00" strokeWidth="1" />
      {/* Lid */}
      <ellipse cx="16" cy="10.5" rx="12" ry="2.5" fill="#D0D0D8" stroke="#888" strokeWidth="0.8" />
      <ellipse cx="16" cy="10" rx="2" ry="1.2" fill="#A0A0A8" stroke="#888" strokeWidth="0.6" />
      {/* Handles */}
      <rect x="2" y="15" width="3" height="4" rx="1" fill="#C0C0C8" stroke="#888" strokeWidth="0.6" />
      <rect x="27" y="15" width="3" height="4" rx="1" fill="#C0C0C8" stroke="#888" strokeWidth="0.6" />
      {/* Gloss */}
      <rect x="6" y="11" width="12" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      {/* Base */}
      <rect x="7" y="24" width="18" height="3" rx="1.5" fill="#D0D0D8" stroke="#888" strokeWidth="0.6" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ICON REGISTRY
// ---------------------------------------------------------------------------

const pantherIcons: Record<string, React.FC<IconProps>> = {
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
  "recipes":      RecipesIcon,
};

export function getPantherIcon(fsItemId: string): React.FC<IconProps> | null {
  return pantherIcons[fsItemId] || null;
}

export type { IconProps };
