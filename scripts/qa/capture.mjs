// ============================================================================
// QA CAPTURE: every route and state, every size, both themes
// ============================================================================
// Usage:
//   node scripts/qa/capture.mjs [baseUrl] [--only=<view substring>] [--out=<dir>]
// Defaults: baseUrl http://localhost:3200, out
//   ~/screenshots/round-4/matthewrmckenzie.com/design-mckenzie-os-remastered
//
// Writes <out>/<view>/<path>.png and <out>/report.json with per-shot checks:
//   horizontal overflow, text cut off with an ellipsis, em or en dashes in
//   visible text, visible text under 12 px, stuck "Loading" text, and
//   duplicate icons among the visible desktop, dock and springboard icons.
//
// Duo laptop pose: the fold is emulated over CDP. Checked against the
// DevTools protocol (Emulation domain, Nov 2026): setDevicePostureOverride
// ({posture:{type:"folded"}}) and setDisplayFeaturesOverride({features:[{
// orientation:"horizontal", offset, maskLength}]}). In this Chromium build
// setDisplayFeaturesOverride alone does not produce viewport segments, so
// the script falls back to the displayFeature and devicePosture fields of
// Emulation.setDeviceMetricsOverride, which do. Playwright's own screenshot
// call re-applies its viewport and drops the override, so Duo shots use
// CDP Page.captureScreenshot. If two segments still do not appear, the
// script uses ?duo=1 and records that in the report.
// ============================================================================

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "http://localhost:3200").replace(/\/$/, "");
const ONLY = (args.find((a) => a.startsWith("--only=")) || "").slice(7);
const OUT =
  (args.find((a) => a.startsWith("--out=")) || "").slice(6) ||
  path.join(homedir(), "screenshots/round-4/matthewrmckenzie.com/design-mckenzie-os-remastered");
const BYPASS = process.env.VERCEL_BYPASS || "";
const SKIP_EXISTING = args.includes("--skip-existing");

const STATIC = ["/about", "/work", "/health", "/kitchen", "/recipes", "/recipes/city-loaf-master-recipe", "/hobbies", "/contact", "/now", "/writing", "/food-room", "/card", "/privacy"];

const SIZES = {
  desktop: { width: 1440, height: 900 },
  iphone: { width: 390, height: 844, mobile: true },
  "duo-outer": { width: 382, height: 618, mobile: true },
  "duo-inner": { width: 669, height: 902, mobile: true },
  "duo-laptop": { width: 951, height: 620, mobile: true, fold: true },
};

// Desktop states (1440 and the Duo laptop pose)
const DESKTOP_STATES = [
  { name: "home-start-here", fresh: true },
  { name: "work-board", open: "work" },
  { name: "health-board", open: "health" },
  { name: "cooking-board", open: "recipes" },
  { name: "turntable-playing", open: "turntable", play: true },
  { name: "expose", open: "about", expose: ["work", "turntable"] },
];
// Phone states (390, Duo outer and inner portrait)
const PHONE_STATES = [
  { name: "springboard" },
  { name: "lock-screen", fresh: true },
  { name: "app-work", open: "work" },
  { name: "app-health", open: "health" },
  { name: "app-recipes", open: "recipes" },
  { name: "app-recipe", open: "city-loaf-master-recipe" },
  { name: "app-food-room", open: "food-room" },
  { name: "app-turntable", open: "turntable", play: true },
  { name: "app-contact", open: "contact" },
];


// Protected Vercel previews: set VERCEL_JWT to the _vercel_jwt cookie from a
// share link (see the Vercel share URL), and it is added to every context.
async function authorize(ctx, base) {
  const jwt = process.env.VERCEL_JWT;
  if (!jwt) return;
  await ctx.addCookies([{ name: "_vercel_jwt", value: jwt, domain: new URL(base).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
}

const report = { base: BASE, startedAt: new Date().toISOString(), duoMethod: null, shots: [] };

function fileFor(view, name) {
  return path.join(OUT, view, `${name.replace(/^\//, "").replace(/\//g, "__") || "home"}.png`);
}

async function foldViaCdp(session, size) {
  const offset = Math.round(size.height / 2 - 12);
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: size.width,
    height: size.height,
    deviceScaleFactor: 1,
    mobile: true,
    screenOrientation: { type: "landscapePrimary", angle: 90 },
  });
  await session.send("Emulation.setDevicePostureOverride", { posture: { type: "folded" } }).catch(() => {});
  await session.send("Emulation.setDisplayFeaturesOverride", { features: [{ orientation: "horizontal", offset, maskLength: 24 }] }).catch(() => {});
  return offset;
}

async function foldFallback(session, size, offset) {
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: size.width,
    height: size.height,
    deviceScaleFactor: 1,
    mobile: true,
    screenOrientation: { type: "landscapePrimary", angle: 90 },
    displayFeature: { orientation: "horizontal", offset, maskLength: 24 },
    devicePosture: { type: "folded" },
  });
}

async function segmentCount(page) {
  return page.evaluate(() => (window.viewport && window.viewport.segments ? window.viewport.segments.length : 1));
}

async function checks(page, viewName) {
  return page.evaluate((view) => {
    const out = {};
    const de = document.documentElement;
    out.horizontalOverflow = de.scrollWidth > de.clientWidth + 1;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05;
    };
    const ellipsis = [];
    const small = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!(el instanceof HTMLElement) || el.closest("iframe,svg,[aria-hidden='true'],.sr-only,script,style")) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!hasText || !visible(el) || el.closest("[data-window-id]") && document.querySelector(".expose-on")) continue;
      const cs = getComputedStyle(el);
      if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) ellipsis.push(el.textContent.trim().slice(0, 50));
      const fs = parseFloat(cs.fontSize);
      if (fs < 11.5) small.push(`${fs}px: ${el.textContent.trim().slice(0, 40)}`);
    }
    out.ellipsis = ellipsis.slice(0, 10);
    out.smallText = small.slice(0, 10);
    const text = document.body.innerText || "";
    out.dashes = (text.match(/.{0,20}[–—].{0,20}/g) || []).slice(0, 5);
    out.stuckLoading = /Loading[^\n]{0,30}/.test(text) ? (text.match(/Loading[^\n]{0,30}/g) || []).slice(0, 3) : [];
    // The same item may sit on the desktop and in the dock; count per surface.
    const perSurface = (sel) => {
      const ks = [...document.querySelectorAll(`${sel} [data-icon]`)].filter((e) => visible(e)).map((e) => e.getAttribute("data-icon"));
      return ks.filter((k, i) => ks.indexOf(k) !== i);
    };
    const desk = [...document.querySelectorAll(".desktop-icon [data-icon]")].filter((e) => visible(e)).map((e) => e.getAttribute("data-icon"));
    out.duplicateIcons = [...perSurface(".dock-shelf"), ...desk.filter((k, i) => desk.indexOf(k) !== i), ...perSurface(".springboard .sb-pager"), ...perSurface(".sb-dock")];
    out.view = view;
    return out;
  }, viewName);
}

async function newContext(browser, size, theme, fresh) {
  const ctx = await browser.newContext({
    viewport: { width: size.width, height: size.height },
    deviceScaleFactor: 1,
    colorScheme: theme,
    isMobile: !!size.mobile && !size.fold,
    hasTouch: !!size.mobile,
    extraHTTPHeaders: BYPASS ? { "x-vercel-protection-bypass": BYPASS, "x-vercel-set-bypass-cookie": "true" } : undefined,
  });
  await authorize(ctx, BASE);
  await ctx.addInitScript(
    ([t, f]) => {
      try {
        sessionStorage.setItem("mmck-booted", "1");
        localStorage.setItem("mmck-theme", t);
        if (!f) {
          localStorage.setItem("mmck-start-here-seen", "1");
          localStorage.setItem("mmck-unlocked", "1");
        }
      } catch {}
    },
    [theme, !!fresh],
  );
  return ctx;
}

async function settle(page, ms = 1400) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

async function shoot(page, session, file, full) {
  await mkdir(path.dirname(file), { recursive: true });
  if (session) {
    const { data } = await session.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    await writeFile(file, Buffer.from(data, "base64"));
  } else {
    await page.screenshot({ path: file, fullPage: !!full });
  }
}

async function gotoWithRetry(page, url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      return await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    } catch (e) {
      if (i >= tries) throw e;
      await page.waitForTimeout(3000 * i);
    }
  }
}

async function runState(browser, sizeName, size, theme, state, kind) {
  const view = `${sizeName}-${theme}`;
  if (ONLY && !`${view}/${state.name}`.includes(ONLY)) return;
  if (SKIP_EXISTING && existsSync(fileFor(view, state.name))) return;
  try {
    await runStateInner(browser, sizeName, size, theme, state, kind, view);
  } catch (e) {
    report.shots.push({ view, state: state.name, kind, file: null, errors: [String(e.message || e).slice(0, 200)], horizontalOverflow: false, ellipsis: [], smallText: [], dashes: [], stuckLoading: [], duplicateIcons: [] });
    console.log(`${view} ${state.name} FAILED ${String(e.message || e).slice(0, 120)}`);
  }
  await writeFile(path.join(OUT, "report.partial.json"), JSON.stringify(report, null, 2)).catch(() => {});
}

async function runStateInner(browser, sizeName, size, theme, state, kind, view) {
  const ctx = await newContext(browser, size, theme, state.fresh);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  let session = null;
  let note = "";
  if (size.fold) {
    session = await ctx.newCDPSession(page);
    const offset = await foldViaCdp(session, size);
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
    if ((await segmentCount(page)) !== 2) {
      await foldFallback(session, size, offset);
      await page.reload({ waitUntil: "domcontentloaded" });
      note = "displayFeature via setDeviceMetricsOverride";
    } else {
      note = "setDisplayFeaturesOverride";
    }
    if ((await segmentCount(page)) !== 2) {
      await page.goto(`${BASE}/?duo=1`, { waitUntil: "domcontentloaded" });
      note = "?duo=1 fallback";
    }
    report.duoMethod = report.duoMethod || note;
  }
  const url = kind === "static" ? `${BASE}${state.name}` : `${BASE}/${state.open ? `?open=${state.open}` : ""}${size.fold && note === "?duo=1 fallback" ? (state.open ? "&duo=1" : "?duo=1") : ""}`;
  await gotoWithRetry(page, url);
  await settle(page, kind === "static" ? 900 : 1600);

  if (kind !== "static") {
    if (state.expose) {
      for (const id of state.expose) {
        await page.locator(`[data-dock-id="${id}"]`).first().click().catch(() => {});
        await page.waitForTimeout(700);
      }
      await page.keyboard.press("F9");
      await page.waitForTimeout(1200);
    }
    if (state.play) {
      await page.getByRole("button", { name: /Put on/ }).first().click().catch(() => {});
      await page.waitForTimeout(3500);
    }
  } else {
    // Scroll through so lazy content is in its final state, then back up.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
  }
  // Data feeds: give skeletons time to resolve so a stuck Loading shows up.
  await page.waitForTimeout(kind === "static" && /health|food-room/.test(state.name) ? 6000 : 0);

  const file = fileFor(view, kind === "static" ? state.name : state.name);
  const result = await checks(page, view);
  await shoot(page, session, file, kind === "static" && !size.fold);
  report.shots.push({ view, state: state.name, kind, file, errors, note, ...result });
  process.stdout.write(`${view} ${state.name}${result.horizontalOverflow ? " OVERFLOW" : ""}${result.dashes.length ? " DASH" : ""}${result.duplicateIcons.length ? " DUPICON" : ""}${result.ellipsis.length ? " ELLIPSIS" : ""}${errors.length ? " PAGEERROR" : ""}\n`);
  await ctx.close();
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const theme of ["light", "dark"]) {
  for (const [sizeName, size] of Object.entries(SIZES)) {
    const desktopish = sizeName === "desktop" || sizeName === "duo-laptop";
    const states = desktopish ? DESKTOP_STATES : PHONE_STATES;
    for (const st of states) await runState(browser, sizeName, size, theme, st, desktopish ? "desktop" : "phone");
    for (const route of STATIC) await runState(browser, sizeName, size, theme, { name: route }, "static");
  }
}
await browser.close();
report.finishedAt = new Date().toISOString();
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
const bad = report.shots.filter((s) => s.horizontalOverflow || s.dashes.length || s.duplicateIcons.length || s.ellipsis.length || s.errors.length);
console.log(`\n${report.shots.length} shots, ${bad.length} with findings. Duo method: ${report.duoMethod}. Report: ${path.join(OUT, "report.json")}`);
