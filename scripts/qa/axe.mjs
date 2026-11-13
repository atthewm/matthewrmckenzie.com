// ============================================================================
// AXE: accessibility on every static page, light and dark, 1440 and 390
// ============================================================================
// Usage: node scripts/qa/axe.mjs [baseUrl] [--out=<file>]
// Fails (exit 1) on any serious or critical violation.
// ============================================================================

import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";

const args = process.argv.slice(2);
const BASE = (args.find((a) => !a.startsWith("--")) || "http://localhost:3200").replace(/\/$/, "");
const OUT = (args.find((a) => a.startsWith("--out=")) || "--out=axe-report.json").slice(6);
const BYPASS = process.env.VERCEL_BYPASS || "";
const PAGES = ["/about", "/work", "/health", "/kitchen", "/recipes", "/recipes/city-loaf-master-recipe", "/hobbies", "/contact", "/now", "/writing", "/food-room", "/card", "/privacy"];
const VIEWS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "iphone", width: 390, height: 844 },
];


// Protected Vercel previews: set VERCEL_JWT to the _vercel_jwt cookie from a
// share link (see the Vercel share URL), and it is added to every context.
async function authorize(ctx, base) {
  const jwt = process.env.VERCEL_JWT;
  if (!jwt) return;
  await ctx.addCookies([{ name: "_vercel_jwt", value: jwt, domain: new URL(base).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
}

const browser = await chromium.launch();
const results = [];
let blocking = 0;
for (const theme of ["light", "dark"]) {
  for (const v of VIEWS) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      colorScheme: theme,
      extraHTTPHeaders: BYPASS ? { "x-vercel-protection-bypass": BYPASS, "x-vercel-set-bypass-cookie": "true" } : undefined,
    });
    await authorize(ctx, BASE);
    await ctx.addInitScript((t) => localStorage.setItem("mmck-theme", t), theme);
    const page = await ctx.newPage();
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const r = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        // Third-party embeds (Cal.com, Apple Music) are not ours to fix.
        .exclude("iframe")
        .analyze();
      const serious = r.violations.filter((x) => x.impact === "serious" || x.impact === "critical");
      blocking += serious.length;
      results.push({
        theme,
        view: v.name,
        path,
        serious: serious.map((x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.slice(0, 5).map((n) => n.target.join(" ")) })),
        other: r.violations.filter((x) => !serious.includes(x)).map((x) => ({ id: x.id, impact: x.impact })),
        incomplete: r.incomplete.length,
      });
      console.log(`${theme} ${v.name} ${path}: ${serious.length} serious or critical, ${r.violations.length - serious.length} other`);
    }
    await ctx.close();
  }
}
await browser.close();
await writeFile(OUT, JSON.stringify({ base: BASE, at: new Date().toISOString(), blocking, results }, null, 2));
console.log(`\nSerious or critical violations: ${blocking}. Report: ${OUT}`);
process.exit(blocking > 0 ? 1 : 0);
