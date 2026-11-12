import type React from "react";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";
import ProseRows from "@/components/site/ProseRows";
import SiteRow from "@/components/site/SiteRow";
import StrainSparkline from "@/components/site/StrainSparkline";
import WhoopDashboardApp from "@/components/apps/whoop/WhoopDashboardApp";
import NutritionApp from "@/components/apps/NutritionApp";
import TopFoodsApp from "@/components/apps/TopFoodsApp";
import BrandLogo from "@/components/ui/BrandLogo";

// The three panels below are the desktop apps, embedded as they are. They keep
// their own Panther styling inside a plain frame.
function Panel({ title, height, children }: { title: string; height: number; children: React.ReactNode }) {
  return (
    <SiteRow heading={title} wide>
      <div className="site-panel" style={{ height }}>
        {children}
      </div>
    </SiteRow>
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
        <ProseRows html={content.html} eyebrow="Training and recovery">
          <SiteRow heading="Tracked with">
            <div className="site-actions">
              <BrandLogo brand="whoop" />
              <BrandLogo brand="eightSleep" />
            </div>
          </SiteRow>
          <SiteRow heading="Day strain" note="WHOOP">
            <StrainSparkline />
          </SiteRow>
          <Panel title="Training and recovery" height={640}>
            <WhoopDashboardApp />
          </Panel>
          <Panel title="Nutrition" height={680}>
            <NutritionApp />
          </Panel>
          <Panel title="Top foods" height={620}>
            <TopFoodsApp />
          </Panel>
        </ProseRows>
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
