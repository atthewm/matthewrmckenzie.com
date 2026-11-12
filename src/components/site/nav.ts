// Navigation for the reading site. One list, used by the header, the phone
// menu and the footer.

export interface NavLink {
  readonly href: string;
  readonly label: string;
}

export const navLinks: readonly NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/health", label: "Health" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/recipes", label: "Recipes" },
  { href: "/hobbies", label: "Hobbies" },
  { href: "/contact", label: "Contact" },
];

export const footerLinks: readonly NavLink[] = [
  ...navLinks,
  { href: "/writing", label: "Writing" },
  { href: "/now", label: "Now" },
  { href: "/desktop", label: "Desktop mode" },
  { href: "/privacy", label: "Privacy" },
];

export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}
