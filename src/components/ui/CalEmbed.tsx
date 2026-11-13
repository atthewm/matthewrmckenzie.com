"use client";

import { useEffect, useRef, useState } from "react";
import AquaLoading from "./AquaLoading";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// CAL.COM INLINE EMBED
// ============================================================================
// Loads the Cal.com embed script and renders an inline scheduling widget.
// ============================================================================

export default function CalEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  // Show a skeleton until Cal.com's iframe arrives, and a direct link if it
  // has not arrived after 8 seconds, so the box is never just blank.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new MutationObserver(() => {
      if (el.querySelector("iframe")) setReady(true);
    });
    obs.observe(el, { childList: true, subtree: true });
    const t = window.setTimeout(() => setSlow(true), 8000);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);

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
    <div className="relative rounded-lg border border-desktop-border overflow-hidden min-h-[520px] sm:min-h-[560px] lg:min-h-[640px]">
      {!ready && (
        <div className="absolute inset-x-0 top-0">
          <AquaLoading label="Loading the calendar" lines={3} />
          {slow && (
            <p className="px-5 text-[15px] text-desktop-text">
              The calendar is taking a while. You can also{" "}
              <a className="underline" href="https://cal.com/mattmck/site" target="_blank" rel="noopener noreferrer">
                book a time on cal.com
              </a>
              .
            </p>
          )}
        </div>
      )}
      <div ref={containerRef} className="relative min-h-[520px] sm:min-h-[560px] lg:min-h-[640px]" />
    </div>
  );
}
