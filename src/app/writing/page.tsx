import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Writing | Capital Formation, Growth Strategy, AI Operations",
  description: "Essays and longer form thinking by Matthew McKenzie on capital formation, investor partnerships, AI operations, and building durable businesses.",
  alternates: { canonical: "/writing" },
  openGraph: {
    title: "Writing | Capital Formation, Growth Strategy, AI Operations",
    description: "Essays and longer form thinking by Matthew McKenzie on capital formation, investor partnerships, AI operations, and building durable businesses.",
  },
};

export default async function WritingPage() {
  const content = await getContent("writing");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Writing", url: "https://matthewrmckenzie.com/writing" },
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
