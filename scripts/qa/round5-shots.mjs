// ============================================================================
// ROUND 5 VISUAL GATE: every Duo target plus 1440 x 900 and 390 x 844,
// light and dark, for production (before) or a preview (after).
// ============================================================================
// Usage:
//   node scripts/qa/round5-shots.mjs <baseUrl> --out=<dir> [--routes=/a,/b]
//        [--only=<view substring>] [--states] [--axe]
//
// Views (CSS px, from ~/screenshots/round-5/duo-viewports.md):
//   duo-outer-portrait 382x618, duo-outer-landscape 594x406,
//   duo-inner-portrait 669x902, duo-inner-landscape 951x620,
//   duo-laptop 951x620 (horizontal fold, posture folded),
//   duo-book 669x902 (vertical fold, posture folded), duo-split 385x609,
//   desktop 1440x900, iphone 390x844.
// The fold is emulated over CDP (setDevicePostureOverride plus
// setDisplayFeaturesOverride, with the displayFeature field of
// setDeviceMetricsOverride as the fallback). Pose shots are the viewport;
// every other static route is a full-page shot after a full scroll.
//
// Writes <out>/<view>-<theme>/<route>.png, <out>/report.json and
// <out>/sheets/<route>.png (contact sheet of every view for one route).
// ============================================================================

import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { VIEWS } from "./views.mjs";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "http://localhost:3200").replace(/\/$/, "");
const opt = (k) => (args.find((a) => a.startsWith(`--${k}=`)) || "").slice(k.length + 3);
const OUT = opt("out") || path.resolve("qa-out");
const ONLY = opt("only");
const AXE = args.includes("--axe");
const STATES = args.includes("--states");
const ROUTES = (opt("routes") || "/,/about,/work,/contact,/now,/writing,/recipes,/recipes/city-loaf-master-recipe,/privacy,/card")
  .split(",")
  .filter(Boolean);


// App states on the home screen (PR 15 only): ?open=<app>
const APP_STATES = ["work", "health", "recipes", "turntable", "about", "contact", "food-room", "hobbies"];

async function fold(session, v) {
  const horizontal = v.fold === "horizontal";
  const offset = Math.round((horizontal ? v.height : v.width) / 2 - 12);
  const orientation = horizontal ? { type: "landscapePrimary", angle: 90 } : { type: "portraitPrimary", angle: 0 };
  await session.send("Emulation.setDeviceMetricsOverride", { width: v.width, height: v.height, deviceScaleFactor: 1, mobile: true, screenOrientation: orientation });
  await session.send("Emulation.setDevicePostureOverride", { posture: { type: "folded" } }).catch(() => {});
  await session.send("Emulation.setDisplayFeaturesOverride", { features: [{ orientation: v.fold, offset, maskLength: 24 }] }).catch(() => {});
  return { offset, orientation };
}

async function foldFallback(session, v, f) {
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: v.width,
    height: v.height,
    deviceScaleFactor: 1,
    mobile: true,
    screenOrientation: f.orientation,
    displayFeature: { orientation: v.fold, offset: f.offset, maskLength: 24 },
    devicePosture: { type: "folded" },
  });
}

const segCount = (page) => page.evaluate(() => (window.viewport && window.viewport.segments ? window.viewport.segments.length : 1));

async function checks(page) {
  return page.evaluate(() => {
    const out = {};
    const de = document.documentElement;
    out.horizontalOverflow = de.scrollWidth > de.clientWidth + 1;
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
    };
    const small = [];
    const invisible = [];
    const ellipsis = [];
    const underFold = [];
    const segs = window.viewport && window.viewport.segments ? window.viewport.segments : null;
    let foldRect = null;
    if (segs && segs.length === 2) {
      const [a, b] = segs;
      foldRect = a.width === b.width && a.y !== b.y
        ? { x0: 0, x1: innerWidth, y0: a.y + a.height, y1: b.y }
        : { x0: a.x + a.width, x1: b.x, y0: 0, y1: innerHeight };
    }
    for (const el of document.querySelectorAll("body *")) {
      if (!(el instanceof HTMLElement) || el.closest("iframe,svg,[aria-hidden='true'],.sr-only,script,style,noscript")) continue;
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!hasText || !visible(el)) continue;
      const cs = getComputedStyle(el);
      let op = 1;
      for (let p = el; p; p = p.parentElement) op *= Number(getComputedStyle(p).opacity);
      const label = el.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
      if (op < 0.05) invisible.push(label);
      const fs = parseFloat(cs.fontSize);
      if (fs < 13 && !el.closest("[data-allow-small]")) small.push(`${fs}px: ${label}`);
      if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) ellipsis.push(label);
      if (foldRect) {
        const r = el.getBoundingClientRect();
        const hit = r.right > foldRect.x0 && r.left < foldRect.x1 && r.bottom > foldRect.y0 && r.top < foldRect.y1;
        // Scrolled out of a pane that ends at the fold: clipped, not under it.
        let clipped = false;
        for (let p = el.parentElement; p && !clipped; p = p.parentElement) {
          const o = getComputedStyle(p);
          if (/(hidden|auto|scroll|clip)/.test(o.overflow + o.overflowX + o.overflowY)) {
            const pr = p.getBoundingClientRect();
            const paneHits = pr.right > foldRect.x0 && pr.left < foldRect.x1 && pr.bottom > foldRect.y0 && pr.top < foldRect.y1;
            if (!paneHits) clipped = true;
          }
        }
        if (hit && !clipped) underFold.push(label);
      }
    }
    out.smallText = small.slice(0, 12);
    out.smallTextCount = small.length;
    out.invisibleText = invisible.slice(0, 8);
    out.ellipsis = ellipsis.slice(0, 8);
    out.underFold = underFold.slice(0, 8);
    out.segments = segs ? segs.length : 1;
    const text = document.body.innerText || "";
    out.dashes = (text.match(/.{0,20}[–—].{0,20}/g) || []).slice(0, 5);
    out.badTokens = (text.match(/.{0,20}(&check;|&amp;|\bundefined\b|\bNaN\b|\bnull\b).{0,20}/g) || []).slice(0, 5);
    out.title = document.title;
    out.description = document.querySelector('meta[name="description"]')?.content || "";
    out.ogImage = document.querySelector('meta[property="og:image"]')?.content || "";
    out.canonical = document.querySelector('link[rel="canonical"]')?.href || "";
    out.favicon = !!document.querySelector('link[rel~="icon"]');
    out.analytics = !!document.querySelector('script[src*="/_vercel/insights"],script[src*="va.vercel-scripts"],script[data-sdkn]');
    out.links = [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/") && !h.startsWith("//")))];
    return out;
  });
}

async function newContext(browser, v, theme) {
  const ctx = await browser.newContext({
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: 1,
    colorScheme: theme,
    isMobile: !!v.mobile,
    hasTouch: !!v.mobile || !!v.fold,
  });
  const jwt = process.env.VERCEL_JWT;
  if (jwt) await ctx.addCookies([{ name: "_vercel_jwt", value: jwt, domain: new URL(BASE).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
  // The same storage the site's own theme toggle writes (both generations).
  await ctx.addInitScript((t) => {
    try {
      sessionStorage.setItem("mmck-booted", "1");
      localStorage.setItem("mmck-theme", t);
      localStorage.setItem("mmck-start-here-seen", "1");
      localStorage.setItem("mmck-unlocked", "1");
      localStorage.setItem("mmck-desktop-state", JSON.stringify({ windows: [], nextZIndex: 1, focusedWindowId: null, theme: t, resolvedTheme: t }));
    } catch {}
  }, theme);
  return ctx;
}

const fileName = (name) => (name === "/" ? "home" : name.replace(/^\//, "").replace(/[/?=&]/g, "__"));

async function shot(browser, viewName, v, theme, target, report) {
  const view = `${viewName}-${theme}`;
  if (ONLY && !`${view}/${target.name}`.includes(ONLY)) return;
  const file = path.join(OUT, view, `${fileName(target.name)}.png`);
  const ctx = await newContext(browser, v, theme);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message.slice(0, 160)));
  let session = null;
  let note = "";
  try {
    if (v.fold) {
      session = await ctx.newCDPSession(page);
      const f = await fold(session, v);
      await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
      if ((await segCount(page)) !== 2) {
        await foldFallback(session, v, f);
        note = "displayFeature via setDeviceMetricsOverride";
      } else note = "setDisplayFeaturesOverride";
    }
    const res = await page.goto(BASE + target.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(target.app ? 1800 : 900);
    await page.evaluate(async () => {
      const sc = document.scrollingElement || document.documentElement;
      for (let y = 0; y < sc.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 40));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const result = await checks(page);
    if (AXE && (viewName === "desktop" || viewName === "duo-outer-portrait")) {
      const { default: AxeBuilder } = await import("@axe-core/playwright");
      const axe = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze().catch(() => null);
      result.contrast = axe ? axe.violations.flatMap((x) => x.nodes.map((n) => n.target.join(" ") + " " + (n.any[0]?.message || "").slice(0, 80))).slice(0, 8) : ["axe failed"];
    }
    await mkdir(path.dirname(file), { recursive: true });
    if (session) {
      const { data } = await session.send("Page.captureScreenshot", { format: "png" });
      await writeFile(file, Buffer.from(data, "base64"));
    } else {
      await page.screenshot({ path: file, fullPage: !target.app });
    }
    report.shots.push({ view, viewName, theme, page: target.name, status: res?.status(), file: path.relative(OUT, file), note, errors, ...result });
    const flags = [result.horizontalOverflow && "OVERFLOW", result.dashes.length && "DASH", result.badTokens.length && "TOKEN", result.underFold.length && "FOLD", result.smallTextCount && `SMALL${result.smallTextCount}`, result.contrast?.length && "CONTRAST", errors.length && "PAGEERROR"].filter(Boolean);
    console.log(`${view} ${target.name} ${res?.status()} ${flags.join(" ")}`);
  } catch (e) {
    report.shots.push({ view, viewName, theme, page: target.name, file: null, errors: [String(e.message || e).slice(0, 200)] });
    console.log(`${view} ${target.name} FAILED ${String(e.message || e).slice(0, 120)}`);
  }
  await ctx.close();
  await new Promise((r) => setTimeout(r, 150));
}

async function contactSheets(browser, report) {
  const dir = path.join(OUT, "sheets");
  await mkdir(dir, { recursive: true });
  const pages = [...new Set(report.shots.map((s) => s.page))];
  const ctx = await browser.newContext({ viewport: { width: 1800, height: 1000 } });
  const pg = await ctx.newPage();
  for (const p of pages) {
    const shots = report.shots.filter((s) => s.page === p && s.file);
    const cells = await Promise.all(
      shots.map(async (s) => {
        const b64 = (await readFile(path.join(OUT, s.file))).toString("base64");
        return `<figure><img src="data:image/png;base64,${b64}"><figcaption>${s.view}</figcaption></figure>`;
      }),
    );
    await pg.setContent(`<style>body{margin:8px;font:12px system-ui;background:#888;display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}figure{margin:0;background:#fff;padding:4px}img{display:block;max-width:330px;max-height:640px;object-fit:contain;object-position:top}figcaption{padding-top:2px}</style>${cells.join("")}`);
    await pg.screenshot({ path: path.join(dir, `${fileName(p)}.png`), fullPage: true });
  }
  await ctx.close();
}

const report = { base: BASE, startedAt: new Date().toISOString(), shots: [] };
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const targets = ROUTES.map((r) => ({ name: r, url: r }));
if (STATES) for (const a of APP_STATES) targets.push({ name: `/?open=${a}`, url: `/?open=${a}`, app: true });
const THEMES = opt("theme") ? [opt("theme")] : ["light", "dark"];
for (const theme of THEMES) {
  for (const [viewName, v] of Object.entries(VIEWS)) {
    for (const t of targets) await shot(browser, viewName, v, theme, t, report);
    await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  }
}
await contactSheets(browser, report);
await browser.close();
report.finishedAt = new Date().toISOString();
await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(`${report.shots.length} shots. Report: ${path.join(OUT, "report.json")}`);
