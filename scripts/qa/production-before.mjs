// Production "before" shots for the McKenzie OS remaster PR.
// Usage: node scripts/qa/production-before.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "https://matthewrmckenzie.com";
const OUT = path.join(homedir(), "screenshots/round-4/matthewrmckenzie.com/production");
const ROUTES = ["/", "/about", "/work", "/recipes", "/recipes/city-loaf-master-recipe", "/contact", "/now", "/writing", "/card", "/privacy", "/health", "/kitchen", "/hobbies", "/food-room"];
const VIEWS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "phone-390", width: 390, height: 844, mobile: true },
];
const THEMES = ["light", "dark"];

const browser = await chromium.launch();
for (const view of VIEWS) {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 1,
      colorScheme: theme,
      isMobile: !!view.mobile,
      hasTouch: !!view.mobile,
    });
    await ctx.addInitScript((t) => {
      try {
        sessionStorage.setItem("mmck-booted", "1");
        localStorage.setItem("mmck-desktop-state", JSON.stringify({ windows: [], nextZIndex: 1, focusedWindowId: null, theme: t, resolvedTheme: t }));
      } catch {}
    }, theme);
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      const res = await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => null);
      await page.waitForTimeout(1500);
      const file = path.join(OUT, `${view.name}-${theme}`, (route === "/" ? "home" : route.slice(1).replace(/\//g, "__")) + ".png");
      await mkdir(path.dirname(file), { recursive: true });
      await page.screenshot({ path: file, fullPage: route !== "/" });
      console.log(res?.status(), view.name, theme, route);
    }
    await ctx.close();
  }
}
await browser.close();
