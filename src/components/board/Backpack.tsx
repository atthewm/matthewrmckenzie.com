"use client";

import React, { forwardRef } from "react";

// ============================================================================
// BACKPACK
// ============================================================================
// Drop target pinned to the corner of every board. Opens its flap while a
// card is being dragged, glows when the card is over it, and does a small
// gulp after a successful pack.
// ============================================================================

interface BackpackProps {
  isOpen: boolean;
  isHot: boolean;
  isGulping: boolean;
  packedCount: number;
}

const Backpack = forwardRef<HTMLDivElement, BackpackProps>(function Backpack(
  { isOpen, isHot, isGulping, packedCount },
  ref,
) {
  const state = isHot ? "hot" : isOpen ? "open" : "idle";
  return (
    <div
      ref={ref}
      data-board-ui
      className={`board-backpack ${isGulping ? "is-gulping" : ""}`}
      data-state={state}
      aria-hidden
    >
      <svg viewBox="0 0 96 104" width="84" height="92">
        {/* straps */}
        <path d="M30 22 C30 8, 66 8, 66 22" fill="none" stroke="#5a3a22" strokeWidth="6" strokeLinecap="round" />
        {/* body */}
        <rect x="14" y="22" width="68" height="76" rx="18" fill="#c0603a" />
        <rect x="14" y="22" width="68" height="76" rx="18" fill="url(#backpack-shade)" />
        {/* front pocket */}
        <rect x="24" y="62" width="48" height="28" rx="9" fill="#a24e2e" />
        <line x1="30" y1="70" x2="66" y2="70" stroke="#e7b48f" strokeWidth="2" strokeDasharray="3 3" />
        {/* flap */}
        <g className="backpack-flap">
          <path d="M14 40 C14 28, 22 22, 34 22 L62 22 C74 22, 82 28, 82 40 L82 48 C70 54, 26 54, 14 48 Z" fill="#d97447" />
          <rect x="44" y="44" width="8" height="12" rx="2" fill="#e8c26a" />
        </g>
        <defs>
          <linearGradient id="backpack-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="0.6" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(0,0,0,0.18)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="board-backpack-label">
        {isHot ? "Let go to download" : isOpen ? "Drop here" : packedCount > 0 ? `${packedCount} packed` : "Backpack"}
      </span>
    </div>
  );
});

export default Backpack;
