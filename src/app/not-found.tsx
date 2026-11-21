import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";

export default function NotFound() {
  return (
    <StaticPageLayout>
      <div className="text-center py-16">
        <h1 className="site-display text-4xl mb-2">404</h1>
        <p className="mb-6" style={{ color: "var(--site-muted)" }}>
          This page doesn&apos;t exist. Maybe it was moved, or maybe it never was.
        </p>
        <Link
          href="/"
          className="site-link inline-flex min-h-11 items-center gap-1.5 text-sm"
        >
          Back to McKenzie OS
        </Link>
      </div>
    </StaticPageLayout>
  );
}
