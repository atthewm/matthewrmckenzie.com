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

export default function CtaBlock({ wide = false }: { wide?: boolean }) {
  return (
    <section
      aria-label="Get in touch"
      className={`site-noprint ${wide ? "max-w-5xl" : "max-w-[680px]"} mx-auto px-4 sm:px-6 mt-12`}
    >
      <div className="rounded-2xl border px-6 py-7 sm:px-8" style={{ borderColor: "var(--site-rule)", background: "var(--site-surface)" }}>
        <p className="site-eyebrow">Get in touch</p>
        <p className="site-display text-[24px] mt-2 leading-snug">
          Investor, advisor, or sponsor? I would like to hear from you.
        </p>
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          <Link
            href="/contact"
            onClick={() => trackEvent("cta_clicked", { label: "get_in_touch" })}
            className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-medium"
            style={{ background: "var(--site-ink)", color: "var(--site-bg)" }}
          >
            Contact
          </Link>
          <a
            href="https://cal.com/mattmck/site"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("cta_clicked", { label: "schedule_a_call" })}
            className="inline-flex items-center px-5 py-2.5 rounded-full text-[14px] font-medium border"
            style={{ borderColor: "var(--site-rule)" }}
          >
            Schedule a call
          </a>
        </div>
      </div>
    </section>
  );
}
