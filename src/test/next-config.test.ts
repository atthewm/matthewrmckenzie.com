import { describe, expect, test } from "vitest";
import nextConfig from "../../next.config";

describe("next.config redirects", () => {
  test("sends each retired URL to its new home in one permanent hop", async () => {
    const redirects = await nextConfig.redirects?.();
    const byPath = Object.fromEntries((redirects ?? []).map((r) => [r.source, r]));

    const expected: Record<string, string> = {
      "/health": "/",
      "/kitchen": "/",
      "/food-room": "/",
      "/desktop": "/",
      "/hobbies": "/about",
      "/projects": "/work",
    };

    expect(Object.keys(byPath).sort()).toEqual(Object.keys(expected).sort());
    for (const [source, destination] of Object.entries(expected)) {
      expect(byPath[source].destination, source).toBe(destination);
      // permanent: true is what makes Next answer 308 instead of 307.
      expect((byPath[source] as { permanent?: boolean }).permanent, source).toBe(true);
    }
  });

  test("never redirects to another redirect", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const sources = new Set(redirects.map((r) => r.source));
    for (const r of redirects) expect(sources.has(r.destination), r.source).toBe(false);
  });
});
