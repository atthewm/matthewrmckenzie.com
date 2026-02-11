import React from "react";
import Link from "next/link";

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
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export default function StaticPageLayout({ children }: StaticPageLayoutProps) {
  return (
    <div className="min-h-screen bg-desktop-bg text-desktop-text">
      {/* Nav */}
      <header className="border-b border-desktop-border">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide hover:text-desktop-accent transition-colors"
          >
            Matthew McKenzie
          </Link>
          <nav className="flex items-center gap-4">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-desktop-text-secondary hover:text-desktop-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-5 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-desktop-border mt-16">
        <div className="max-w-2xl mx-auto px-5 py-6 text-xs text-desktop-text-secondary">
          <p>&copy; {new Date().getFullYear()} Matthew McKenzie. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/" className="hover:text-desktop-accent transition-colors">
              Back to desktop view →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
