import type { Metadata } from "next";
import { flattenFS } from "@/data/fs";
import { getContent } from "@/lib/content";
import DesktopShell from "@/components/desktop/DesktopShell";
import HomeIntro from "@/components/home/HomeIntro";
import JsonLd, { profilePageSchema } from "@/components/ui/JsonLd";

// ============================================================================
// HOME PAGE
// ============================================================================
// Server component. It renders the intro (the first paint, and the whole page
// for crawlers and readers without JavaScript), pre-loads the content for the
// windows, then hands over to the client-side desktop shell, which covers the
// intro once it mounts.
// ============================================================================

// The canonical lives here, not in the root layout, so other routes do not
// inherit the home page URL as their canonical.
export const metadata: Metadata = {
  alternates: { canonical: "https://matthewrmckenzie.com" },
};

export default async function HomePage() {
  // Pre-load all content for windows
  const allItems = flattenFS();
  const contentMap: Record<string, string> = {};

  for (const item of allItems) {
    // Recipes load on demand from /api/recipes/[slug] to keep the page light.
    if (item.contentPath && !item.contentPath.startsWith("recipes/")) {
      const slug = item.contentPath.replace(/\.md$/, "");
      const content = await getContent(slug);
      if (content) {
        // Downgrade h1 to h2 so the intro heading stays the page's only H1
        contentMap[item.id] = content.html
          .replace(/<h1(\s|>)/g, "<h2$1")
          .replace(/<\/h1>/g, "</h2>");
      }
    }
  }

  return (
    <>
      <JsonLd data={profilePageSchema} />
      <HomeIntro />
      <DesktopShell contentMap={contentMap} />
    </>
  );
}
