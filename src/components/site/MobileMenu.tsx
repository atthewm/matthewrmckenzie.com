"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { navLinks, isActivePath } from "./nav";

// ============================================================================
// PHONE MENU (Client Component)
// ============================================================================
// Full-height sheet with the same links as the header, in the display face.
// Traps focus, closes on Escape, and locks page scroll while open.
// ============================================================================

interface MobileMenuProps {
  pathname: string | null;
  onClose: () => void;
}

const FOCUSABLE = "a[href], button:not([disabled])";

export default function MobileMenu({ pathname, onClose }: MobileMenuProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !sheetRef.current) return;
      const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div ref={sheetRef} className="site-sheet site-noprint" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="site-wrap site-sheet-top">
        <Link href="/" className="site-brand" onClick={onClose}>
          Matthew McKenzie
        </Link>
        <button ref={closeRef} type="button" className="site-menu-btn" onClick={onClose}>
          Close
        </button>
      </div>
      <nav aria-label="Menu" className="site-wrap site-sheet-nav">
        {navLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
          >
            <span className="site-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="site-wrap site-sheet-foot">
        <a href="https://cal.com/mattmck/site" target="_blank" rel="noopener noreferrer" className="site-btn site-btn-primary">
          Schedule a call
        </a>
        <a href="mailto:matthew.mckenzie@mac.com" className="site-btn site-btn-ghost">
          Email
        </a>
      </div>
    </div>
  );
}
