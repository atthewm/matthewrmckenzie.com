import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and case studies by Matthew McKenzie.",
};

export default async function ProjectsPage() {
  const content = await getContent("projects");

  return (
    <StaticPageLayout>
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
