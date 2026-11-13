// ============================================================================
// LIGHTHOUSE: mobile scores for / and /about
// ============================================================================
// Usage: node scripts/qa/lighthouse.mjs <baseUrl> [--out=<dir>]
// Uses Playwright's Chromium through chrome-launcher. Targets: Performance
// 85 or higher and Accessibility 95 or higher on both pages.
// Set VERCEL_BYPASS to reach a protected Vercel preview.
// ============================================================================

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "http://localhost:3200").replace(/\/$/, "");
const OUT = (args.find((a) => a.startsWith("--out=")) || "--out=lighthouse").slice(6);
const BYPASS = process.env.VERCEL_BYPASS || "";
const RUNS = Number(process.env.LH_RUNS || 3);

await mkdir(OUT, { recursive: true });
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ["--headless=new", "--no-sandbox"] });
// Protected previews: put the share-link cookie in Chrome's jar over CDP and
// keep Lighthouse from clearing it between runs.
async function setPreviewCookie() {
  const jwt = process.env.VERCEL_JWT;
  if (!jwt) return false;
  const { webSocketDebuggerUrl } = await (await fetch(`http://127.0.0.1:${chrome.port}/json/version`)).json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  const done = new Promise((r) => ws.addEventListener("message", r, { once: true }));
  ws.send(JSON.stringify({ id: 1, method: "Storage.setCookies", params: { cookies: [{ name: "_vercel_jwt", value: jwt, domain: new URL(BASE).hostname, path: "/", secure: true, httpOnly: true }] } }));
  await done;
  ws.close();
  return true;
}
const usingCookie = await setPreviewCookie();
const summary = {};
for (const p of (process.env.LH_PATHS || "/,/about").split(",")) {
  const scores = [];
  for (let i = 0; i < RUNS; i++) {
    const res = await lighthouse(BASE + p, {
      port: chrome.port,
      output: "html",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      formFactor: "mobile",
      screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
      extraHeaders: BYPASS ? { "x-vercel-protection-bypass": BYPASS } : undefined,
      disableStorageReset: usingCookie,
    });
    if (!res.lhr.finalDisplayedUrl.startsWith(BASE)) throw new Error(`Landed on ${res.lhr.finalDisplayedUrl}, not the page under test`);
    const c = res.lhr.categories;
    const row = {
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      bestPractices: Math.round(c["best-practices"].score * 100),
      seo: Math.round(c.seo.score * 100),
      lcp: res.lhr.audits["largest-contentful-paint"].displayValue,
      tbt: res.lhr.audits["total-blocking-time"].displayValue,
      cls: res.lhr.audits["cumulative-layout-shift"].displayValue,
    };
    scores.push(row);
    await writeFile(path.join(OUT, `${p === "/" ? "home" : p.slice(1)}-run${i + 1}.html`), res.report);
    console.log(p, `run ${i + 1}`, JSON.stringify(row));
  }
  const median = (k) => scores.map((s) => s[k]).sort((a, b) => a - b)[Math.floor(scores.length / 2)];
  summary[p] = { performance: median("performance"), accessibility: median("accessibility"), bestPractices: median("bestPractices"), seo: median("seo"), runs: scores };
}
await chrome.kill();
await writeFile(path.join(OUT, "summary.json"), JSON.stringify({ base: BASE, at: new Date().toISOString(), summary }, null, 2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(summary).map(([k, v]) => [k, { performance: v.performance, accessibility: v.accessibility }]))));
