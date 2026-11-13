"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "motion/react";
import { springs, FADE } from "@/lib/motion";

// ============================================================================
// SLIDE TO UNLOCK
// ============================================================================
// iPhone OS 1 lock screen, shown on the very first phone visit only. Drag
// the knob to the end of the track, or use Skip (also reachable by keyboard).
// After that it never shows again (localStorage).
// ============================================================================

export const UNLOCK_KEY = "mmck-unlocked";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export default function SlideToUnlock({ onUnlock }: { onUnlock: () => void }) {
  const reduce = useReducedMotion();
  const now = useNow();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxX, setMaxX] = useState(220);
  const labelOpacity = useTransform(x, [0, maxX * 0.6], [1, 0]);

  useEffect(() => {
    const el = trackRef.current;
    if (el) setMaxX(el.clientWidth - 64);
  }, []);

  function finish() {
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      // Storage blocked: unlock for this visit only.
    }
    onUnlock();
  }

  function onDragEnd() {
    if (x.get() > maxX * 0.85) {
      animate(x, maxX, reduce ? FADE : springs.snappy);
      finish();
    } else {
      animate(x, 0, reduce ? FADE : springs.snappy);
    }
  }

  const time = now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/, "") : "";
  const date = now ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "";

  return (
    <motion.div
      className="lock-screen"
      role="dialog"
      aria-label="Slide to unlock"
      exit={reduce ? { opacity: 0 } : { y: "-100%" }}
      transition={reduce ? FADE : springs.window}
    >
      <div className="lock-clock">
        <p className="lock-time" suppressHydrationWarning>{time}</p>
        <p className="lock-date" suppressHydrationWarning>{date}</p>
      </div>
      <div className="lock-bottom">
        <div ref={trackRef} className="lock-track">
          <motion.span className="lock-label" style={{ opacity: labelOpacity }} aria-hidden="true">
            slide to unlock
          </motion.span>
          <motion.button
            type="button"
            className="lock-knob"
            aria-label="Unlock"
            drag="x"
            dragConstraints={{ left: 0, right: maxX }}
            dragElastic={0.05}
            dragMomentum={false}
            style={{ x }}
            onDragEnd={onDragEnd}
            onClick={() => {
              if (x.get() === 0) finish();
            }}
          >
            <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden="true">
              <path d="M2 10h18M14 3l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
        <button type="button" className="lock-skip" onClick={finish}>
          Skip
        </button>
      </div>
    </motion.div>
  );
}
