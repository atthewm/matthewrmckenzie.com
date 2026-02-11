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
        contentMap[item.id] = content.html;
      }
    }
  }

  return <DesktopShell contentMap={contentMap} />;
}
