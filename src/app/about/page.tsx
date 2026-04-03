import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import AffiliationRow from "@/components/ui/AffiliationRow";

export const metadata: Metadata = {
  title: "About | Capital Formation, Growth Strategy, AI Operations",
  description: "Nine years in capital formation at Civitas Capital Group. Investor partnerships with family offices and institutional groups. Growth strategy at Remote Coffee. AI operations tooling for restaurant teams.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About | Capital Formation, Growth Strategy, AI Operations",
    description: "Nine years in capital formation at Civitas Capital Group. Investor partnerships with family offices and institutional groups. Growth strategy at Remote Coffee. AI operations tooling for restaurant teams.",
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
      <AffiliationRow />
    </StaticPageLayout>
  );
}
