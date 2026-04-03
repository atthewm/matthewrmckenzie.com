"use client";

import React from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// CTA BLOCK (Client Component)
// ============================================================================
// Extracted from StaticPageLayout so click events can be tracked via
// Vercel Analytics. Used at the bottom of every static page.
// ============================================================================

export default function CtaBlock() {
  return (
    <div className="max-w-2xl mx-auto px-5 mt-8">
      <div className="rounded-lg border border-desktop-border bg-desktop-surface px-6 py-5">
        <p className="text-sm font-semibold text-desktop-text">Interested in working together?</p>
        <p className="text-xs text-desktop-text-secondary mt-1 leading-relaxed">
          I welcome conversations about capital formation, investor partnerships, growth strategy, and AI operations tooling.
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <Link
            href="/contact"
            onClick={() => trackEvent("cta_clicked", { label: "get_in_touch" })}
            className="inline-flex items-center px-4 py-2 rounded text-xs font-medium bg-desktop-accent text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-2"
          >
            Get in Touch
          </Link>
          <a
            href="https://cal.com/mattmck/site"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("cta_clicked", { label: "schedule_a_call" })}
            className="inline-flex items-center px-4 py-2 rounded text-xs font-medium border border-desktop-border text-desktop-text hover:bg-desktop-border/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-2"
          >
            Schedule a Call
          </a>
        </div>
      </div>
    </div>
  );
}
