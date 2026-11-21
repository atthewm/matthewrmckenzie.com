import Link from "next/link";
import AppearancePicker from "@/components/ui/AppearancePicker";
import { Calendar, Contact, Mail } from "lucide-react";
import { profile } from "@/config/profile";
import type { FSItem } from "@/data/fs";
import { PantherIcon } from "@/components/desktop/PantherIcons";

const readingLinks = [
  ["/about", "About"], ["/work", "Work"], ["/writing", "Writing"], ["/recipes", "Recipes"],
  ["/now", "Now"], ["/contact", "Contact"], ["/card", "Business card"],
] as const;

export default function Springboard({ items, onOpen, firstPaint = false }: {
  items: FSItem[]; onOpen?: (item: FSItem) => void; firstPaint?: boolean;
}) {
  return (
    <main id={firstPaint ? "home-intro" : undefined} className={`site springboard ${firstPaint ? "home-intro" : ""}`}>
      <div className="springboard-inner">
        <header className="springboard-intro">
          <p className="site-eyebrow">{profile.company} &middot; {profile.primaryCity}</p>
          <h1 className="site-display">{profile.fullName}</h1>
          <p className="springboard-role">{profile.title}. Private wealth, family offices, and RIAs.</p>
        </header>
        <nav className="springboard-actions" aria-label="Contact options">
          <Link href="/card"><Contact size={18} />Save contact</Link>
          <Link href="/contact"><Mail size={18} />Email</Link>
          <a href={profile.scheduleUrl} target="_blank" rel="noopener noreferrer"><Calendar size={18} />Schedule</a>
        </nav>
        <div className="springboard-heading">
          <h2 className="site-eyebrow">McKenzie OS</h2>
          <Link className="site-link" href="/about">Reading view</Link>
        </div>
        <ul className="springboard-apps" aria-label="Applications">
          {items.map((item) => {
            const icon = <><span className="springboard-icon"><PantherIcon itemId={item.id} size={40} /></span><span>{item.name}</span></>;
            const href = item.staticRoute || item.href || (item.id === "now" ? "/now" : undefined);
            return <li key={item.id}>{onOpen ? (
              <button type="button" onClick={() => onOpen(item)} aria-label={`Open ${item.name}`}>{icon}</button>
            ) : href ? (
              <a href={href} aria-label={item.name}>{icon}</a>
            ) : (
              <span className="springboard-tile">{icon}</span>
            )}</li>;
          })}
        </ul>
        <AppearancePicker />
        <nav className="home-intro-nav springboard-reading" aria-label="Site sections">
          {readingLinks.map(([href, label]) => <Link key={href} href={href} prefetch={false} className="site-link">{label}</Link>)}
        </nav>
        {firstPaint && <p className="springboard-biography">{profile.bio}</p>}
      </div>
    </main>
  );
}
