// ============================================================================
// PR BODY: screenshot tables from a capture report
// ============================================================================
// Usage: node scripts/qa/pr-body.mjs <report.json> <intro.md> <outro.md> > body.md
// Builds tables grouped by surface (desktop, phone, Duo) with light and dark
// side by side, pointing at the qa-assets branch on raw.githubusercontent.com.
// ============================================================================

import { readFile } from "node:fs/promises";
import path from "node:path";

const [reportPath, introPath, outroPath] = process.argv.slice(2);
const RAW = "https://raw.githubusercontent.com/atthewm/matthewrmckenzie.com/refs/heads/qa-assets/mckenzie-os-remastered/screenshots";
const report = JSON.parse(await readFile(reportPath, "utf8"));
const intro = await readFile(introPath, "utf8");
const outro = await readFile(outroPath, "utf8");

const groups = [
  { title: "Desktop, 1440 x 900", sizes: ["desktop"] },
  { title: "iPhone, 390 x 844", sizes: ["iphone"] },
  { title: "iPhone Duo outer, 382 x 618", sizes: ["duo-outer"] },
  { title: "iPhone Duo inner portrait, 669 x 902", sizes: ["duo-inner"] },
  { title: "iPhone Duo laptop pose, 951 x 620, two segments", sizes: ["duo-laptop"] },
];

function url(file) {
  const rel = file.split(`${path.sep}design-mckenzie-os-remastered${path.sep}`)[1];
  return `${RAW}/${rel}`;
}

let out = intro.trim() + "\n\n## Screenshots\n\nLight on the left, dark on the right. Click any image to open it full size.\n";
for (const g of groups) {
  for (const size of g.sizes) {
    const light = report.shots.filter((s) => s.view === `${size}-light`);
    if (light.length === 0) continue;
    out += `\n<details${size === "desktop" || size === "duo-laptop" ? " open" : ""}><summary><strong>${g.title}</strong> (${light.length} states)</summary>\n\n| State | Light | Dark |\n|---|---|---|\n`;
    for (const s of light) {
      const dark = report.shots.find((d) => d.view === `${size}-dark` && d.state === s.state);
      const w = size === "desktop" || size === "duo-laptop" ? 360 : 180;
      const cell = (shot) => (shot ? `<img src="${url(shot.file)}" width="${w}">` : "missing");
      out += `| \`${s.state}\` | ${cell(s)} | ${cell(dark)} |\n`;
    }
    out += `\n</details>\n`;
  }
}
out += "\n" + outro.trim() + "\n";
process.stdout.write(out);
