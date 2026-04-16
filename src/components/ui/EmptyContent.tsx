import Link from "next/link";

// ============================================================================
// EMPTY CONTENT STATE
// ============================================================================
// Fallback block rendered when a static page's markdown source is missing.
// Replaces the prior single sentence paragraph with a bordered empty state
// block that tells visitors what is going on and routes them home.
// ============================================================================

interface EmptyContentProps {
  heading?: string;
  helper?: string;
  homeHref?: string;
  homeLabel?: string;
}

export default function EmptyContent({
  heading = "Content coming soon",
  helper = "This page is still being drafted. In the meantime, everything else on the site is live.",
  homeHref = "/",
  homeLabel = "Return to home",
}: EmptyContentProps) {
  return (
    <div className="rounded-md border border-desktop-border bg-desktop-surface-raised px-5 py-6">
      <p className="text-sm font-semibold text-desktop-text">{heading}</p>
      <p className="mt-1 text-xs text-desktop-text-secondary">{helper}</p>
      <Link
        href={homeHref}
        className="mt-3 inline-block text-xs text-desktop-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent focus-visible:ring-offset-1 rounded"
      >
        {homeLabel}
      </Link>
    </div>
  );
}
