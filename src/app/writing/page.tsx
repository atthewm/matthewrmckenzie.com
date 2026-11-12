import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Writing | Capital Formation and Investor Partnerships",
  description: "Essays and longer form thinking by Matthew McKenzie on capital formation, investor partnerships, and building durable businesses.",
  alternates: { canonical: "https://matthewrmckenzie.com/writing" },
  openGraph: {
    title: "Writing | Capital Formation and Investor Partnerships",
    description: "Essays and longer form thinking by Matthew McKenzie on capital formation, investor partnerships, and building durable businesses.",
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
          className="site-prose"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
