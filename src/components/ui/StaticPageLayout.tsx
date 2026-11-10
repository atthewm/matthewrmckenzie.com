import React from "react";
import Link from "next/link";
import CtaBlock from "./CtaBlock";

// ============================================================================
// STATIC PAGE LAYOUT
// ============================================================================
// Reading layout for the server-rendered routes (/about, /work, /recipes ...).
// Uses the .site tokens in globals.css (slate and gold, shared with mckm.at).
// ============================================================================

interface StaticPageLayoutProps {
  children: React.ReactNode;
  /** Wider column for index pages such as /recipes. */
  wide?: boolean;
  /** Hide the closing contact block (e.g. on /contact itself). */
  hideCta?: boolean;
}

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/recipes", label: "Recipes" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

const footerLinks = [
  ...navLinks,
  { href: "/now", label: "Now" },
  { href: "/privacy", label: "Privacy" },
];

export default function StaticPageLayout({ children, wide = false, hideCta = false }: StaticPageLayoutProps) {
  const column = wide ? "max-w-5xl" : "max-w-[680px]";
  return (
    <div className="site">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded focus:text-sm"
        style={{ background: "var(--site-ink)", color: "var(--site-bg)" }}
      >
        Skip to content
      </a>

      <header className="site-noprint border-b" style={{ borderColor: "var(--site-rule)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/about" className="site-display text-[21px] leading-none whitespace-nowrap shrink-0">
            Matthew McKenzie
          </Link>
          <Link
            href="/"
            className="site-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border whitespace-nowrap"
            style={{ borderColor: "var(--site-rule)", color: "var(--site-muted)" }}
          >
            Open desktop
          </Link>
        </div>
        <nav
          aria-label="Main navigation"
          className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-5 overflow-x-auto scrollbar-none -mb-px"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-[14px] whitespace-nowrap border-b-2 border-transparent hover:border-[var(--site-gold)] transition-colors"
              style={{ color: "var(--site-muted)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main-content" className={`${column} mx-auto px-4 sm:px-6 pt-12 pb-8 sm:pt-16`}>
        {children}
      </main>

      {!hideCta && <CtaBlock wide={wide} />}

      <footer className="site-noprint border-t mt-16" style={{ borderColor: "var(--site-rule)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div>
            <p className="site-display text-[19px]">Matthew McKenzie</p>
            <p className="text-[13px] mt-1" style={{ color: "var(--site-muted)" }}>
              Capital formation at Menlo Equities. Austin, Texas.
            </p>
          </div>
          <nav aria-label="Footer navigation" className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-[13px]">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:underline" style={{ color: "var(--site-muted)" }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 site-mono text-[11px]" style={{ color: "var(--site-muted)" }}>
          &copy; {new Date().getFullYear()} Matthew McKenzie &middot; Short links by{" "}
          <a href="https://mckm.at" className="site-link">mckm.at</a>
        </div>
      </footer>
    </div>
  );
}
