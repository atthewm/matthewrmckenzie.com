import type React from "react";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";
import WhoopDashboardApp from "@/components/apps/whoop/WhoopDashboardApp";
import NutritionApp from "@/components/apps/NutritionApp";
import TopFoodsApp from "@/components/apps/TopFoodsApp";
import BrandLogo from "@/components/ui/BrandLogo";

function Panel({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-sm font-semibold text-desktop-text">{title}</h2>
      <div
        className="overflow-hidden rounded-lg border border-desktop-border"
        style={{ height }}
      >
        {children}
      </div>
    </section>
  );
}

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
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Health and Fitness", url: "https://matthewrmckenzie.com/health" },
      ])} />
      {content ? (
        <article
          className="prose prose-sm dark:prose-invert max-w-none
                     prose-headings:font-semibold
                     prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-desktop-text">Tracked with</h2>
        <div className="flex flex-wrap gap-3">
          <BrandLogo brand="whoop" />
          <BrandLogo brand="eightSleep" />
        </div>
      </section>
      <Panel title="Training and recovery" height={640}>
        <WhoopDashboardApp />
      </Panel>
      <Panel title="Nutrition" height={680}>
        <NutritionApp />
      </Panel>
      <Panel title="Top foods" height={620}>
        <TopFoodsApp />
      </Panel>
    </StaticPageLayout>
  );
}
