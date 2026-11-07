import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

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
        <article
          className="prose prose-sm dark:prose-invert max-w-none
                     prose-headings:font-semibold
                     prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
