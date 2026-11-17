import Link from "next/link";
import { profile } from "@/config/profile";

// ============================================================================
// HOME INTRO: the server-rendered first state of the home page
// ============================================================================
// The desktop only exists after JavaScript runs. Until then (and for crawlers
// and readers without JavaScript) this is the page: who Matthew is, his role,
// and plain links into the reading pages. It sits in a fixed layer that the
// desktop covers once it mounts; DesktopShell then sets data-desktop-ready on
// <html>, and globals.css takes the covered links out of the tab order.
// Styled with the reading-site tokens (.site), the same ones /about uses.
// ============================================================================

const links = [
  { href: "/about", label: "About" },
  { href: "/work", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/recipes", label: "Recipes" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
  { href: "/card", label: "Business card" },
] as const;

export default function HomeIntro() {
  return (
    <div id="home-intro" className="site home-intro">
      <div className="mx-auto max-w-[560px] px-6 pb-12 pt-[16vh]">
        <p className="site-eyebrow">
          {profile.company} &middot; {profile.primaryCity}
        </p>
        <h1 className="site-display mt-3 text-[34px] leading-[1.05]">{profile.fullName}</h1>
        <p className="mt-2 text-[15px] leading-snug" style={{ color: "var(--site-muted)" }}>
          {profile.title} at {profile.company}
        </p>
        <p className="mt-6 text-[15px] leading-[1.7]">{profile.bio}</p>
        <nav
          aria-label="Site sections"
          className="home-intro-nav mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px]"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} prefetch={false} className="site-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
