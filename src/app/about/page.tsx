import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "About | Background & Current Work",
  description: "About Matthew McKenzie. Background in capital formation and growth strategy, current interests, and what he is working on right now.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Background & Current Work",
    description: "About Matthew McKenzie. Background in capital formation and growth strategy, current interests, and what he is working on right now.",
  },
};

export default async function AboutPage() {
  const content = await getContent("about");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "About", url: "https://matthewrmckenzie.com/about" },
      ])} />
      {content ? (
        <article
          className="prose prose-sm dark:prose-invert max-w-none
                     prose-headings:font-semibold
                     prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <p className="text-desktop-text-secondary">Content coming soon.</p>
      )}
    </StaticPageLayout>
  );
}
