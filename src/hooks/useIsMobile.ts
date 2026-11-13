import { useState, useEffect } from "react";

export const MOBILE_BREAKPOINT = 768;

function readIsMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * True under 768 px. Reads the width on first render (the desktop shell only
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
