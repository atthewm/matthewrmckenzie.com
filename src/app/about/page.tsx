import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import AffiliationRow from "@/components/ui/AffiliationRow";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "About | Capital Formation, Health, and Cooking",
  description: "Senior Vice President, Capital Formation at Menlo Equities. Private wealth partnerships with high net worth investors, family offices, and RIAs. Outside of work: training, recovery, sourdough, and recipes.",
  alternates: { canonical: "https://matthewrmckenzie.com/about" },
  openGraph: {
    title: "About | Capital Formation, Health, and Cooking",
    description: "Senior Vice President, Capital Formation at Menlo Equities. Private wealth partnerships with high net worth investors, family offices, and RIAs. Outside of work: training, recovery, sourdough, and recipes.",
  },
};

export default async function AboutPage() {
  const content = await getContent("about");

  return (
    <StaticPageLayout title="About">
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "About", url: "https://matthewrmckenzie.com/about" },
      ])} />
      {content ? (
        <article
          className="site-prose"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
      <AffiliationRow />
    </StaticPageLayout>
  );
}
