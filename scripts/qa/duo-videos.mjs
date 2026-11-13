// ============================================================================
// DUO TOURS: laptop pose (951 x 620, horizontal fold) and book pose
// (669 x 902, vertical fold), recorded with Playwright against a local build.
// ============================================================================
// Usage: node scripts/qa/duo-videos.mjs [baseUrl] --out=<dir>
// Writes duo-laptop-tour.webm and duo-book-tour.webm (convert with ffmpeg).
// The fold is emulated with the displayFeature and devicePosture fields of
// Emulation.setDeviceMetricsOverride, as in round5-shots.mjs.
// ============================================================================

import { chromium } from "playwright";
import { mkdir, rename } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "http://localhost:3200").replace(/\/$/, "");
const OUT = (args.find((a) => a.startsWith("--out=")) || "--out=videos").slice(6);
const wait = (p, ms) => p.waitForTimeout(ms);

const POSES = {
  laptop: { width: 951, height: 620, orientation: "horizontal", screen: { type: "landscapePrimary", angle: 90 } },
  book: { width: 669, height: 902, orientation: "vertical", screen: { type: "portraitPrimary", angle: 0 } },
};

// Each stop: a section of the desktop app (?open=) or a reading page.
const STOPS = [
  { url: "/", hold: 3500 },
  { url: "/?open=turntable", hold: 3000, play: true },
  { url: "/?open=city-loaf-master-recipe", hold: 3000, next: true },
  { url: "/?open=about", hold: 3500 },
  { url: "/?open=work", hold: 3500 },
  { url: "/?open=health", hold: 3500 },
  { url: "/?open=chess", hold: 3000 },
  { url: "/?open=food-room", hold: 3500 },
  { url: "/about", hold: 3500, scroll: true },
  { url: "/recipes/city-loaf-master-recipe", hold: 3500, scroll: true },
];

async function tour(browser, name, pose, theme) {
  const size = { width: pose.width, height: pose.height };
  const ctx = await browser.newContext({ viewport: size, recordVideo: { dir: OUT, size }, colorScheme: theme, hasTouch: true });
  await ctx.addInitScript((t) => {
    sessionStorage.setItem("mmck-booted", "1");
    localStorage.setItem("mmck-start-here-seen", "1");
    localStorage.setItem("mmck-unlocked", "1");
    localStorage.setItem("mmck-theme", t);
  }, theme);
  const page = await ctx.newPage();
  const s = await ctx.newCDPSession(page);
  const offset = Math.round((pose.orientation === "horizontal" ? pose.height : pose.width) / 2 - 12);
  await s.send("Emulation.setDeviceMetricsOverride", {
    width: pose.width,
    height: pose.height,
    deviceScaleFactor: 1,
    mobile: true,
    screenOrientation: pose.screen,
    displayFeature: { orientation: pose.orientation, offset, maskLength: 24 },
    devicePosture: { type: "folded" },
  });
  for (const stop of STOPS) {
    await page.goto(BASE + stop.url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    await wait(page, 1200);
    if (stop.play) {
      await page.getByRole("button", { name: /Put on|Play/ }).first().click({ timeout: 3000 }).catch(() => {});
    }
    if (stop.next) {
      await wait(page, 1200);
      await page.getByRole("button", { name: /Next step/ }).first().click({ timeout: 3000 }).catch(() => {});
    }
    if (stop.scroll) {
      await wait(page, 1000);
      await page.evaluate(async () => {
        const main = document.querySelector(".doc-main-pane > main") || document.scrollingElement;
        for (let i = 0; i < 12; i++) {
          main.scrollBy({ top: 40 });
          await new Promise((r) => setTimeout(r, 60));
        }
      });
    }
    await wait(page, stop.hold);
  }
  const video = page.video();
  await ctx.close();
  await rename(await video.path(), path.join(OUT, name));
  console.log("wrote", name);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
await tour(browser, "duo-laptop-tour.webm", POSES.laptop, "light");
await tour(browser, "duo-book-tour.webm", POSES.book, "dark");
await browser.close();
