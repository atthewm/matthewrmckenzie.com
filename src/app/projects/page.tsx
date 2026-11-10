import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import EmptyContent from "@/components/ui/EmptyContent";

export const metadata: Metadata = {
  title: "Projects | AI Operations Tooling, Platforms, Open Source",
  description: "mckm.at, McKenzie OS, Eight Sleep integrations, and other projects by Matthew McKenzie.",
  alternates: { canonical: "https://matthewrmckenzie.com/projects" },
  openGraph: {
    title: "Projects | AI Operations Tooling, Platforms, Open Source",
    description: "mckm.at, McKenzie OS, Eight Sleep integrations, and other projects by Matthew McKenzie.",
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
          className="site-prose"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <EmptyContent />
      )}
    </StaticPageLayout>
  );
}
