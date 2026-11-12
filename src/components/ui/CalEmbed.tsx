"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// CAL.COM INLINE EMBED
// ============================================================================
// Renders the inline scheduling widget. Cal.com's embed script expects a small
// queue function on window.Cal to exist before it loads; without it the script
// throws "Cal is not defined" and the box stays empty. ensureCal is a typed
// port of the loader from Cal.com's own embed snippet.
// ============================================================================

const EMBED_SRC = "https://app.cal.com/embed/embed.js";
const CAL_ORIGIN = "https://cal.com";
const CAL_LINK = "mattmck/site";
const NAMESPACE = "site";

interface CalApi {
  (...args: unknown[]): void;
  q?: unknown[];
  ns?: Record<string, CalApi>;
  loaded?: boolean;
}

type CalWindow = Window & { Cal?: CalApi };

function enqueue(target: CalApi, args: unknown): void {
  target.q = target.q ?? [];
  target.q.push(args);
}

function ensureCal(w: CalWindow): CalApi {
  if (w.Cal) return w.Cal;

  const cal: CalApi = (...args: unknown[]) => {
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q ?? [];
      const script = document.createElement("script");
      script.src = EMBED_SRC;
      script.async = true;
      document.head.appendChild(script);
      cal.loaded = true;
    }

    if (args[0] !== "init") {
      enqueue(cal, args);
      return;
    }

    const namespace = args[1];
    if (typeof namespace !== "string" || !cal.ns) {
      enqueue(cal, args);
      return;
    }
    const api: CalApi = (...apiArgs: unknown[]) => enqueue(api, apiArgs);
    api.q = [];
    cal.ns[namespace] = cal.ns[namespace] ?? api;
    enqueue(cal.ns[namespace], args);
    enqueue(cal, ["initNamespace", namespace]);
  };

  w.Cal = cal;
  return cal;
}

export default function CalEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !containerRef.current) return;
    loadedRef.current = true;

    trackEvent("cal_embed_viewed", { page: "contact" });

    const cal = ensureCal(window as CalWindow);
    cal("init", NAMESPACE, { origin: CAL_ORIGIN });
    const api = cal.ns?.[NAMESPACE];
    if (!api) return;
    api("inline", {
      elementOrSelector: containerRef.current,
      calLink: CAL_LINK,
      config: { layout: "month_view" },
    });
    api("ui", { hideEventTypeDetails: false, layout: "month_view" });
  }, []);

  return (
    <div
      ref={containerRef}
      className="site-card overflow-hidden min-h-[520px] sm:min-h-[560px] lg:min-h-[640px]"
    />
  );
}
