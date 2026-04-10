import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

function getEssayEntries(): MetadataRoute.Sitemap {
  const essaysDir = path.join(process.cwd(), "src/content/essays");
  try {
    return fs
      .readdirSync(essaysDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => {
        const raw = fs.readFileSync(path.join(essaysDir, f), "utf8");
        const { data } = matter(raw);
        const slug = f.replace(/\.md$/, "");
        return {
          url: `https://matthewrmckenzie.com/writing/${slug}`,
          lastModified: data.date ? new Date(data.date as string) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });
  } catch {
    return [];
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://matthewrmckenzie.com";
  const now = new Date().toISOString().split("T")[0];

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/writing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...getEssayEntries(),
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/feed.xml`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.2,
    },
  ];
}
