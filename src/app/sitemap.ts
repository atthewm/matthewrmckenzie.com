import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { recipes } from "@/content/recipes/index";
import {
  FALLBACK_DATE,
  PAGE_UPDATED,
  contentDate,
  frontmatterDate,
  latestDate,
} from "@/lib/page-dates";

// ============================================================================
// SITEMAP
// ============================================================================
// Indexable HTML pages only (no feeds, no redirects). `lastModified` is each
// page's own date from src/lib/page-dates.ts, so a deploy that does not touch
// a page does not mark it as changed.
// ============================================================================

interface EssayEntry {
  slug: string;
  updated: string;
}

function getEssays(): EssayEntry[] {
  const essaysDir = path.join(process.cwd(), "src/content/essays");
  try {
    return fs
      .readdirSync(essaysDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const raw = fs.readFileSync(path.join(essaysDir, f), "utf8");
        return {
          slug: f.replace(/\.md$/, ""),
          updated: frontmatterDate(matter(raw).data) ?? FALLBACK_DATE,
        };
      });
  } catch {
    return [];
  }
}

function resolveBaseUrl(): string {
  const production = "https://matthewrmckenzie.com";
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel && process.env.VERCEL_ENV !== "production") {
    return `https://${vercel}`;
  }
  return production;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = resolveBaseUrl();
  const essays = getEssays();
  const recipeDates = recipes.map((r) => r.updated || FALLBACK_DATE);
  const writingUpdated = latestDate([contentDate("writing"), ...essays.map((e) => e.updated)]);

  return [
    {
      url: baseUrl,
      lastModified: PAGE_UPDATED.home,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: contentDate("about"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: contentDate("work"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/card`,
      lastModified: PAGE_UPDATED.card,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: contentDate("contact"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/writing`,
      lastModified: writingUpdated,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...essays.map((essay) => ({
      url: `${baseUrl}/writing/${essay.slug}`,
      lastModified: essay.updated,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${baseUrl}/recipes`,
      lastModified: latestDate(recipeDates),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...recipes.map((r) => ({
      url: `${baseUrl}/recipes/${r.slug}`,
      lastModified: r.updated || FALLBACK_DATE,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${baseUrl}/now`,
      lastModified: contentDate("now"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: PAGE_UPDATED.privacy,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
