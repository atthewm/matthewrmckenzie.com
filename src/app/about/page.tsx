import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import AffiliationRow from "@/components/ui/AffiliationRow";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "About | Capital Formation and AI Operations",
  description: "Senior Vice President, Capital Formation at Menlo Equities in Austin. Private wealth partnerships with high net worth investors, family offices, and RIAs.",
  alternates: { canonical: "https://matthewrmckenzie.com/about" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "About | Capital Formation and AI Operations",
    description: "Senior Vice President, Capital Formation at Menlo Equities in Austin. Private wealth partnerships with high net worth investors, family offices, and RIAs.",
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
