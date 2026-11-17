import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import sitemap from "./sitemap";
import { recipes } from "@/content/recipes/index";
import { PAGE_UPDATED, contentDate } from "@/lib/page-dates";

const SITE = "https://matthewrmckenzie.com";
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function essaySlugs(): string[] {
  return fs
    .readdirSync(path.join(process.cwd(), "src/content/essays"))
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function entry(url: string) {
  const found = sitemap().find((e) => e.url === url);
  if (!found) throw new Error(`${url} is not in the sitemap`);
  return found;
}

describe("sitemap", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_URL", "");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("lists every indexable page once, on the production host", () => {
    const urls = sitemap().map((e) => e.url);
    const expected = [
      SITE,
      ...["about", "work", "card", "contact", "writing", "recipes", "now", "privacy"].map((p) => `${SITE}/${p}`),
      ...essaySlugs().map((slug) => `${SITE}/writing/${slug}`),
      ...recipes.map((r) => `${SITE}/recipes/${r.slug}`),
    ];
    expect([...urls].sort()).toEqual([...expected].sort());
    expect(new Set(urls).size).toBe(urls.length);
  });

  test("includes /card and leaves out the feed and the retired /projects page", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(`${SITE}/card`);
    expect(urls.filter((u) => u.includes("feed.xml"))).toEqual([]);
    expect(urls.filter((u) => u.includes("/projects"))).toEqual([]);
    expect(urls.filter((u) => u.includes("/api/") || u.includes("/gate"))).toEqual([]);
  });

  test("gives every entry a real calendar date", () => {
    for (const e of sitemap()) {
      expect(typeof e.lastModified, e.url).toBe("string");
      expect(e.lastModified as string, e.url).toMatch(ISO_DAY);
      expect(Number.isNaN(new Date(`${e.lastModified}T00:00:00Z`).getTime()), e.url).toBe(false);
    }
  });

  test("does not depend on when the site is built", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-03-01T12:00:00Z"));
    const first = sitemap();
    vi.setSystemTime(new Date("2031-09-30T23:59:59Z"));
    const second = sitemap();
    expect(second).toEqual(first);
    expect(first.filter((e) => String(e.lastModified).startsWith("2027-03-01"))).toEqual([]);
  });

  test("dates markdown pages from their frontmatter", () => {
    for (const slug of ["about", "work", "contact", "now"]) {
      expect(entry(`${SITE}/${slug}`).lastModified, slug).toBe(contentDate(slug));
    }
    expect(entry(`${SITE}/now`).lastModified).toBe("2026-11-02");
  });

  test("dates code pages from the fixed page dates", () => {
    expect(entry(SITE).lastModified).toBe(PAGE_UPDATED.home);
    expect(entry(`${SITE}/card`).lastModified).toBe(PAGE_UPDATED.card);
    expect(entry(`${SITE}/privacy`).lastModified).toBe(PAGE_UPDATED.privacy);
  });

  test("dates each recipe from its own updated field", () => {
    for (const recipe of recipes) {
      expect(entry(`${SITE}/recipes/${recipe.slug}`).lastModified, recipe.slug).toBe(recipe.updated);
    }
    const newest = recipes.map((r) => r.updated).sort().at(-1);
    expect(entry(`${SITE}/recipes`).lastModified).toBe(newest);
  });

  test("dates each essay from its frontmatter, and the index from the newest one", () => {
    const dates = essaySlugs().map((slug) => {
      const raw = fs.readFileSync(path.join(process.cwd(), "src/content/essays", `${slug}.md`), "utf8");
      const { data } = matter(raw);
      const iso = new Date((data.dateModified ?? data.date) as string | Date).toISOString().slice(0, 10);
      expect(entry(`${SITE}/writing/${slug}`).lastModified, slug).toBe(iso);
      return iso;
    });
    const newest = [...dates, contentDate("writing")].sort().at(-1);
    expect(entry(`${SITE}/writing`).lastModified).toBe(newest);
  });
});
