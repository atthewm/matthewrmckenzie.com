import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Work",
  description: "Capital formation for funds and direct investments, investor relations for family offices and institutions, and growth strategy for real asset businesses.",
  alternates: { canonical: "https://matthewrmckenzie.com/work" },
  openGraph: {
    type: "website",
    url: "https://matthewrmckenzie.com/work",
    images: ["/opengraph-image"],
    title: "Work | Matthew McKenzie",
    description: "Capital formation for funds and direct investments, investor relations for family offices and institutions, and growth strategy for real asset businesses.",
  },
};

export default async function WorkPage() {
  const content = await getContent("work");

  return (
    <StaticPageLayout section="/work">
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Work", url: "https://matthewrmckenzie.com/work" },
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
