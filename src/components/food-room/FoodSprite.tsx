import React from "react";
import type { FoodKind } from "./foodKinds";

// ============================================================================
// FOOD ROOM: drawn food characters
// ============================================================================
// Small chibi-style food characters in inline SVG: one body per kind, all
// sharing the same big glossy eyes and blush so they read as one cast.
// viewBox is 64x64; the face sits around (32, 38) unless a body moves it.
// ============================================================================

const OUTLINE = "#3b2a22";

function Face({ x = 32, y = 38, scale = 1, mood = "happy" }: { x?: number; y?: number; scale?: number; mood?: "happy" | "wow" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* eyes */}
      <ellipse cx={-7} cy={-1} rx={3.4} ry={4.4} fill="#1f1530" />
      <ellipse cx={7} cy={-1} rx={3.4} ry={4.4} fill="#1f1530" />
      <circle cx={-8.2} cy={-2.6} r={1.4} fill="#fff" />
      <circle cx={5.8} cy={-2.6} r={1.4} fill="#fff" />
      <circle cx={-6} cy={1} r={0.7} fill="#fff" />
      <circle cx={8} cy={1} r={0.7} fill="#fff" />
      {/* blush */}
      <ellipse cx={-12} cy={4} rx={3} ry={1.7} fill="#ff8fa3" opacity={0.75} />
      <ellipse cx={12} cy={4} rx={3} ry={1.7} fill="#ff8fa3" opacity={0.75} />
      {/* mouth */}
      {mood === "wow" ? (
        <ellipse cx={0} cy={5} rx={1.8} ry={2.2} fill="#7a2232" />
      ) : (
        <path d="M-3 4 Q-1.5 6.5 0 4.6 Q1.5 6.5 3 4" fill="none" stroke={OUTLINE} strokeWidth={1.2} strokeLinecap="round" />
      )}
    </g>
  );
}

function Body({ kind }: { kind: FoodKind }) {
  const s = { stroke: OUTLINE, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (kind) {
    case "bread":
      return (
        <>
          <path d="M8 34 Q8 14 32 14 Q56 14 56 34 L54 54 Q32 58 10 54 Z" fill="#e9b872" {...s} />
          <path d="M14 26 Q32 14 50 26" fill="none" stroke="#c98b3e" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M22 20 l4 5 M32 18 l4 5 M42 20 l4 5" stroke="#f7d9a8" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "egg":
      return (
        <>
          <ellipse cx={32} cy={36} rx={20} ry={24} fill="#fffaf0" {...s} />
          <ellipse cx={25} cy={22} rx={5} ry={3} fill="#fff" opacity={0.9} />
        </>
      );
    case "meat":
      return (
        <>
          <path d="M10 36 Q8 18 28 16 Q50 14 56 32 Q58 52 34 56 Q12 56 10 36 Z" fill="#b5543a" {...s} />
          <path d="M18 26 Q30 22 44 28" fill="none" stroke="#f3c1b0" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M16 46 Q28 50 46 44" fill="none" stroke="#f3c1b0" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
        </>
      );
    case "fish":
      return (
        <>
          <path d="M8 36 Q20 16 42 22 Q52 26 54 36 Q52 46 42 50 Q20 56 8 36 Z" fill="#f2896b" {...s} />
          <path d="M18 30 L44 30 M16 38 L46 38 M18 46 L42 46" stroke="#ffd1c1" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "dairy":
      return (
        <>
          <path d="M12 22 L16 56 Q32 60 48 56 L52 22 Z" fill="#ffffff" {...s} />
          <ellipse cx={32} cy={22} rx={20} ry={6} fill="#dfe9f5" {...s} />
          <rect x={14} y={44} width={36} height={8} rx={2} fill="#6aa5e0" opacity={0.9} />
        </>
      );
    case "shake":
      return (
        <>
          <rect x={18} y={8} width={28} height={8} rx={3} fill="#3d4b5c" {...s} />
          <path d="M16 16 L48 16 L46 58 Q32 61 18 58 Z" fill="#e8eef5" {...s} />
          <rect x={18} y={26} width={28} height={30} rx={2} fill="#c79a74" opacity={0.85} />
        </>
      );
    case "oats":
      return (
        <>
          <path d="M8 34 Q32 28 56 34 Q54 58 32 58 Q10 58 8 34 Z" fill="#7aa6d8" {...s} />
          <path d="M10 34 Q32 18 54 34 Z" fill="#f1dfb8" {...s} />
          <circle cx={24} cy={27} r={2.2} fill="#7b4fa3" />
          <circle cx={38} cy={26} r={2.2} fill="#c0392b" />
          <circle cx={31} cy={23} r={2} fill="#7b4fa3" />
        </>
      );
    case "tortilla":
      return (
        <>
          <ellipse cx={32} cy={38} rx={26} ry={20} fill="#6c6aa8" {...s} />
          <circle cx={18} cy={30} r={2} fill="#4b4887" />
          <circle cx={46} cy={44} r={2.4} fill="#4b4887" />
          <circle cx={44} cy={28} r={1.6} fill="#4b4887" />
        </>
      );
    case "rice":
      return (
        <>
          <path d="M8 36 Q32 30 56 36 Q54 58 32 58 Q10 58 8 36 Z" fill="#e05d5d" {...s} />
          <path d="M10 36 Q14 18 32 18 Q50 18 54 36 Z" fill="#fbfbf6" {...s} />
          <path d="M20 26 l3 1 M30 22 l3 1 M40 26 l3 1" stroke="#ddd" strokeWidth={1.5} strokeLinecap="round" />
        </>
      );
    case "fruit":
      return (
        <>
          <circle cx={32} cy={38} r={22} fill="#e8473f" {...s} />
          <path d="M32 16 Q34 10 38 8" fill="none" stroke="#6b4423" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M34 14 Q44 6 48 14 Q40 18 34 14 Z" fill="#5cb85c" {...s} strokeWidth={1.5} />
          <ellipse cx={22} cy={28} rx={4} ry={2.5} fill="#fff" opacity={0.6} />
        </>
      );
    case "berry":
      return (
        <>
          <path d="M10 26 Q32 16 54 26 Q52 50 32 60 Q12 50 10 26 Z" fill="#e5384f" {...s} />
          <path d="M18 20 L24 10 L32 18 L40 10 L46 20 Z" fill="#4caf50" {...s} strokeWidth={1.5} />
          {[[18, 32], [26, 46], [40, 46], [46, 32], [32, 52]].map(([cx, cy]) => (
            <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={1} ry={1.6} fill="#ffe08a" />
          ))}
        </>
      );
    case "veg":
      return (
        <>
          <rect x={26} y={40} width={12} height={18} rx={4} fill="#9ccc65" {...s} />
          <circle cx={20} cy={30} r={12} fill="#4caf50" {...s} />
          <circle cx={44} cy={30} r={12} fill="#4caf50" {...s} />
          <circle cx={32} cy={22} r={13} fill="#5cbf60" {...s} />
          <circle cx={32} cy={36} r={13} fill="#5cbf60" stroke="none" />
        </>
      );
    case "sweet":
      return (
        <>
          <path d="M8 30 L56 30 L56 54 Q32 58 8 54 Z" fill="#6b3e26" {...s} />
          <path d="M8 30 Q32 20 56 30" fill="#8a5233" {...s} />
          <circle cx={32} cy={18} r={5} fill="#e5384f" {...s} strokeWidth={1.5} />
        </>
      );
    case "drink":
      return (
        <>
          <path d="M40 4 L36 22" stroke="#e86b8c" strokeWidth={3} strokeLinecap="round" />
          <path d="M14 18 L50 18 L46 58 Q32 61 18 58 Z" fill="#cfeef7" {...s} />
          <path d="M16 30 L48 30 L46 58 Q32 61 18 58 Z" fill="#8fd3e8" />
        </>
      );
    default:
      // onigiri: the stand-in for anything unmatched
      return (
        <>
          <path d="M32 8 Q38 8 54 44 Q58 56 32 58 Q6 56 10 44 Q26 8 32 8 Z" fill="#fdfdf8" {...s} />
          <rect x={20} y={44} width={24} height={14} rx={2} fill="#1f3b2d" />
        </>
      );
  }
}

const FACE_POS: Partial<Record<FoodKind, { x?: number; y?: number; scale?: number }>> = {
  shake: { y: 42, scale: 0.8 },
  oats: { y: 46, scale: 0.85 },
  rice: { y: 46, scale: 0.85 },
  veg: { y: 34, scale: 0.85 },
  sweet: { y: 43, scale: 0.85 },
  drink: { y: 44, scale: 0.8 },
  berry: { y: 36, scale: 0.85 },
  onigiri: { y: 34, scale: 0.85 },
  dairy: { y: 36, scale: 0.85 },
};

export default function FoodSprite({
  kind,
  size = 64,
  mood = "happy",
  className,
}: {
  kind: FoodKind;
  size?: number;
  mood?: "happy" | "wow";
  className?: string;
}) {
  const f = FACE_POS[kind] ?? {};
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <ellipse cx={32} cy={60} rx={20} ry={3.5} fill="#000" opacity={0.15} />
      <Body kind={kind} />
      <Face x={f.x} y={f.y} scale={f.scale} mood={mood} />
    </svg>
  );
}
