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
      <h1 className="sr-only">Matthew McKenzie | Capital Formation & Growth Strategy</h1>
      <DesktopShell contentMap={contentMap} />
      {/* Crawler / noscript fallback: visible text for search engines and users without JS */}
      <noscript>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#1a1a1a" }}>
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>
            Matthew McKenzie operates at the intersection of capital formation, growth strategy, and
            real asset backed consumer platforms. He structures capital and investor partnerships that
            support disciplined growth and long term ownership.
          </p>
          <nav style={{ marginTop: 32, display: "flex", gap: 24, fontSize: 14 }}>
            <a href="/about">About</a>
            <a href="/work">Work</a>
            <a href="/writing">Writing</a>
            <a href="/projects">Projects</a>
            <a href="/contact">Contact</a>
            <a href="/privacy">Privacy</a>
          </nav>
        </div>
      </noscript>
    </>
  );
}
