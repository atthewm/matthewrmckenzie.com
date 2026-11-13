import { useState, useEffect } from "react";

/**
 * Under this width the site is a phone springboard. The iPhone Duo outer
 * screen (382 portrait, 594 landscape) and Split View (385) are phones; the
 * inner screen (669 portrait, 951 landscape) gets a compact Panther desktop.
 */
export const MOBILE_BREAKPOINT = 600;

function readIsMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * True under MOBILE_BREAKPOINT. Reads the width on first render (the desktop shell only
 * renders after mount), so a phone never flashes the desktop layout first.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(readIsMobile);

  useEffect(() => {
    function check() {
      setIsMobile(readIsMobile());
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}
