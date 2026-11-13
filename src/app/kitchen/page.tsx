import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";
import { linkRecipesOnSite } from "@/lib/prose";
import { recipes } from "@/content/recipes/index";

const recipeSlugs = new Set(recipes.map((r) => r.slug));

export const metadata: Metadata = {
  title: "Cooking and Baking",
  description: "Sourdough from a homemade rye starter, jam, and high protein recipes by Matthew McKenzie, each tested and written down.",
  alternates: { canonical: "https://matthewrmckenzie.com/kitchen" },
  openGraph: {
    images: ["/opengraph-image"],
    title: "Cooking and Baking",
    description: "Sourdough from a homemade rye starter, jam, and high protein recipes by Matthew McKenzie, each tested and written down.",
  },
};

export default async function KitchenPage() {
  const content = await getContent("kitchen");

  return (
    <StaticPageLayout title="Cooking and Baking">
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Cooking and Baking", url: "https://matthewrmckenzie.com/kitchen" },
      ])} />
      {content ? (
        <article className="site-prose" dangerouslySetInnerHTML={{ __html: linkRecipesOnSite(content.html, recipeSlugs) }} />
      ) : (
        <EmptyContent />
      )}
      <p className="site-prose mt-6">
        <Link href="/recipes">Browse all {recipes.length} recipes</Link>, grouped by bread, breakfast, dinner, dessert and pantry.
      </p>
    </StaticPageLayout>
  );
}
