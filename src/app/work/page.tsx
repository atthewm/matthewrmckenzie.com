import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Work | Capital Formation, Investor Relations, Growth Strategy",
  description: "Capital formation across fund and direct investment vehicles. Investor relations for family offices and institutional allocators. Growth strategy for real asset backed businesses. AI operations tooling.",
  alternates: { canonical: "https://matthewrmckenzie.com/work" },
  openGraph: {
    title: "Work | Capital Formation, Investor Relations, Growth Strategy",
    description: "Capital formation across fund and direct investment vehicles. Investor relations for family offices and institutional allocators. Growth strategy for real asset backed businesses.",
  },
};

export default async function WorkPage() {
  const content = await getContent("work");

  return (
    <StaticPageLayout>
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
