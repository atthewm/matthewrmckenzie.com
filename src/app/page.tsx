import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import { profile } from "@/config/profile";

// ============================================================================
// HOME PAGE
// ============================================================================
// Plain, scannable homepage: who I am, the four sections, and how to reach
// me. The Mac OS X desktop lives on at /desktop for anyone who wants it.
// ============================================================================

const sections = [
  {
    href: "/work",
    title: "Work",
    blurb: "Capital formation at Menlo Equities: private wealth, family offices and RIAs.",
    icon: "/icons/panther/applications-folder.png",
  },
  {
    href: "/health",
    title: "Health and Fitness",
    blurb: "Training, recovery and sleep from WHOOP, plus my daily nutrition.",
    icon: "/icons/custom/whoop.svg",
  },
  {
    href: "/kitchen",
    title: "Cooking and Baking",
    blurb: "Sourdough, jam and high protein recipes, tested and written down.",
    icon: "/icons/panther/library-folder.png",
  },
  {
    href: "/hobbies",
    title: "Hobbies",
    blurb: "Tennis, DJing and photography.",
    icon: "/icons/custom/hobbies.svg",
  },
];

export default function HomePage() {
  const austin = profile.offices.find((o) => o.city === "Austin");

  return (
    <StaticPageLayout>
      <section className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-desktop-text">
          Matthew McKenzie
        </h1>
        <p className="mt-1 text-sm text-desktop-text-secondary">
          {profile.title} at {profile.company}
          {austin ? ` · ${austin.city}, Texas` : ""}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-desktop-text">
          I structure capital partnerships for real asset backed businesses, across debt and
          equity, with family offices, UHNW investors and institutional groups. Outside of
          work I train, play tennis, and bake sourdough from my own rye starter.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="mailto:matthew.mckenzie@mac.com"
            className="inline-flex items-center rounded bg-desktop-accent px-4 py-2 text-xs font-medium text-white hover:opacity-90"
          >
            Email me
          </a>
          <a
            href="https://cal.com/mattmck/site"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-desktop-border px-4 py-2 text-xs font-medium text-desktop-text hover:bg-desktop-border/30"
          >
            Schedule a meeting
          </a>
          <a
            href="https://www.linkedin.com/in/mrmckenzie/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded border border-desktop-border px-4 py-2 text-xs font-medium text-desktop-text hover:bg-desktop-border/30"
          >
            LinkedIn
          </a>
        </div>
      </section>

      <nav aria-label="Sections" className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex items-start gap-3 rounded-lg border border-desktop-border bg-desktop-surface p-4 transition-colors hover:border-desktop-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.icon} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
            <span>
              <span className="block text-sm font-semibold text-desktop-text group-hover:text-desktop-accent">
                {s.title}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-desktop-text-secondary">
                {s.blurb}
              </span>
            </span>
          </Link>
        ))}
      </nav>

      <p className="mt-10 text-xs text-desktop-text-secondary">
        Prefer the old Mac OS X desktop?{" "}
        <Link href="/desktop" className="text-desktop-accent hover:underline">
          Open desktop mode
        </Link>
        .
      </p>
    </StaticPageLayout>
  );
}
