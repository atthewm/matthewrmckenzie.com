// Contact sheet of PNGs: node scripts/qa/sheet.mjs out.png a.png b.png ...
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import path from "node:path";
const [out, ...files] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 900 } });
const cells = files.map((f) => `<figure><img src="data:image/png;base64,${readFileSync(f).toString("base64")}"><figcaption>${path.basename(f)}</figcaption></figure>`);
await p.setContent(`<style>body{margin:6px;background:#777;display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start;font:12px system-ui}figure{margin:0;background:#fff;padding:3px}img{display:block;max-height:${process.env.H || 700}px;max-width:${process.env.W || 960}px}</style>${cells.join("")}`);
await p.screenshot({ path: out, fullPage: true });
await b.close();
