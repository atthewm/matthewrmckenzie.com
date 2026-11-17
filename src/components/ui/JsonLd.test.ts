import { afterEach, describe, expect, test, vi } from "vitest";
import { personSchema, profilePageSchema, websiteSchema } from "./JsonLd";

afterEach(() => {
  vi.useRealTimers();
  vi.resetModules();
});

describe("structured data", () => {
  test("Person lists capital formation topics only", () => {
    expect(personSchema.knowsAbout).toEqual([
      "Capital Formation",
      "Private Wealth",
      "Investor Relations",
      "Family Offices",
      "Registered Investment Advisors",
      "Real Estate Investment",
      "Alternative Investments",
    ]);
  });

  test("Person keeps its alumniOf entries untouched", () => {
    expect(personSchema.alumniOf.map((school) => school.name)).toEqual([
      "Southern Methodist University",
      "Villanova University",
    ]);
  });

  test("WebSite describes the site by the owner's role at Menlo Equities", () => {
    expect(websiteSchema.description).toBe(
      "Personal site of Matthew McKenzie, Senior Vice President, Capital Formation at Menlo Equities."
    );
  });

  test("ProfilePage describes the Menlo role and nothing on the side", () => {
    const description = profilePageSchema.mainEntity.description;
    expect(description).toContain("Menlo Equities");
    expect(description).not.toMatch(/\bAI\b|MCP|agents?|tooling/i);
  });

  test("ProfilePage dateModified is the day of the build, not a fixed string", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-02-03T15:00:00Z"));
    vi.resetModules();
    const built = await import("./JsonLd");
    expect(built.profilePageSchema.dateModified).toBe("2027-02-03");
    expect(built.profilePageSchema.dateCreated).toBe("2026-01-01");
  });
});
