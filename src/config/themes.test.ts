import { afterEach, describe, expect, test, vi } from "vitest";
import fs from "fs";
import path from "path";
import { resolveBackgroundsBase } from "./themes";

async function loadThemes(baseUrl: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_BACKGROUNDS_BASE_URL", baseUrl);
  return import("./themes");
}

const mediaKeys = ["videoWebm", "videoMp4", "poster", "mobilePoster"] as const;

afterEach(() => {
  vi.resetModules();
});

describe("resolveBackgroundsBase", () => {
  test("uses the local copies while the variable is unset or blank", () => {
    expect(resolveBackgroundsBase(undefined)).toBe("/backgrounds");
    expect(resolveBackgroundsBase("")).toBe("/backgrounds");
    expect(resolveBackgroundsBase("   ")).toBe("/backgrounds");
  });

  test("accepts an https URL and drops trailing slashes", () => {
    expect(resolveBackgroundsBase("https://media.example.com/backgrounds")).toBe("https://media.example.com/backgrounds");
    expect(resolveBackgroundsBase(" https://media.example.com/backgrounds// ")).toBe("https://media.example.com/backgrounds");
  });

  test("falls back to the local copies for anything that is not https", () => {
    for (const value of ["http://media.example.com/backgrounds", "//media.example.com", "media.example.com", "javascript:alert(1)", "https://"]) {
      expect(resolveBackgroundsBase(value), value).toBe("/backgrounds");
    }
  });
});

describe("zenThemes", () => {
  test("points every video theme at a file that exists in public/ by default", async () => {
    const { zenThemes } = await loadThemes("");
    const videoThemes = zenThemes.filter((t) => t.videoWebm);
    expect(videoThemes.length).toBe(17);
    for (const theme of videoThemes) {
      for (const key of mediaKeys) {
        expect(theme[key], `${theme.id}.${key}`).toMatch(/^\/backgrounds\/(video|img)\//);
        expect(fs.existsSync(path.join(process.cwd(), "public", theme[key])), theme[key]).toBe(true);
      }
    }
  });

  test("ships one WebM and one MP4 fallback per video theme", async () => {
    const { zenThemes } = await loadThemes("");
    for (const theme of zenThemes.filter((t) => t.videoWebm)) {
      expect(theme.videoWebm).toMatch(/\.webm$/);
      expect(theme.videoMp4).toMatch(/\.mp4$/);
    }
  });

  test("moves every path to the remote base when the variable is set", async () => {
    const local = (await loadThemes("")).zenThemes;
    const remote = (await loadThemes("https://media.example.com/backgrounds/")).zenThemes;
    expect(remote.length).toBe(local.length);
    remote.forEach((theme, i) => {
      for (const key of mediaKeys) {
        const expected = local[i][key] ? local[i][key].replace(/^\/backgrounds/, "https://media.example.com/backgrounds") : "";
        expect(theme[key], `${theme.id}.${key}`).toBe(expected);
      }
    });
  });

  test("keeps the two themes without media empty", async () => {
    const { getZenTheme } = await loadThemes("https://media.example.com/backgrounds");
    for (const id of ["default", "night"]) {
      const theme = getZenTheme(id);
      expect(theme, id).toBeDefined();
      for (const key of mediaKeys) expect(theme?.[key], `${id}.${key}`).toBe("");
    }
  });
});
