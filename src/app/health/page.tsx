import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Health and Fitness",
  description: "How Matthew McKenzie trains, recovers, sleeps, and eats: strength and endurance work, WHOOP and Eight Sleep tracking, and nutrition.",
  alternates: { canonical: "https://matthewrmckenzie.com/health" },
  openGraph: {
    title: "Health and Fitness",
    description: "How Matthew McKenzie trains, recovers, sleeps, and eats: strength and endurance work, WHOOP and Eight Sleep tracking, and nutrition.",
  },
};

export default async function HealthPage() {
  const content = await getContent("health");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Health and Fitness", url: "https://matthewrmckenzie.com/health" },
      ])} />
      {content ? (
        <article
          className="prose prose-sm dark:prose-invert max-w-none
                     prose-headings:font-semibold
                     prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
