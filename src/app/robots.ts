import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/robots-policy";

// ============================================================================
// ROBOTS.TXT
// ============================================================================
// Search engines, the Ahrefs audit crawlers and answer engines that cite their
// sources may read every public page. Bulk scrapers are refused. Each allowed
// crawler gets its own group with the same private path rules as "*"; the
// lists live in src/lib/robots-policy.ts.
// LLM context is served at /llms.txt by src/app/llms.txt/route.ts and stays
// open to every allowed crawler.
// ============================================================================

export default function robots(): MetadataRoute.Robots {
  return buildRobots();
}
