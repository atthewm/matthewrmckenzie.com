import React, { useId } from "react";

// ============================================================================
// AQUA ICONS
// ============================================================================
// Hand-built SVG icons in the Panther and Tiger Aqua style for the apps that
// have no fitting Panther PNG. Each one is drawn on a 64 unit grid with a
// soft gel highlight, a darker rim and a contact shadow, the way the 2003
// and 2005 icons were lit (light from above, slightly in front).
// ============================================================================

type Draw = (id: (name: string) => string) => React.ReactNode;

function Shadow() {
  return <ellipse cx="32" cy="58" rx="22" ry="3.5" fill="#000" opacity="0.22" />;
}

function Gloss({ id, d }: { id: (n: string) => string; d: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#${id("gloss")})`} />
    </>
  );
}

const draw: Record<string, Draw> = {
  // Business Card: an Address Book style card with a photo and a blue header
  card: (id) => (
    <>
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe6ef" />
        </linearGradient>
        <linearGradient id={id("hd")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fb2f5" />
          <stop offset="1" stopColor="#2257c4" />
        </linearGradient>
      </defs>
      <Shadow />
      <rect x="6" y="14" width="52" height="38" rx="5" fill={`url(#${id("bg")})`} stroke="#6b7b91" strokeWidth="1.2" />
      <path d="M6 19a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5v5H6z" fill={`url(#${id("hd")})`} />
      <circle cx="20" cy="36" r="7" fill="#c9d6e6" stroke="#6b7b91" strokeWidth="1" />
      <circle cx="20" cy="34" r="3" fill="#7d8fa8" />
      <path d="M14 42c1.5-4 10.5-4 12 0" fill="#7d8fa8" />
      <rect x="31" y="30" width="20" height="3" rx="1.5" fill="#2257c4" />
      <rect x="31" y="36" width="16" height="2.5" rx="1.25" fill="#8b9ab0" />
      <rect x="31" y="41" width="18" height="2.5" rx="1.25" fill="#8b9ab0" />
      <Gloss id={id} d="M11 15h42a4 4 0 0 1 4 4v2c-16-3-34-3-50 0v-2a4 4 0 0 1 4-4z" />
    </>
  ),

  // Hobbies: a tennis racket crossed with a ball
  hobbies: (id) => (
    <>
      <defs>
        <radialGradient id={id("ball")} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f6ff9a" />
          <stop offset="0.6" stopColor="#cfe62a" />
          <stop offset="1" stopColor="#8fa610" />
        </radialGradient>
        <linearGradient id={id("frame")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5d6670" />
          <stop offset="1" stopColor="#1e252c" />
        </linearGradient>
      </defs>
      <Shadow />
      <g transform="rotate(-35 30 28)">
        <ellipse cx="30" cy="20" rx="14" ry="17" fill="#eef3f8" fillOpacity="0.55" stroke={`url(#${id("frame")})`} strokeWidth="3.5" />
        {[-8, -4, 0, 4, 8].map((dx) => (
          <line key={`v${dx}`} x1={30 + dx} y1="5" x2={30 + dx} y2="35" stroke="#9aa4ae" strokeWidth="0.7" />
        ))}
        {[-10, -5, 0, 5, 10, 15].map((dy) => (
          <line key={`h${dy}`} x1="17" y1={20 + dy} x2="43" y2={20 + dy} stroke="#9aa4ae" strokeWidth="0.7" />
        ))}
        <rect x="27.5" y="37" width="5" height="18" rx="2" fill="#b3202a" stroke="#5c0d12" strokeWidth="0.8" />
      </g>
      <circle cx="46" cy="44" r="10" fill={`url(#${id("ball")})`} stroke="#6d7f0c" strokeWidth="0.8" />
      <path d="M37.5 39c5 1 8 6 6.5 13M54.5 49c-5-1-8-6-6.5-13" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),

  // Top Foods: a gold trophy cup with a fork and knife engraved
  "top-foods": (id) => (
    <>
      <defs>
        <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8720a" />
          <stop offset="0.35" stopColor="#ffe38a" />
          <stop offset="0.6" stopColor="#f2b51c" />
          <stop offset="1" stopColor="#9b6505" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M18 10h28v12c0 10-6 17-14 17s-14-7-14-17z" fill={`url(#${id("gold")})`} stroke="#7a4e05" strokeWidth="1.2" />
      <path d="M18 14H10c0 9 4 14 10 15M46 14h8c0 9-4 14-10 15" fill="none" stroke="#b07b0d" strokeWidth="3" />
      <rect x="29" y="38" width="6" height="8" fill={`url(#${id("gold")})`} stroke="#7a4e05" strokeWidth="1" />
      <rect x="20" y="46" width="24" height="8" rx="2" fill="#5a3b20" stroke="#2f1d0e" strokeWidth="1" />
      <rect x="25" y="48.5" width="14" height="3" rx="1" fill="#e8c46a" />
      <path d="M28 15v6M26 15v4M30 15v4M28 21v9" stroke="#7a4e05" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M36 15c2.5 2 2.5 6 0 7v8" stroke="#7a4e05" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M20 11h24v3c-8-1.5-16-1.5-24 0z" fill="#fff" opacity="0.55" />
    </>
  ),

  // Chess: a knight on a checkered tile
  chess: (id) => (
    <>
      <defs>
        <linearGradient id={id("piece")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c7ccd3" />
        </linearGradient>
      </defs>
      <Shadow />
      <g transform="translate(8 34) skewX(-18) scale(1 0.55)">
        {Array.from({ length: 16 }).map((_, i) => {
          const r = Math.floor(i / 4);
          const c = i % 4;
          return <rect key={i} x={c * 11 + 6} y={r * 11} width="11" height="11" fill={(r + c) % 2 ? "#7b5232" : "#e9d3a8"} />;
        })}
        <rect x="6" y="0" width="44" height="44" fill="none" stroke="#4a2f19" strokeWidth="1.5" />
      </g>
      <path d="M24 48h18l-2-6c4-5 5-13 1-20-3-5-8-9-14-9l-2 5-7 5c-3 3-3 7 0 9l5-1 4-2c-1 6-5 9-6 13z" fill={`url(#${id("piece")})`} stroke="#3b434c" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="27" cy="20" r="1.3" fill="#3b434c" />
      <rect x="21" y="46" width="24" height="5" rx="2" fill={`url(#${id("piece")})`} stroke="#3b434c" strokeWidth="1.4" />
    </>
  ),

  // URL Shortener: two Aqua chain links
  "url-shortener": (id) => (
    <>
      <defs>
        <linearGradient id={id("link")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fd0ff" />
          <stop offset="1" stopColor="#1d62d6" />
        </linearGradient>
      </defs>
      <Shadow />
      <rect x="6" y="20" width="30" height="18" rx="9" fill="none" stroke={`url(#${id("link")})`} strokeWidth="6" transform="rotate(-30 21 29)" />
      <rect x="28" y="26" width="30" height="18" rx="9" fill="none" stroke="#14408f" strokeWidth="6" transform="rotate(-30 43 35)" />
      <rect x="28" y="26" width="30" height="18" rx="9" fill="none" stroke={`url(#${id("link")})`} strokeWidth="4.4" transform="rotate(-30 43 35)" />
    </>
  ),

  // GitHub: a code document with brackets
  "github-projects": (id) => (
    <>
      <defs>
        <linearGradient id={id("doc")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4450" />
          <stop offset="1" stopColor="#151a20" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M14 6h26l12 12v36a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill={`url(#${id("doc")})`} stroke="#0b0e12" strokeWidth="1.2" />
      <path d="M40 6v10a2 2 0 0 0 2 2h10" fill="#59636f" />
      <path d="M25 26l-7 7 7 7M39 26l7 7-7 7" fill="none" stroke="#7ee08a" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 23l-4 20" stroke="#e7edf3" strokeWidth="2.6" strokeLinecap="round" />
    </>
  ),

  // What's New: a starburst over a page
  "whats-new": (id) => (
    <>
      <defs>
        <radialGradient id={id("burst")} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#fff6b0" />
          <stop offset="1" stopColor="#ff9b14" />
        </radialGradient>
      </defs>
      <Shadow />
      <rect x="12" y="8" width="38" height="48" rx="3" fill="#fbfbfb" stroke="#8c96a3" strokeWidth="1.2" />
      {[18, 24, 30].map((y) => <rect key={y} x="18" y={y + 18} width="26" height="2.5" rx="1" fill="#b9c2cc" />)}
      <path d="M32 6l4 8 9-2-5 8 7 6-9 1 1 9-7-5-7 5 1-9-9-1 7-6-5-8 9 2z" fill={`url(#${id("burst")})`} stroke="#c86a00" strokeWidth="1" strokeLinejoin="round" />
    </>
  ),

  // Life: a heart rate monitor screen
  life: (id) => (
    <>
      <defs>
        <linearGradient id={id("case")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f4f7" />
          <stop offset="1" stopColor="#a9b2bd" />
        </linearGradient>
      </defs>
      <Shadow />
      <rect x="6" y="10" width="52" height="40" rx="7" fill={`url(#${id("case")})`} stroke="#5f6a77" strokeWidth="1.2" />
      <rect x="11" y="15" width="42" height="30" rx="3" fill="#0f2a1c" />
      <path d="M13 32h9l3-8 5 15 4-12 3 5h13" fill="none" stroke="#5dff8f" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M48 20c1.5-2 4.5-1 4 1.5-.5 2-4 4-4 4s-3.5-2-4-4c-.5-2.5 2.5-3.5 4-1.5z" fill="#ff5a6e" />
    </>
  ),

  // Turntable: a platter with a record and a tonearm, iTunes 4 metal plinth
  turntable: (id) => (
    <>
      <defs>
        <linearGradient id={id("metal")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3f4f6" />
          <stop offset="0.5" stopColor="#c4c9cf" />
          <stop offset="1" stopColor="#8e959d" />
        </linearGradient>
        <radialGradient id={id("vinyl")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#0c0c0c" />
        </radialGradient>
      </defs>
      <Shadow />
      <rect x="4" y="12" width="56" height="42" rx="6" fill={`url(#${id("metal")})`} stroke="#5b636c" strokeWidth="1.2" />
      <circle cx="27" cy="33" r="17" fill={`url(#${id("vinyl")})`} />
      {[14, 11, 8].map((r) => <circle key={r} cx="27" cy="33" r={r} fill="none" stroke="#2c2c2c" strokeWidth="0.6" />)}
      <circle cx="27" cy="33" r="5.5" fill="#e0483e" />
      <circle cx="27" cy="33" r="1" fill="#eee" />
      <path d="M22 22a12 12 0 0 1 9-2" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" fill="none" />
      <circle cx="51" cy="20" r="3.5" fill="#d9dde2" stroke="#5b636c" strokeWidth="1" />
      <path d="M51 20l-2 18-8 6" fill="none" stroke="#3d444c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="38" y="42" width="5" height="3.5" rx="1" fill="#3d444c" transform="rotate(-35 40 44)" />
    </>
  ),

  // Food Room: a plate with a fork, knife and a bright meal
  "food-room": (id) => (
    <>
      <defs>
        <radialGradient id={id("plate")} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdd5de" />
        </radialGradient>
      </defs>
      <Shadow />
      <circle cx="32" cy="32" r="22" fill={`url(#${id("plate")})`} stroke="#7f8b98" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="#c2ccd6" strokeWidth="1.2" />
      <circle cx="27" cy="29" r="6" fill="#f2a33a" />
      <circle cx="37" cy="35" r="5" fill="#4fae4f" />
      <circle cx="35" cy="26" r="3.5" fill="#d8443a" />
      <path d="M6 14v14M4 14v8a2 2 0 0 0 4 0v-8" stroke="#7a838e" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M58 12c-3 3-3 10 0 14v20" stroke="#7a838e" strokeWidth="2" strokeLinecap="round" fill="none" />
    </>
  ),

  // WHOOP Dashboard: a recovery dial on a dark instrument face
  "whoop-dashboard": (id) => (
    <>
      <defs>
        <linearGradient id={id("bezel")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef1f4" />
          <stop offset="1" stopColor="#8d96a1" />
        </linearGradient>
      </defs>
      <Shadow />
      <circle cx="32" cy="31" r="25" fill={`url(#${id("bezel")})`} stroke="#4d5661" strokeWidth="1.2" />
      <circle cx="32" cy="31" r="20" fill="#14181d" />
      <path d="M17 40a16 16 0 1 1 30 0" fill="none" stroke="#2a3037" strokeWidth="5" strokeLinecap="round" />
      <path d="M17 40a16 16 0 0 1 22-20" fill="none" stroke="#34d27a" strokeWidth="5" strokeLinecap="round" />
      <path d="M32 31l9-10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="31" r="2.5" fill="#fff" />
      <path d="M14 22a20 20 0 0 1 36 0" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
    </>
  ),

  // Nutrition: a glossy red apple
  nutrition: (id) => (
    <>
      <defs>
        <radialGradient id={id("apple")} cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ff8a7a" />
          <stop offset="0.55" stopColor="#e0281e" />
          <stop offset="1" stopColor="#8f0d0a" />
        </radialGradient>
      </defs>
      <Shadow />
      <path d="M32 18c-4-4-16-5-19 7-3 11 4 26 11 29 3 1 5-1 8-1s5 2 8 1c7-3 14-18 11-29-3-12-15-11-19-7z" fill={`url(#${id("apple")})`} stroke="#6d0907" strokeWidth="1" />
      <path d="M32 18c0-5 2-9 5-11" stroke="#5a3a1a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M34 12c4-4 10-4 12-2-3 4-8 5-12 2z" fill="#4fae3a" stroke="#2c6b1e" strokeWidth="0.8" />
      <ellipse cx="22" cy="26" rx="4" ry="6" fill="#fff" opacity="0.35" transform="rotate(20 22 26)" />
    </>
  ),
};

/** Official brand marks, used as-is from public/brands. */
const brandIcons: Record<string, string> = {
  "get-whoop": "/brands/whoop-circle.svg",
};

export function hasAquaIcon(id: string): boolean {
  return id in draw || id in brandIcons;
}

export function AquaIcon({ id, size = 32, label }: { id: string; size?: number; label?: string }) {
  const uid = useId().replace(/[:]/g, "");
  const brand = brandIcons[id];
  if (brand) {
    // The official mark is black on transparent, so it sits on a white gel
    // plate that reads on both the Aqua and the Graphite dock.
    return (
      <span
        role={label ? "img" : undefined}
        aria-label={label}
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 30%, #ffffff 0%, #e9edf1 70%, #c3cad2 100%)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.35), inset 0 -1px 2px rgba(0,0,0,0.15)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand} alt="" width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} draggable={false} />
      </span>
    );
  }
  const fn = draw[id];
  if (!fn) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {fn((n) => `${uid}-${n}`)}
    </svg>
  );
}
