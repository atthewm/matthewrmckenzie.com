"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// ============================================================================
// HEADER MOTION (Client Component, loaded with a dynamic import)
// ============================================================================
// Toggles the compact header state after 40px of scroll with a ScrollTrigger,
// not a scroll listener. The visual change itself is CSS (transform and
// opacity). With reduced motion the header keeps its size and only gains the
// hairline rule.
// ============================================================================

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SHRINK_AFTER_PX = 40;
const FAR_END = 9999999;

export default function HeaderMotion({ headerRef }: { headerRef: RefObject<HTMLElement | null> }) {
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const className = context.conditions?.reduce ? "is-ruled" : "is-compact";
          ScrollTrigger.create({
            start: SHRINK_AFTER_PX,
            end: FAR_END,
            toggleClass: { targets: header, className },
          });
          return () => header.classList.remove("is-ruled", "is-compact");
        },
      );
    },
    { dependencies: [headerRef] },
  );

  return null;
}
