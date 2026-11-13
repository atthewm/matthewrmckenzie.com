// Quick single screenshot for iteration.
// node scripts/qa/shot.mjs <url> <out.png> [width] [height] [light|dark] [fresh|seen] [full]
import { chromium } from "playwright";
const [url, out, w = "1440", h = "900", theme = "light", visit = "seen", full = ""] = process.argv.slice(2);
const mobile = Number(w) < 768;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, colorScheme: theme, isMobile: mobile, hasTouch: mobile });
await ctx.addInitScript(([t, v]) => {
  try {
    sessionStorage.setItem("mmck-booted", "1");
    localStorage.setItem("mmck-theme", t);
    if (v === "seen") { localStorage.setItem("mmck-start-here-seen", "1"); localStorage.setItem("mmck-unlocked", "1"); }
  } catch {}
}, [theme, visit]);
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: !!full });
await b.close();
