import React from "react";
import Link from "next/link";
import CtaBlock from "./CtaBlock";
import DocNav from "./DocNav";
import ThemeControl from "@/components/theme/ThemeControl";

// ============================================================================
// STATIC PAGE LAYOUT
// ============================================================================
// The server-rendered reading routes (/about, /work, /recipes ...) shown as a
// document window on the desktop wallpaper: title bar with traffic lights,
// an Aqua toolbar (back to the desktop, sections, theme switch) and a paper
// body. All text is in the HTML for search engines; nothing waits on motion.
// ============================================================================

interface StaticPageLayoutProps {
  children: React.ReactNode;
  /** Wider window for index pages such as /recipes. */
  wide?: boolean;
  /** Hide the closing contact panel (e.g. on /contact itself). */
  hideCta?: boolean;
  /** Title shown in the window's title bar. */
  title?: string;
}

const footerLinks = [
  { href: "/kitchen", label: "Cooking" },
  { href: "/now", label: "Now" },
  { href: "/writing", label: "Writing" },
  { href: "/food-room", label: "Food Room" },
  { href: "/card", label: "Card" },
  { href: "/privacy", label: "Privacy" },
];

export default function StaticPageLayout({ children, wide = false, hideCta = false, title = "Matthew McKenzie" }: StaticPageLayoutProps) {
  return (
    <div className="site">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded"
        style={{ background: "var(--paper)", color: "var(--text)" }}
      >
        Skip to content
      </a>

      <div className={`doc-window ${wide ? "is-wide" : ""}`}>
        <header className="site-noprint">
          <div className="doc-titlebar">
            <span className="traffic" aria-hidden="true">
              <span className="traffic-light is-close" />
              <span className="traffic-light is-min" />
              <span className="traffic-light is-zoom" />
            </span>
            <p className="doc-title">{title}</p>
          </div>
          <div className="doc-toolbar">
            <Link href="/" className="aqua-button">
              <span aria-hidden="true">‹</span> Desktop
            </Link>
            <DocNav />
            <ThemeControl size="small" />
          </div>
        </header>

        <main id="main-content" className="doc-body">
          {children}
          {!hideCta && <CtaBlock />}
        </main>

        <footer className="doc-footer site-noprint">
          <span>Matthew McKenzie, Menlo Equities, Austin</span>
          <nav aria-label="Footer navigation">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
