"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// CAL.COM INLINE EMBED
// ============================================================================
// Loads the Cal.com embed script and renders an inline scheduling widget.
// ============================================================================

export default function CalEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    trackEvent("cal_embed_viewed", { page: "contact" });

    // Cal.com's official bootstrap: define the Cal command queue first, then
    // load embed.js (it throws "Cal is not defined" without the queue).
    type CalFn = ((...args: unknown[]) => void) & { q?: unknown[]; ns?: Record<string, unknown>; loaded?: boolean };
    const w = window as unknown as { Cal?: CalFn };
    if (!w.Cal) {
      const queue: CalFn = Object.assign(
        (...args: unknown[]) => {
          if (!queue.loaded) {
            queue.ns = {};
            queue.q = queue.q || [];
            const el = document.createElement("script");
            el.src = "https://app.cal.com/embed/embed.js";
            el.async = true;
            document.head.appendChild(el);
            queue.loaded = true;
          }
          queue.q!.push(args);
        },
        { q: [] as unknown[] },
      );
      w.Cal = queue;
    }
    const Cal = w.Cal;
    Cal("init", { origin: "https://cal.com" });
    Cal("inline", {
      elementOrSelector: containerRef.current,
      calLink: "mattmck/site",
      layout: "month_view",
    });
    Cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-desktop-border overflow-hidden min-h-[520px] sm:min-h-[560px] lg:min-h-[640px]"
    />
  );
}
