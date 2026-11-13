import React from "react";

// The little person who walks around the Food Room.
export default function Avatar({ facing, moving }: { facing: 1 | -1; moving: boolean }) {
  return (
    <svg
      viewBox="0 0 64 96"
      className={moving ? "food-room-bob" : undefined}
      style={{ width: "100%", overflow: "visible", transform: `scaleX(${facing})` }}
      aria-hidden="true"
    >
      <ellipse cx={32} cy={93} rx={16} ry={3.5} fill="#000" opacity={0.18} />
      {/* legs */}
      <rect x={22} y={72} width={8} height={18} rx={3} fill="#1c1d20" />
      <rect x={34} y={72} width={8} height={18} rx={3} fill="#1c1d20" />
      {/* body */}
      <path d="M16 52 Q16 44 24 44 L40 44 Q48 44 48 52 L48 76 L16 76 Z" fill="#e4572e" stroke="#3b2a22" strokeWidth={2} />
      {/* head */}
      <circle cx={32} cy={28} r={20} fill="#f6d2b5" stroke="#3b2a22" strokeWidth={2} />
      <path d="M12 26 Q14 6 34 8 Q52 10 52 26 Q44 16 30 18 Q20 18 12 26 Z" fill="#4a3426" stroke="#3b2a22" strokeWidth={2} />
      {/* face (looks to the right; flipped with the body) */}
      <ellipse cx={30} cy={30} rx={2.6} ry={3.4} fill="#1f1530" />
      <ellipse cx={42} cy={30} rx={2.6} ry={3.4} fill="#1f1530" />
      <circle cx={29} cy={28.6} r={1} fill="#fff" />
      <circle cx={41} cy={28.6} r={1} fill="#fff" />
      <ellipse cx={26} cy={36} rx={2.6} ry={1.4} fill="#ff8fa3" opacity={0.7} />
      <path d="M33 37 Q36 39.5 39 37" fill="none" stroke="#3b2a22" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}
