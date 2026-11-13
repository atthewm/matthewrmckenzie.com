"use client";

import React, { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { appleMusicPlaylists } from "@/config/playlists";
import { useTurntable } from "@/lib/turntableStore";
import { springs } from "@/lib/motion";

// ============================================================================
// TURNTABLE DECK
// ============================================================================
// A record on a brushed metal plinth. While the chosen playlist's Apple Music
// player is loaded, the tonearm swings in and the platter eases up to 33 1/3
// rpm; lifting the needle eases it back down and swings the arm out.
// Reduced motion: the arm moves without a spring and the record does not spin.
// ============================================================================

const RPM_33_DEG_PER_S = 200;
const ARM_REST = -32;
const ARM_PLAY = 6;

export default function TurntableDeck() {
  const { index, active } = useTurntable();
  const reduce = useReducedMotion();
  const playlist = appleMusicPlaylists[index];

  const rotation = useMotionValue(0);
  const speed = useSpring(0, { stiffness: 18, damping: 12, mass: 1 });
  const last = useRef<number | null>(null);

  React.useEffect(() => {
    speed.set(active && !reduce ? RPM_33_DEG_PER_S : 0);
  }, [active, reduce, speed]);

  useAnimationFrame((t) => {
    const prev = last.current ?? t;
    last.current = t;
    const v = speed.get();
    if (v > 0.5) rotation.set((rotation.get() + (v * (t - prev)) / 1000) % 360);
  });

  return (
    <div className="tt-deck metal" aria-label={`Turntable. ${active ? `${playlist.title} is on the platter.` : "The needle is up."}`} role="img">
      <div className="tt-platter">
        <motion.div className="tt-record" style={{ rotate: rotation }}>
          <svg viewBox="0 0 200 200" className="tt-grooves" aria-hidden="true">
            <defs>
              <radialGradient id="tt-vinyl" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor="#2b2b2b" />
                <stop offset="1" stopColor="#0b0b0b" />
              </radialGradient>
              <linearGradient id="tt-sheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.16" />
                <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="99" fill="url(#tt-vinyl)" />
            {Array.from({ length: 22 }, (_, i) => (
              <circle key={i} cx="100" cy="100" r={40 + i * 2.6} fill="none" stroke="#1d1d1d" strokeWidth="0.8" />
            ))}
            <circle cx="100" cy="100" r="99" fill="url(#tt-sheen)" />
          </svg>
          <div className="tt-label">
            {playlist.artwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playlist.artwork} alt="" width={120} height={120} />
            ) : (
              <span className="tt-label-text">{playlist.title}</span>
            )}
            <span className="tt-spindle" />
          </div>
        </motion.div>
      </div>

      <motion.svg
        className="tt-arm"
        viewBox="0 0 120 260"
        aria-hidden="true"
        initial={false}
        animate={{ rotate: active ? ARM_PLAY : ARM_REST }}
        transition={reduce ? { duration: 0 } : springs.window}
        style={{ originX: "86px", originY: "40px" }}
      >
        <circle cx="86" cy="40" r="22" fill="#d9dde2" stroke="#59616c" strokeWidth="2" />
        <circle cx="86" cy="40" r="8" fill="#59616c" />
        <path d="M86 40 L80 200 L56 236" fill="none" stroke="#3a4048" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M86 40 L80 200 L56 236" fill="none" stroke="#c8ced6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="38" y="228" width="30" height="16" rx="3" fill="#2a2f35" transform="rotate(-38 53 236)" />
      </motion.svg>

      <div className="tt-speed" aria-hidden="true">
        <span data-on={active || undefined}>33</span>
        <span>45</span>
      </div>
    </div>
  );
}
