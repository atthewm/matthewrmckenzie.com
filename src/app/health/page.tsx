import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";
import BrandLogo from "@/components/ui/BrandLogo";
import HealthPanels from "@/components/site/HealthPanels";

export const metadata: Metadata = {
  title: "Health and Fitness",
  description: "How Matthew McKenzie trains, recovers, sleeps, and eats: strength and endurance work, WHOOP and Eight Sleep tracking, and nutrition.",
  alternates: { canonical: "https://matthewrmckenzie.com/health" },
  openGraph: {
    title: "Health and Fitness",
    description: "How Matthew McKenzie trains, recovers, sleeps, and eats: strength and endurance work, WHOOP and Eight Sleep tracking, and nutrition.",
  },
};

export default async function HealthPage() {
  const content = await getContent("health");

  return (
    <StaticPageLayout title="Health and Fitness" wide>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Health and Fitness", url: "https://matthewrmckenzie.com/health" },
      ])} />
      {content ? (
        <article className="site-prose site-measure" dangerouslySetInnerHTML={{ __html: content.html }} />
      ) : (
        <EmptyContent />
      )}
      <section aria-labelledby="tracked-with" className="site-measure mt-8">
        <h2 id="tracked-with" className="site-section-title">Tracked with</h2>
        <div className="flex flex-wrap items-center gap-8 mt-3">
          <BrandLogo brand="whoop" />
          <BrandLogo brand="eightSleep" />
        </div>
      </section>
      <HealthPanels />
    </StaticPageLayout>
  );
}
