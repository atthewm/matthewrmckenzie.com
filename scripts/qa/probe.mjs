// Quick look at one state: node scripts/qa/probe.mjs <url> <view> <theme> <out.png> [--full]
// Views as in round5-shots.mjs. Used while fixing; the gate is round5-shots.mjs.
import { chromium } from "playwright";
import { VIEWS_FOR_PROBE } from "./views.mjs";

const [url, view = "desktop", theme = "light", out = "probe.png"] = process.argv.slice(2);
const full = process.argv.includes("--full");
const v = VIEWS_FOR_PROBE[view];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, colorScheme: theme, isMobile: !!v.mobile, hasTouch: !!v.mobile || !!v.fold, deviceScaleFactor: 1 });
const jwt = process.env.VERCEL_JWT;
if (jwt) await ctx.addCookies([{ name: "_vercel_jwt", value: jwt, domain: new URL(url).hostname, path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
await ctx.addInitScript((t) => {
  try {
    sessionStorage.setItem("mmck-booted", "1");
    localStorage.setItem("mmck-theme", t);
    localStorage.setItem("mmck-start-here-seen", "1");
    localStorage.setItem("mmck-unlocked", "1");
  } catch {}
}, theme);
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
let session = null;
if (v.fold) {
  session = await ctx.newCDPSession(page);
  const horizontal = v.fold === "horizontal";
  const offset = Math.round((horizontal ? v.height : v.width) / 2 - 12);
  await session.send("Emulation.setDeviceMetricsOverride", {
    width: v.width,
    height: v.height,
    deviceScaleFactor: 1,
    mobile: true,
    screenOrientation: horizontal ? { type: "landscapePrimary", angle: 90 } : { type: "portraitPrimary", angle: 0 },
    displayFeature: { orientation: v.fold, offset, maskLength: 24 },
    devicePosture: { type: "folded" },
  });
}
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
await page.waitForTimeout(Number(process.env.WAIT || 2200));
if (process.env.EVAL) console.log(await page.evaluate(process.env.EVAL));
if (session) {
  const { data } = await session.send("Page.captureScreenshot", { format: "png" });
  (await import("node:fs")).writeFileSync(out, Buffer.from(data, "base64"));
} else await page.screenshot({ path: out, fullPage: full });
console.log("segments", await page.evaluate(() => (window.viewport?.segments?.length ?? 1)));
await browser.close();
