"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// useIdleTimer — fires after `timeout` ms of no user interaction.
// Returns `idle` (boolean) and `reset` (manual dismiss).
// Listens to: mousemove, mousedown, keydown, touchstart, scroll, wheel.
// ---------------------------------------------------------------------------

const EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
];

export function useIdleTimer(timeoutMs: number = 3 * 60 * 1000) {
  const [idle, setIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdle(false);
    timerRef.current = setTimeout(() => setIdle(true), timeoutMs);
  }, [timeoutMs]);

  // Manual dismiss (called when user clicks to exit screensaver)
  const dismiss = useCallback(() => {
    setIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIdle(true), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    // Start the timer
    timerRef.current = setTimeout(() => setIdle(true), timeoutMs);

    const handler = () => resetTimer();
    EVENTS.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      EVENTS.forEach((ev) => window.removeEventListener(ev, handler));
    };
  }, [timeoutMs, resetTimer]);

  return { idle, dismiss };
}
