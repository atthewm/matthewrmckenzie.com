import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Work | Capital Formation, Investor Relations, Growth Strategy",
  description: "Capital formation across fund and direct investment vehicles. Investor relations for family offices and institutional allocators. Growth strategy for real asset backed businesses. AI operations tooling.",
  alternates: { canonical: "/work" },
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
