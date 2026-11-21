import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, test } from "vitest";

const script = fileURLToPath(new URL("./stage-background-videos.mjs", import.meta.url));
let directory;
afterEach(() => {
  if (directory) rmSync(directory, { recursive: true, force: true });
});

function build(vercel) {
  execFileSync(process.execPath, [script], {
    cwd: directory,
    env: { ...process.env, VERCEL_BACKGROUND_BUILD: vercel ? "1" : "" },
  });
}

test("only Vercel stages the video originals outside public; local builds restore them", () => {
  directory = mkdtempSync(join(tmpdir(), "personal-media-"));
  const video = join(directory, "public/backgrounds/video/theme.webm");
  const poster = join(directory, "public/backgrounds/img/theme-poster.jpg");
  for (const file of [video, poster]) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, "test-media");
  }
  build(false);
  expect(existsSync(video)).toBe(true);
  build(true);
  build(true);
  expect(existsSync(video)).toBe(false);
  expect(readFileSync(poster, "utf8")).toBe("test-media");
  build(false);
  expect(readFileSync(video, "utf8")).toBe("test-media");
});
