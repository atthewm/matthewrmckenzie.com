import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and longer form thinking by Matthew McKenzie on capital formation, investor partnerships, and building durable businesses.",
  alternates: { canonical: "https://matthewrmckenzie.com/writing" },
  openGraph: {
    type: "website",
    url: "https://matthewrmckenzie.com/writing",
    images: ["/opengraph-image"],
    title: "Writing | Matthew McKenzie",
    description: "Essays and longer form thinking by Matthew McKenzie on capital formation, investor partnerships, and building durable businesses.",
  },
};

export default async function WritingPage() {
  const content = await getContent("writing");

  return (
    <StaticPageLayout section="/writing">
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Writing", url: "https://matthewrmckenzie.com/writing" },
      ])} />
      {content ? (
        <article
          className="site-prose"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
