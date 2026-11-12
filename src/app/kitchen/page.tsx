import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";
import ProseRows from "@/components/site/ProseRows";
import SiteRow from "@/components/site/SiteRow";
import { linkRecipesOnSite } from "@/lib/prose";
import { recipes } from "@/content/recipes/index";

const recipeSlugs = new Set(recipes.map((r) => r.slug));

export const metadata: Metadata = {
  title: "Cooking and Baking",
  description: "Sourdough from a homemade rye starter, jam, and high protein recipes by Matthew McKenzie, each tested and written down.",
  alternates: { canonical: "https://matthewrmckenzie.com/kitchen" },
  openGraph: {
    title: "Cooking and Baking",
    description: "Sourdough from a homemade rye starter, jam, and high protein recipes by Matthew McKenzie, each tested and written down.",
  },
};

export default async function KitchenPage() {
  const content = await getContent("kitchen");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Cooking and Baking", url: "https://matthewrmckenzie.com/kitchen" },
      ])} />
      {content ? (
        <ProseRows html={linkRecipesOnSite(content.html, recipeSlugs)} eyebrow="Kitchen notebook">
          <SiteRow heading="All recipes">
            <p className="site-prose">
              <Link href="/recipes">Browse all {recipes.length} recipes</Link>, grouped by bread, breakfast, dinner, dessert and pantry.
            </p>
          </SiteRow>
        </ProseRows>
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
