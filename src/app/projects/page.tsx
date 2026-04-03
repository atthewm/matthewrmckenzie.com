import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Projects | AI Operations Tooling, Platforms, Open Source",
  description: "Toast MCP Server, MarginEdge integrations, Teams bots for restaurant operations, McKenzie OS, and other projects by Matthew McKenzie. Open source on GitHub.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects | AI Operations Tooling, Platforms, Open Source",
    description: "Toast MCP Server, MarginEdge integrations, Teams bots for restaurant operations, McKenzie OS, and other projects by Matthew McKenzie.",
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
