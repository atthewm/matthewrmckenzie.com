// ============================================================================
// QA VIDEOS
// ============================================================================
// Usage: node scripts/qa/videos.mjs [baseUrl] [--out=<dir>]
//   desktop-tour.webm  1440 x 900, about 75 s: page load, a window zooming
//     out of an icon, dragging it, Genie into the dock, dock magnification,
//     Exposé, the theme switching light to dark, the Turntable spinning up.
//   duo-laptop.webm    951 x 620 in the Duo laptop pose (CDP fold), about
//     40 s: the record on top with the playlist below, then the desktop on
//     top with the dock, switcher and trackpad below.
// ============================================================================

import { chromium } from "playwright";
import { mkdir, rename, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "http://localhost:3200").replace(/\/$/, "");
const OUT = (args.find((a) => a.startsWith("--out=")) || "").slice(6) || path.join(homedir(), "screenshots/round-4/matthewrmckenzie.com/design-mckenzie-os-remastered/videos");
const BYPASS = process.env.VERCEL_BYPASS || "";
const headers = BYPASS ? { "x-vercel-protection-bypass": BYPASS, "x-vercel-set-bypass-cookie": "true" } : undefined;
const wait = (p, ms) => p.waitForTimeout(ms);

async function glide(page, from, to, steps = 40) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.move(to.x, to.y, { steps });
}

async function center(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function saveVideo(page, ctx, name) {
  const v = page.video();
  await ctx.close();
  const src = await v.path();
  await rename(src, path.join(OUT, name));
}


// Protected Vercel previews: set VERCEL_JWT to the _vercel_jwt cookie from a
// share link (see the Vercel share URL), and it is added to every context.
async function authorize(ctx, base) {
  const jwt = process.env.VERCEL_JWT;
  if (!jwt) return;
  await ctx.addCookies([{ name: "_vercel_jwt", value: jwt, domain: new URL(base).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

// ---------------------------------------------------------------- desktop
{
  const size = { width: 1440, height: 900 };
  const ctx = await browser.newContext({ viewport: size, recordVideo: { dir: OUT, size }, colorScheme: "light", extraHTTPHeaders: headers });
  await authorize(ctx, BASE);
  await ctx.addInitScript(() => {
    if (!localStorage.getItem("mmck-theme")) localStorage.setItem("mmck-theme", "light");
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await wait(page, 6000); // boot chime screen, then Start Here opens on first visit
  await wait(page, 3000);
  // Close Start Here: it zooms back.
  await page.locator('[data-window-id="start-here"] [aria-label="Close window"]').click().catch(() => {});
  await wait(page, 2000);
  // Open Now from its desktop icon: the window zooms out of the icon.
  const now = await center(page, '.desktop-icon[aria-label="Open Now"]');
  await glide(page, { x: 700, y: 450 }, now, 30);
  await page.mouse.dblclick(now.x, now.y);
  await wait(page, 2500);
  // Drag it by the title bar.
  const bar = await center(page, '[data-window-id="now"] .window-titlebar');
  await page.mouse.move(bar.x, bar.y);
  await page.mouse.down();
  await page.mouse.move(bar.x - 260, bar.y + 120, { steps: 50 });
  await page.mouse.move(bar.x - 160, bar.y + 60, { steps: 40 });
  await page.mouse.up();
  await wait(page, 1500);
  // Open About from the dock: bounce and zoom out of the dock item.
  const aboutDock = await center(page, '[data-dock-id="about"]');
  await glide(page, { x: bar.x, y: bar.y }, aboutDock, 40);
  await page.mouse.click(aboutDock.x, aboutDock.y);
  await wait(page, 2500);
  // Genie: minimize About into its dock item, then restore it.
  const min = await center(page, '[data-window-id="about"] [aria-label="Minimize window"]');
  await glide(page, aboutDock, min, 30);
  await page.mouse.click(min.x, min.y);
  await wait(page, 2200);
  await glide(page, min, aboutDock, 30);
  await page.mouse.click(aboutDock.x, aboutDock.y);
  await wait(page, 2200);
  // Dock magnification: sweep along the dock and back.
  const dock = await page.locator(".dock-shelf").boundingBox();
  const y = dock.y + dock.height / 2;
  await glide(page, { x: dock.x + 20, y }, { x: dock.x + dock.width - 20, y }, 120);
  await glide(page, { x: dock.x + dock.width - 20, y }, { x: dock.x + 20, y }, 120);
  await wait(page, 800);
  // Open the Turntable and Work too, then Exposé.
  await page.locator('[data-dock-id="turntable"]').click();
  await wait(page, 2000);
  await page.locator('[data-dock-id="work"]').click();
  await wait(page, 2500);
  await page.mouse.move(720, 450);
  await page.keyboard.press("F9");
  await wait(page, 3500);
  await page.keyboard.press("Escape");
  await wait(page, 2500);
  // Theme: Light to Dark from the menu bar.
  const dark = await center(page, '[role="radiogroup"][aria-label="Appearance"] >> text=Dark');
  await glide(page, { x: 720, y: 450 }, dark, 40);
  await page.mouse.click(dark.x, dark.y);
  await wait(page, 3500);
  // Bring the Turntable forward and put a record on: it spins up.
  await page.locator('[data-dock-id="turntable"]').click();
  await wait(page, 1500);
  await page.getByRole("button", { name: /Put on/ }).first().click();
  await wait(page, 9000);
  await page.locator('[aria-label="Next playlist"]').first().click();
  await wait(page, 5000);
  await saveVideo(page, ctx, "desktop-tour.webm");
}

// ---------------------------------------------------------------- Duo laptop
{
  const size = { width: 951, height: 620 };
  const ctx = await browser.newContext({ viewport: size, recordVideo: { dir: OUT, size }, colorScheme: "light", extraHTTPHeaders: headers });
  await authorize(ctx, BASE);
  await ctx.addInitScript(() => {
    sessionStorage.setItem("mmck-booted", "1");
    localStorage.setItem("mmck-start-here-seen", "1");
    localStorage.setItem("mmck-theme", "light");
  });
  const page = await ctx.newPage();
  const s = await ctx.newCDPSession(page);
  await s.send("Emulation.setDeviceMetricsOverride", {
    width: size.width,
    height: size.height,
    deviceScaleFactor: 1,
    mobile: true,
    screenOrientation: { type: "landscapePrimary", angle: 90 },
    displayFeature: { orientation: "horizontal", offset: 298, maskLength: 24 },
    devicePosture: { type: "folded" },
  });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await wait(page, 3000);
  const segs = await page.evaluate(() => window.viewport?.segments?.length ?? 1);
  if (segs !== 2) await page.goto(BASE + "/?duo=1", { waitUntil: "domcontentloaded" });
  await wait(page, 2000);
  await page.locator('[data-dock-id="turntable"]').click();
  await wait(page, 2000);
  await page.getByRole("button", { name: /Put on/ }).first().click();
  await wait(page, 9000);
  await page.locator('[aria-label="Next playlist"]').first().click();
  await wait(page, 4000);
  await page.getByRole("button", { name: /Desktop/ }).first().click();
  await wait(page, 3000);
  // Trackpad: slide the pointer across the top screen.
  const pad = await page.locator(".duo-trackpad").boundingBox();
  if (pad) {
    await page.mouse.move(pad.x + 60, pad.y + 40);
    await page.mouse.down();
    await page.mouse.move(pad.x + pad.width - 80, pad.y + 30, { steps: 60 });
    await page.mouse.move(pad.x + pad.width / 2, pad.y + pad.height - 30, { steps: 60 });
    await page.mouse.up();
  }
  await wait(page, 3000);
  await page.locator('[data-dock-id="work"]').click();
  await wait(page, 4000);
  await page.getByRole("button", { name: /Desktop/ }).first().click();
  await wait(page, 4000);
  await saveVideo(page, ctx, "duo-laptop.webm");
}

await browser.close();
console.log((await readdir(OUT)).join("\n"));
