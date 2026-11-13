"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const docNavLinks = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/health", label: "Health" },
  { href: "/recipes", label: "Recipes" },
  { href: "/hobbies", label: "Hobbies" },
  { href: "/contact", label: "Contact" },
];

/** Toolbar navigation for the static document windows. */
export default function DocNav() {
  const path = usePathname() ?? "";
  return (
    <nav aria-label="Main navigation" className="doc-nav">
      {docNavLinks.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href || path.startsWith(`${l.href}/`) ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
