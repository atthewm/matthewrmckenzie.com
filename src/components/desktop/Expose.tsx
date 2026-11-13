"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { computeExposeSlots, setExpose, useExpose } from "@/lib/exposeStore";
import { FADE } from "@/lib/motion";
import { desktopViewport } from "@/lib/viewport";
import { Z_INDEX } from "@/lib/z-index";

// ============================================================================
// EXPOSÉ
// ============================================================================
// F9, the top right hot corner, or the Window menu: every open window springs
// into a grid (the windows animate themselves from lib/exposeStore). This
// component dims the desktop behind them and handles Esc and F9 to exit.
// Click a window to bring it forward and leave Exposé.
// ============================================================================

interface ExposeProps {
  active: boolean;
  onClose: () => void;
}

export default function Expose({ active, onClose }: ExposeProps) {
  const { state } = useDesktop();
  const reduce = useReducedMotion();
  const visible = state.windows.filter((w) => !w.isMinimized);

  // Publish slots whenever Exposé turns on (or the window set changes while on).
  useEffect(() => {
    if (!active) {
      setExpose({ active: false, slots: {} });
      return;
    }
    const ordered = [...visible].sort((a, b) => a.zIndex - b.zIndex);
    setExpose({
      active: true,
      slots: computeExposeSlots(ordered, desktopViewport().width, desktopViewport().height),
    });
    // visible is derived from state.windows
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, state.windows]);

  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onClose]);

  // A click on a window clears the store directly; close the overlay too.
  const store = useExpose();
  const wasOn = React.useRef(false);
  useEffect(() => {
    if (store.active) wasOn.current = true;
    else if (wasOn.current && active) {
      wasOn.current = false;
      onClose();
    }
  }, [store.active, active, onClose]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="expose"
          className="fixed inset-0"
          style={{ zIndex: Z_INDEX.expose, background: "rgba(5, 12, 28, 0.58)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? FADE : { duration: 0.25 }}
          onClick={onClose}
        >
          <p
            className="absolute top-8 left-1/2 -translate-x-1/2 text-[13px] font-semibold"
            style={{ color: "#ffffff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
          >
            {visible.length === 0 ? "No open windows" : "Click a window to bring it forward. Press Esc to go back."}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
