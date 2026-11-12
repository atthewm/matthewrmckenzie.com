"use client";

import React from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

// ============================================================================
// CTA BLOCK (Client Component)
// ============================================================================
// Closing contact block on every static page. Client component so clicks can
// be tracked with Vercel Analytics.
// ============================================================================

export default function CtaBlock() {
  return (
    <section aria-label="Get in touch" className="site-cta site-noprint">
      <div className="site-wrap site-grid site-cta-inner">
        <p className="site-eyebrow col-head">Get in touch</p>
        <div className="col-wide">
          <p className="site-cta-line">Investor, advisor, or sponsor? I would like to hear from you.</p>
          <div className="site-actions">
            <a
              href="https://cal.com/mattmck/site"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("cta_clicked", { label: "schedule_a_call" })}
              className="site-btn site-btn-primary"
            >
              Schedule a call
            </a>
            <Link
              href="/contact"
              onClick={() => trackEvent("cta_clicked", { label: "get_in_touch" })}
              className="site-btn site-btn-ghost"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
