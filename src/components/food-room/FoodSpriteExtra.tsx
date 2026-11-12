import React from "react";
import type { FoodKind } from "./foodKinds";

// ============================================================================
// FOOD ROOM: more drawn food characters
// ============================================================================
// Bodies for the kinds added when the matching was checked against the real
// top-foods list. Same rules as FoodSprite.tsx: 64x64 viewBox, flat fills, one
// dark outline, simple shapes. The face is drawn on top by FoodSprite.
// ============================================================================

export const OUTLINE = "#3b2a22";
const s = { stroke: OUTLINE, strokeWidth: 2, strokeLinejoin: "round" as const };
const thin = { stroke: OUTLINE, strokeWidth: 1.5, strokeLinejoin: "round" as const };

const KIWI_SEEDS = [0, 45, 90, 135, 180, 225, 270, 315];

export function extraBody(kind: FoodKind): React.ReactNode | null {
  switch (kind) {
    case "popcorn":
      return (
        <>
          <circle cx={20} cy={27} r={7} fill="#fff3c4" {...s} />
          <circle cx={45} cy={27} r={7} fill="#fff3c4" {...s} />
          <circle cx={27} cy={20} r={8} fill="#fff7d6" {...s} />
          <circle cx={38} cy={19} r={8} fill="#fff3c4" {...s} />
          <circle cx={32} cy={26} r={7} fill="#fff7d6" {...s} />
          <path d="M15 30 L49 30 L45 57 Q32 61 19 57 Z" fill="#fff8ec" {...s} />
          <path d="M20.5 31 L26.5 31 L27.5 58.5 L23 58 Z" fill="#e5484d" />
          <path d="M37.5 31 L43.5 31 L41 58 L36.5 58.5 Z" fill="#e5484d" />
        </>
      );
    case "mango":
      return (
        <>
          <path d="M14 40 Q10 22 28 14 Q48 10 54 28 Q58 48 38 56 Q20 60 14 40 Z" fill="#f9b233" {...s} />
          <path d="M16 34 Q15 21 29 15.5 Q22 23 22 35 Z" fill="#e8553a" opacity={0.75} />
          <path d="M36 13 Q37 8 40 6" fill="none" stroke="#6b4423" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M38 10 Q46 4 50 10 Q44 14 38 10 Z" fill="#5cb85c" {...thin} />
          <ellipse cx={44} cy={24} rx={4} ry={2.4} fill="#fff" opacity={0.45} />
        </>
      );
    case "chocolate":
      return (
        <>
          <rect x={15} y={8} width={34} height={40} rx={4} fill="#5b3420" {...s} />
          <path d="M32 10 V32 M17 20 H47" stroke="#3f2315" strokeWidth={2} />
          <path d="M12 33 l5 -4 l5 4 l5 -4 l5 4 l5 -4 l5 4 l5 -4 l5 4 L52 40 L12 40 Z" fill="#ece6d8" {...thin} />
          <path d="M12 38 L52 38 L52 55 Q32 60 12 55 Z" fill="#c9a24a" {...s} />
        </>
      );
    case "bar":
      return (
        <>
          <rect x={18} y={7} width={28} height={32} rx={6} fill="#a9713f" {...s} />
          <circle cx={26} cy={15} r={1.8} fill="#5b3420" />
          <circle cx={37} cy={13} r={1.8} fill="#5b3420" />
          <circle cx={32} cy={21} r={1.8} fill="#5b3420" />
          <path d="M14 31 l4.5 -4 l4.5 4 l4.5 -4 l4.5 4 l4.5 -4 l4.5 4 l4.5 -4 l4.5 4 L50 56 Q32 60 14 56 Z" fill="#2f8f83" {...s} />
          <path d="M14.5 50 L49.5 50 L49.5 54 Q32 57.5 14.5 54 Z" fill="#f4d35e" />
        </>
      );
    case "yogurt":
      return (
        <>
          <path d="M14 22 L50 22 L45 56 Q32 60 19 56 Z" fill="#fdfdfb" {...s} />
          <path d="M17.6 47 L46.4 47 L45.3 54 Q32 57.5 18.7 54 Z" fill="#b49be0" />
          <ellipse cx={32} cy={22} rx={18} ry={5} fill="#f4eefc" {...s} />
          <path d="M22 21 Q26 10 32 13 Q38 9 42 21 Z" fill="#ffffff" {...thin} />
          <circle cx={32} cy={10} r={3.4} fill="#c2185b" {...thin} />
        </>
      );
    case "steak":
      return (
        <>
          <path d="M10 30 Q10 14 28 14 Q46 12 54 26 Q60 42 46 52 Q30 60 16 50 Q8 42 10 30 Z" fill="#f2d9c4" {...s} />
          <path d="M15 31 Q15 19 29 19 Q43 18 49 28 Q54 40 43 47 Q30 54 20 46 Q13 40 15 31 Z" fill="#c0443a" />
          <circle cx={43} cy={26} r={4} fill="#fff8ec" {...thin} />
          <path d="M19 27 l7 -5 M38 49 l7 -5" stroke="#8f2c26" strokeWidth={2} strokeLinecap="round" />
        </>
      );
    case "chicken":
      return (
        <>
          <path d="M38 42 L50 54" stroke={OUTLINE} strokeWidth={10} strokeLinecap="round" />
          <path d="M38 42 L50 54" stroke="#fff8ec" strokeWidth={6} strokeLinecap="round" />
          <circle cx={48} cy={57} r={4.5} fill="#fff8ec" {...s} />
          <circle cx={54} cy={51} r={4.5} fill="#fff8ec" {...s} />
          <path d="M51 54 l-3 -3" stroke="#fff8ec" strokeWidth={5} strokeLinecap="round" />
          <path d="M10 30 Q8 12 27 10 Q46 9 48 27 Q49 42 36 46 Q18 50 10 30 Z" fill="#d9903d" {...s} />
          <path d="M17 21 Q23 14 33 14.5" fill="none" stroke="#f2c078" strokeWidth={2.5} strokeLinecap="round" />
        </>
      );
    case "beans":
      return (
        <>
          <path d="M8 34 Q32 28 56 34 Q54 58 32 58 Q10 58 8 34 Z" fill="#d98e5a" {...s} />
          <path d="M10 34 Q32 15 54 34 Z" fill="#3a2a2a" {...s} />
          <ellipse cx={22} cy={29} rx={3} ry={1.8} fill="#6b5252" />
          <ellipse cx={32} cy={23} rx={3} ry={1.8} fill="#6b5252" />
          <ellipse cx={42} cy={29} rx={3} ry={1.8} fill="#6b5252" />
          <ellipse cx={28} cy={31} rx={2.6} ry={1.6} fill="#57403f" />
          <ellipse cx={37} cy={31} rx={2.6} ry={1.6} fill="#57403f" />
        </>
      );
    case "blueberry":
      return (
        <>
          <circle cx={32} cy={38} r={21} fill="#4f63c6" {...s} />
          <path d="M25 20 L28.5 14 L32 19 L35.5 14 L39 20 Z" fill="#2f3f95" {...thin} />
          <ellipse cx={22} cy={29} rx={4} ry={2.5} fill="#fff" opacity={0.45} />
        </>
      );
    case "salad":
      return (
        <>
          <circle cx={18} cy={28} r={9} fill="#5cab52" {...s} />
          <circle cx={45} cy={27} r={10} fill="#5cab52" {...s} />
          <circle cx={31} cy={22} r={11} fill="#7cc36a" {...s} />
          <path d="M22 25 l6 -3" stroke="#f08a3c" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M37 21 l6 3" stroke="#9b59b6" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M8 34 Q32 28 56 34 Q54 58 32 58 Q10 58 8 34 Z" fill="#f5efe2" {...s} />
        </>
      );
    case "milk":
      return (
        <>
          <rect x={25} y={5} width={14} height={6} rx={1.5} fill="#cfd9e8" {...thin} />
          <path d="M18 22 L26 10 L38 10 L46 22 Z" fill="#e7eef8" {...s} />
          <path d="M18 22 L46 22 L46 56 Q32 59 18 56 Z" fill="#ffffff" {...s} />
          <path d="M19 47 L45 47 L45 54 Q32 56.5 19 54 Z" fill="#5b8def" />
        </>
      );
    case "kiwi":
      return (
        <>
          <circle cx={32} cy={37} r={22} fill="#8a6a3f" {...s} />
          <circle cx={32} cy={37} r={18} fill="#9fd15b" />
          <circle cx={32} cy={37} r={8} fill="#e9f2c4" />
          {KIWI_SEEDS.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <ellipse
                key={deg}
                cx={32 + Math.cos(rad) * 13.5}
                cy={37 + Math.sin(rad) * 13.5}
                rx={1.1}
                ry={1.9}
                fill="#2c2416"
                transform={`rotate(${deg + 90} ${32 + Math.cos(rad) * 13.5} ${37 + Math.sin(rad) * 13.5})`}
              />
            );
          })}
        </>
      );
    case "sweetpotato":
      return (
        <>
          <path d="M6 40 Q9 24 26 20 Q44 14 56 23 Q61 33 50 46 Q36 58 18 54 Q6 50 6 40 Z" fill="#c9683f" {...s} />
          <path d="M18 28 l6 -2 M41 22 l5 1 M45 45 l4 -3" stroke="#a04e2c" strokeWidth={2} strokeLinecap="round" />
          <path d="M14 32 Q20 25 30 23" fill="none" stroke="#e39a6f" strokeWidth={2.5} strokeLinecap="round" />
        </>
      );
    case "squash":
      return (
        <>
          <rect x={29} y={3} width={6} height={8} rx={2} fill="#7a8f3a" {...thin} />
          <path d="M24 10 Q32 6 40 10 Q41 24 50 36 Q56 50 44 57 Q32 61 20 57 Q8 50 14 36 Q23 24 24 10 Z" fill="#e8b071" {...s} />
          <path d="M27 15 Q25 27 19 37" fill="none" stroke="#f5cf9b" strokeWidth={2.5} strokeLinecap="round" />
        </>
      );
    case "cauliflower":
      return (
        <>
          <path d="M14 40 Q10 52 24 56 L40 56 Q54 52 50 40 Z" fill="#8fc46a" {...s} />
          <circle cx={20} cy={30} r={11} fill="#f3ecd9" {...s} />
          <circle cx={44} cy={30} r={11} fill="#f3ecd9" {...s} />
          <circle cx={32} cy={22} r={12} fill="#fbf6ea" {...s} />
          <circle cx={32} cy={36} r={12} fill="#fbf6ea" stroke="none" />
        </>
      );
    default:
      return null;
  }
}
