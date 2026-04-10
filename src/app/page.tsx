import Link from "next/link";
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
      {/* Crawler / noscript fallback: structured content for search engines and users without JS */}
      <noscript>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px", fontFamily: "system-ui, sans-serif", color: "#1a1a1a" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Matthew McKenzie</h2>
          <p style={{ fontSize: 15, color: "#636366", marginBottom: 24 }}>Capital Formation &amp; Growth Strategy</p>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Matthew McKenzie structures capital partnerships and growth strategy for real asset backed
            businesses. He works across both debt and equity, partnering with family offices, UHNW investors,
            and institutional groups to build companies with disciplined underwriting and long term
            ownership at the center.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            Over nine years at Civitas Capital Group, he has helped raise and deploy capital across
            niche U.S. real estate strategies. He also leads capital formation and growth strategy
            at Remote Coffee, an early stage consumer platform in Austin, Texas.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Matthew builds production AI tooling that connects natural language interfaces to restaurant
            and hospitality operations platforms, including MCP servers and Microsoft Teams bots for
            Toast and MarginEdge.
          </p>
          <nav style={{ display: "flex", gap: 24, fontSize: 14, flexWrap: "wrap" as const }}>
            <Link href="/about">About</Link>
            <Link href="/work">Work</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/writing">Writing</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
          <p style={{ fontSize: 13, marginTop: 32, color: "#636366" }}>
            <a href="mailto:matthew.mckenzie@mac.com">matthew.mckenzie@mac.com</a>
            &nbsp;&middot;&nbsp;
            <a href="https://www.linkedin.com/in/mrmckenzie/">LinkedIn</a>
            &nbsp;&middot;&nbsp;
            <a href="https://cal.com/mattmck/site">Schedule a Call</a>
          </p>
        </div>
      </noscript>
    </>
  );
}
