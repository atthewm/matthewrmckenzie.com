// ============================================================================
// ROBOTS POLICY: one list, every group built from it
// ============================================================================
// A crawler that matches a named group ignores the "*" group completely, so a
// named group that only says "Allow: /" would silently drop the private path
// rules for that bot. Every allowed group below is therefore generated from
// the same DISALLOWED_PATHS list as the wildcard group.
// ============================================================================

import type { MetadataRoute } from "next";

export const SITE_ORIGIN = "https://matthewrmckenzie.com";

/** Search engines, the Ahrefs audit crawlers, and answer engines that cite sources. */
export const ALLOWED_AGENTS = [
  "Googlebot",
  "Bingbot",
  "Applebot",
  "DuckDuckBot",
  "AhrefsBot",
  "AhrefsSiteAudit",
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
] as const;

/** Bulk scrapers: nothing on the site is open to them. */
export const BLOCKED_AGENTS = [
  "CCBot",
  "Bytespider",
  "Diffbot",
  "Meta-ExternalAgent",
  "Amazonbot",
  "cohere-ai",
  "ImagesiftBot",
  "Omgilibot",
  "PetalBot",
] as const;

/**
 * Paths no crawler should fetch: the admin sign-in, the JSON endpoints, and
 * the contact card download (it carries a phone number meant for people who
 * were handed the card, not for indexes).
 */
export const DISALLOWED_PATHS = ["/gate", "/api/", "/card/vcard"] as const;

interface RobotsGroup {
  userAgent: string;
  allow?: string;
  disallow: string | string[];
}

function allowedGroup(userAgent: string): RobotsGroup {
  return { userAgent, allow: "/", disallow: [...DISALLOWED_PATHS] };
}

function blockedGroup(userAgent: string): RobotsGroup {
  return { userAgent, disallow: "/" };
}

export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: [
      allowedGroup("*"),
      ...ALLOWED_AGENTS.map(allowedGroup),
      ...BLOCKED_AGENTS.map(blockedGroup),
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
