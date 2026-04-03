// ============================================================================
// RSS FEED
// ============================================================================
// Generates an RSS 2.0 feed. Currently includes the site's static pages.
// As writing/essays are published, add them here as individual <item> entries.
// ============================================================================

const SITE_URL = "https://matthewrmckenzie.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const now = new Date().toUTCString();

  const items = [
    {
      title: "About Matthew McKenzie",
      link: `${SITE_URL}/about`,
      description:
        "Capital formation, growth strategy, and AI operations. Nine years at Civitas Capital Group. Head of Capital Formation at Remote Coffee.",
      pubDate: "Tue, 01 Apr 2026 00:00:00 GMT",
    },
    {
      title: "Work: Capital Formation, Investor Relations, Growth Strategy",
      link: `${SITE_URL}/work`,
      description:
        "Capabilities in capital formation, investor relations, growth strategy, and AI operations tooling for real asset backed businesses.",
      pubDate: "Tue, 01 Apr 2026 00:00:00 GMT",
    },
    {
      title: "Projects: AI Operations Tooling and Platforms",
      link: `${SITE_URL}/projects`,
      description:
        "Toast MCP Server, MarginEdge integrations, Teams bots for restaurant operations, McKenzie OS, and more.",
      pubDate: "Tue, 01 Apr 2026 00:00:00 GMT",
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Matthew McKenzie</title>
    <link>${SITE_URL}</link>
    <description>Capital formation, growth strategy, and AI operations tooling for real asset backed businesses.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>matthew.mckenzie@mac.com (Matthew McKenzie)</managingEditor>
    <webMaster>matthew.mckenzie@mac.com (Matthew McKenzie)</webMaster>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="true">${item.link}</guid>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
