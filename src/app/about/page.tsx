import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import StaticPageLayout from "@/components/ui/StaticPageLayout";

export const metadata: Metadata = {
  title: "About",
  description: "About Matthew McKenzie - background, interests, and what I'm working on.",
};

export default async function AboutPage() {
  const content = await getContent("about");

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
