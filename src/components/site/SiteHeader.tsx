"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, isActivePath } from "./nav";
import MobileMenu from "./MobileMenu";

// ============================================================================
// SITE HEADER (Client Component)
// ============================================================================
// Sticky header for the reading site. The shrink after 40px of scroll is a
// ScrollTrigger class toggle that lives in HeaderMotion, which is loaded with
// a dynamic import so GSAP never lands in the first bundle.
// ============================================================================

const HeaderMotion = dynamic(() => import("./HeaderMotion"), { ssr: false });

export default function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the phone menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  return (
    <>
      <header ref={headerRef} className="site-header site-noprint">
        <div className="site-wrap site-header-row">
          <Link href="/" className="site-brand" aria-current={pathname === "/" ? "page" : undefined}>
            Matthew McKenzie
          </Link>
          <nav aria-label="Main navigation" className="site-nav">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            ref={menuButtonRef}
            type="button"
            className="site-menu-btn"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            Menu
            <span className="site-menu-btn-bars" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </header>
      {menuOpen && <MobileMenu pathname={pathname} onClose={closeMenu} />}
      <HeaderMotion headerRef={headerRef} />
    </>
  );
}
