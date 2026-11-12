import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";

export default function NotFound() {
  return (
    <StaticPageLayout>
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-desktop-text mb-2">404</h1>
        <p className="text-desktop-text-secondary mb-6">
          This page doesn&apos;t exist. Maybe it was moved, or maybe it never was.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-desktop-accent hover:underline"
        >
          ← Back to desktop
        </Link>
      </div>
    </StaticPageLayout>
  );
}
