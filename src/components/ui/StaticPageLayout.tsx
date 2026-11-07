import React from "react";
import Link from "next/link";
import CtaBlock from "./CtaBlock";

// ============================================================================
// STATIC PAGE LAYOUT
// ============================================================================
// Shared layout for static fallback pages (/about, /work, etc.).
// These are SEO-friendly server-rendered pages that share content with the
// desktop app.
// ============================================================================

interface StaticPageLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/health", label: "Health" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/hobbies", label: "Hobbies" },
  { href: "/contact", label: "Contact" },
];

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-desktop-bg text-desktop-text">
      {/* Skip to content link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-desktop-accent focus:text-white focus:px-4 focus:py-2 focus:rounded focus:text-sm"
      >
        Skip to content
      </a>

      {/* Nav */}
      <header className="border-b border-desktop-border bg-desktop-surface">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between flex-wrap gap-y-2">
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide hover:text-desktop-accent transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-2"
          >
            Matthew McKenzie
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-4 flex-wrap">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] text-desktop-text-secondary hover:text-desktop-text transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main id="main-content" className="max-w-2xl mx-auto px-5 py-10 bg-desktop-surface rounded-b-lg min-h-[60vh]">
        {children}
      </main>

      {/* CTA Block (client component for analytics tracking) */}
      <CtaBlock />

      {/* Footer */}
      <footer className="border-t border-desktop-border mt-10 bg-desktop-surface">
        <div className="max-w-2xl mx-auto px-5 py-6 text-xs text-desktop-text-secondary">
          <p>&copy; {new Date().getFullYear()} Matthew McKenzie. All rights reserved.</p>
          <nav aria-label="Footer navigation" className="mt-1 flex items-center gap-3 flex-wrap">
            {[...navLinks, { href: "/writing", label: "Writing" }, { href: "/desktop", label: "Desktop mode" }, { href: "/privacy", label: "Privacy" }].map((link, i) => (
              <React.Fragment key={link.href}>
                {i > 0 && <span className="text-desktop-border">|</span>}
                <Link
                  href={link.href}
                  className="hover:text-desktop-accent transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-1"
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
