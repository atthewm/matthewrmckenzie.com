import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Projects | Selected Work & Case Studies",
  description: "Selected projects and case studies by Matthew McKenzie. Capital formation, growth strategy, and real asset backed consumer platforms.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | Selected Work & Case Studies",
    description: "Selected projects and case studies by Matthew McKenzie. Capital formation, growth strategy, and real asset backed consumer platforms.",
  },
};

export default async function ProjectsPage() {
  const content = await getContent("projects");

  return (
    <StaticPageLayout>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://matthewrmckenzie.com" },
        { name: "Projects", url: "https://matthewrmckenzie.com/projects" },
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
