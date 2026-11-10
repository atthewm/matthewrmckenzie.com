import Link from "next/link";

// ============================================================================
// EMPTY CONTENT STATE
// ============================================================================
// Rendered when a static page's markdown source is missing.
// ============================================================================

interface EmptyContentProps {
  heading?: string;
  helper?: string;
  homeHref?: string;
  homeLabel?: string;
}

export default function EmptyContent({
  heading = "Content coming soon",
  helper = "This page is still being drafted. Everything else on the site is live.",
  homeHref = "/about",
  homeLabel = "Go to About",
}: EmptyContentProps) {
  return (
    <div className="rounded-xl border px-5 py-6" style={{ borderColor: "var(--site-rule)", background: "var(--site-surface)" }}>
      <p className="text-[15px] font-semibold">{heading}</p>
      <p className="mt-1 text-[14px]" style={{ color: "var(--site-muted)" }}>{helper}</p>
      <Link href={homeHref} className="mt-3 inline-block text-[14px] site-link">
        {homeLabel}
      </Link>
    </div>
  );
}
