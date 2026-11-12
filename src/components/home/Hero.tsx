import { profile } from "@/config/profile";

// Homepage hero: the name in the display face, one line under it, two buttons
// and the LinkedIn text link. The first-visit reveal of the name is set up by
// HeroIntroScript (in the root layout head) and played by HomeMotion.

const CHAPTERS = [
  { href: "#capital", label: "Capital" },
  { href: "#training", label: "Training" },
  { href: "#kitchen", label: "Kitchen" },
] as const;

export default function Hero() {
  const austin = profile.offices.find((o) => o.city === "Austin");

  return (
    <section className="hero site-wrap" aria-labelledby="hero-name">
      <div className="site-grid hero-grid">
        <h1 id="hero-name" className="hero-name" data-hero-name>
          <span className="hero-name-line" data-hero-line>
            {profile.firstName}
          </span>{" "}
          <span className="hero-name-line" data-hero-line>
            {profile.lastName}
          </span>
        </h1>
        <div className="col-body hero-body">
          <p className="site-lede">
            {profile.title} at {profile.company}.{austin ? ` ${austin.city}, Texas.` : ""}
          </p>
          <div className="site-actions hero-actions">
            <a
              href={profile.scheduleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="site-btn site-btn-primary"
            >
              Schedule a call
            </a>
            <a href="mailto:matthew.mckenzie@mac.com" className="site-btn site-btn-ghost">
              Email
            </a>
            <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer" className="site-link">
              LinkedIn
            </a>
          </div>
        </div>
        <nav aria-label="On this page" className="col-head hero-index">
          {CHAPTERS.map((chapter, i) => (
            <a key={chapter.href} href={chapter.href}>
              <span className="site-num">{String(i + 1).padStart(2, "0")}</span>
              {chapter.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
