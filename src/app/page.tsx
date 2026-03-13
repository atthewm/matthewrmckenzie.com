import { flattenFS } from "@/data/fs";
import { getContent } from "@/lib/content";
import DesktopShell from "@/components/desktop/DesktopShell";

// ============================================================================
// HOME PAGE
// ============================================================================
// Server component that pre-loads all content, then renders the client-side
// desktop shell.
// ============================================================================

export default async function HomePage() {
  // Pre-load all content for windows
  const allItems = flattenFS();
  const contentMap: Record<string, string> = {};

  for (const item of allItems) {
    if (item.contentPath) {
      const slug = item.contentPath.replace(/\.md$/, "");
      const content = await getContent(slug);
      if (content) {
        // Downgrade h1→h2 so the homepage has a single sr-only H1
        contentMap[item.id] = content.html
          .replace(/<h1(\s|>)/g, "<h2$1")
          .replace(/<\/h1>/g, "</h2>");
      }
    }
  }

  return (
    <>
      <h1 className="sr-only">Matthew McKenzie — Capital Formation & Growth Strategy</h1>
      <DesktopShell contentMap={contentMap} />
    </>
  );
}
