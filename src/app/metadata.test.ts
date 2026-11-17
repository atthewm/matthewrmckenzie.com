import { describe, expect, test } from "vitest";
import type { Metadata } from "next";
import { metadata as home } from "./page";
import { metadata as about } from "./about/page";
import { metadata as work } from "./work/page";
import { metadata as contact } from "./contact/page";
import { metadata as writing } from "./writing/page";
import { metadata as privacy } from "./privacy/page";

const SUFFIX = " | Matthew McKenzie";

const pages: Array<{ path: string; metadata: Metadata; title: string }> = [
  { path: "/about", metadata: about, title: "About" },
  { path: "/work", metadata: work, title: "Work" },
  { path: "/contact", metadata: contact, title: "Contact" },
  { path: "/writing", metadata: writing, title: "Writing" },
  { path: "/privacy", metadata: privacy, title: "Privacy" },
];

describe("page metadata", () => {
  test("uses the short titles, which fit in 60 characters with the site name", () => {
    for (const page of pages) {
      expect(page.metadata.title, page.path).toBe(page.title);
      expect(`${page.title}${SUFFIX}`.length, page.path).toBeLessThanOrEqual(60);
      expect(page.metadata.openGraph?.title, page.path).toBe(`${page.title}${SUFFIX}`);
    }
  });

  test("says nothing about AI operations, agents or MCP in titles or descriptions", () => {
    for (const page of pages) {
      const text = [page.metadata.title, page.metadata.description, page.metadata.openGraph?.title, page.metadata.openGraph?.description].join(" ");
      expect(text, page.path).not.toMatch(/\bAI\b|MCP|\bagents?\b/i);
    }
  });

  test("gives every page its own canonical", () => {
    for (const page of pages) {
      const canonical = String(page.metadata.alternates?.canonical);
      expect(canonical.endsWith(page.path), `${page.path} -> ${canonical}`).toBe(true);
    }
  });

  test("keeps the home canonical on the home page itself", () => {
    expect(home.alternates?.canonical).toBe("https://matthewrmckenzie.com");
  });
});
