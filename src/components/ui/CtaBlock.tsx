"use client";

import React from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// CTA BLOCK (Client Component)
// ============================================================================
// Closing contact panel inside every document window. Client component so
// clicks can be tracked with Vercel Analytics. The default button is the
// gel one, as in a Panther dialog.
// ============================================================================

export default function CtaBlock() {
  return (
    <section aria-label="Get in touch" className="doc-cta site-noprint">
      <p>Investor, advisor, or sponsor? I would like to hear from you.</p>
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href="/contact"
          onClick={() => trackEvent("cta_clicked", { label: "get_in_touch" })}
          className="aqua-button is-default"
        >
          Contact
        </Link>
        <a
          href="https://cal.com/mattmck/site"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("cta_clicked", { label: "schedule_a_call" })}
          className="aqua-button"
        >
          Schedule a call
        </a>
      </div>
    </section>
  );
}
