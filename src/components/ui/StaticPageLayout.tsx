import React from "react";
import CtaBlock from "./CtaBlock";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

// ============================================================================
// STATIC PAGE LAYOUT
// ============================================================================
// Shell for the reading site: skip link, sticky header, a 1200px main column
// on the 12-column grid, the closing contact block and the footer. Uses the
// .site tokens in globals.css and the styles in src/styles/site*.css.
// ============================================================================

interface StaticPageLayoutProps {
  children: React.ReactNode;
  /** Hide the closing contact block (e.g. on /contact itself). */
  hideCta?: boolean;
  /** The homepage sets its own top spacing. */
  variant?: "page" | "home";
}

export default function StaticPageLayout({ children, hideCta = false, variant = "page" }: StaticPageLayoutProps) {
  return (
    <div className="site">
      <a href="#main-content" className="site-skip">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className={variant === "home" ? "site-main is-home" : "site-main site-wrap"}>
        {children}
      </main>
      {!hideCta && <CtaBlock />}
      <SiteFooter />
    </div>
  );
}
