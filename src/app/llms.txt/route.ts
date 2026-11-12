// ============================================================================
// GET /llms.txt
// ============================================================================
// Plain text file for AI crawlers following the llms.txt specification.
// Identity details come from src/config/profile.ts; recipes from the index.
// ============================================================================

import { NextResponse } from "next/server";
import { profile, previousCompany } from "@/config/profile";
import { recipes } from "@/content/recipes/index";

const SITE = "https://matthewrmckenzie.com";

export async function GET() {
  const recipeLines = recipes
    .map((r) => `- ${r.title}: ${SITE}/recipes/${r.slug}`)
    .join("\n");

  const body = `# ${profile.fullName}

> ${profile.fullName} is ${profile.title} at ${profile.company}, based in ${profile.primaryCity}. ${profile.bio}

## Who is ${profile.fullName}?

${profile.priorBio}

${profile.educationBio}

He also builds his own software: the mckm.at link shortener and data room platform, this site (a desktop operating system built with Next.js), and a personal health data stack using WHOOP and Eight Sleep.

## Topics

1. Capital formation and investor relations for private real estate.
2. Private wealth partnerships with family offices, RIAs, and high net worth investors.
3. Tracked document sharing and data rooms for investor relations (mckm.at).
4. Baking and recipe development, including sourdough and high-protein desserts.

## Key Pages

- About: ${SITE}/about
- Work: ${SITE}/work
- Projects: ${SITE}/projects
- Writing: ${SITE}/writing
- Recipes: ${SITE}/recipes
- Contact: ${SITE}/contact

## Recipes

${recipeLines}

## Background

- ${profile.title}, ${profile.company} (2026 to present)
- ${previousCompany.title}, ${previousCompany.name} (${previousCompany.start} to ${previousCompany.end})

## Social

- LinkedIn: ${profile.social.linkedin}
- GitHub: ${profile.social.github}
- Instagram: ${profile.social.instagram}

## Contact

- Email: matthew.mckenzie@mac.com
- Schedule a call: ${profile.scheduleUrl}
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
