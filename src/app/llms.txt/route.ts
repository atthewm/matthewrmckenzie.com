// ============================================================================
// GET /llms.txt
// ============================================================================
// Plain text file for AI crawlers following the llms.txt specification.
// Describes site content, pages, and contact links.
// ============================================================================

import { NextResponse } from "next/server";

export async function GET() {
  const body = `# matthewrmckenzie.com

> Matthew McKenzie is Senior Vice President, Capital Formation at Menlo Equities, responsible for capital formation across the firm's private wealth channel with high net worth investors, family offices, and registered investment advisors. Outside of work he trains for strength and endurance, tracks recovery, and bakes sourdough.

## About
Personal site of Matthew McKenzie. The site covers professional background, work experience, essays, health and fitness, cooking and baking, and contact information. Built as a custom desktop operating system with Next.js, React, and TypeScript.

## Pages
- /: Home page with introduction and navigation
- /about: About Matthew McKenzie
- /work: Work experience and professional background
- /writing: Essays and writing
- /health: Health and fitness: training, recovery, sleep, and nutrition
- /kitchen: Cooking and baking: sourdough and tested recipes
- /hobbies: Training, tennis, DJing and photography
- /desktop: Optional Mac OS X style desktop view of the same content
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
