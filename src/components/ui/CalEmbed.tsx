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

    // Load Cal.com embed script
    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => {
      const w = window as unknown as Record<string, unknown>;
      const Cal = w.Cal as ((...args: unknown[]) => void) | undefined;
      if (Cal) {
        Cal("init", { origin: "https://cal.com" });
        Cal("inline", {
          elementOrSelector: containerRef.current,
          calLink: "mattmck/site",
          layout: "month_view",
        });
        Cal("ui", {
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-desktop-border overflow-hidden"
      style={{ minHeight: 450 }}
    />
  );
}
