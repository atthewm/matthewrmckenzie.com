import { describe, expect, test } from "vitest";
import fs from "fs";
import path from "path";
import { youtubeConfig } from "@/config/playlists";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), "src/content", file), "utf8");

// Dash characters are written as escapes so this file has none of its own.
const HAS_DASH = /[\u2013\u2014]/;

describe("page copy", () => {
  test("About, Work and Contact say nothing about agents or MCP servers", () => {
    for (const file of ["about.md", "work.md", "contact.md"]) {
      const text = read(file);
      expect(text, file).not.toMatch(/MCP/);
      expect(text, file).not.toMatch(/\bagents?\b/i);
      expect(text, file).not.toMatch(/puts AI to work/i);
    }
  });

  test("Contact no longer has the Builders paragraph, and keeps the others", () => {
    const contact = read("contact.md");
    expect(contact).not.toContain("**Builders.**");
    for (const heading of ["**Investors and advisors.**", "**Sponsors and operators.**", "**General.**"]) {
      expect(contact).toContain(heading);
    }
  });

  test("Work keeps the raise figure and the three testimonials exactly as they were", () => {
    const work = read("work.md");
    expect(work).toContain("**$800M+** in equity capital raised across PE real estate strategies.");
    expect(work).toContain("*Family Office Principal, Southwest U.S.*");
    expect(work).toContain("*CIO, Multi Family Office*");
    expect(work).toContain("*Managing Director, RIA Platform*");
    expect(work.match(/^> "/gm)).toHaveLength(3);
  });

  test("About, Work and Contact carry the date of their last change", () => {
    for (const file of ["about.md", "work.md", "contact.md"]) {
      expect(read(file), file).toMatch(/^updated: 2026-11-17$/m);
    }
  });
});

describe("playlist titles", () => {
  test("use no em or en dashes", () => {
    const withDash = youtubeConfig.manualTracks.filter((track) => HAS_DASH.test(track.title));
    expect(withDash).toEqual([]);
  });

  test("keep the four retitled tracks, artist first", () => {
    const titles = youtubeConfig.manualTracks.map((track) => track.title);
    for (const title of [
      "Baby Chris: Dark Side (Flea Remix)",
      "Who Watches The Bassline: A Untitled",
      "Movin' Souls Feat. Daddy Freddy: Non Stop Juggelin'",
      "Positiver: Pleasant Point [NUTS006]",
    ]) {
      expect(titles).toContain(title);
    }
  });
});
