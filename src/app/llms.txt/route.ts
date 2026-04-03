// ============================================================================
// GET /llms.txt
// ============================================================================
// Plain text file for AI crawlers following the llms.txt specification.
// Describes site content, pages, and contact links.
// ============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  const body = `# matthewrmckenzie.com

> Matthew McKenzie structures capital partnerships and growth strategy for real asset backed businesses. Vice President of Investor Relations at Civitas Capital Group. Head of Capital Formation at Remote Coffee.

## About
Personal site of Matthew McKenzie. The site covers professional background, work experience, essays, project portfolio, and contact information. Built as a custom desktop operating system with Next.js, React, and TypeScript.

## Pages
- /: Home page with introduction and navigation
- /about: About Matthew McKenzie
- /work: Work experience and professional background
- /writing: Essays and writing
- /projects: Project portfolio, including MCP servers, Teams bots, and open source tools
- /contact: Contact information
- /privacy: Privacy policy

## Contact
- LinkedIn: https://www.linkedin.com/in/mrmckenzie/
- GitHub: https://github.com/atthewm
- Instagram: https://www.instagram.com/mrem/
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
