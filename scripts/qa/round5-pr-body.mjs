// ============================================================================
// ROUND 5 PR BODY: screenshot tables from round5-shots reports, Duo first
// ============================================================================
// Usage: node scripts/qa/round5-pr-body.mjs <afterDir> <intro.md> <outro.md> > body.md
// Images point at the qa-assets branch with blob ?raw=true links, under
// round-5/after/<view>-<theme>/<page>.png (the same tree as <afterDir>).
// ============================================================================

import { readFile } from "node:fs/promises";
import path from "node:path";

const [afterDir, introPath, outroPath] = process.argv.slice(2);
const BLOB = "https://github.com/atthewm/matthewrmckenzie.com/blob/qa-assets/mckenzie-os-remastered/round-5/after";
const load = async (t) => JSON.parse(await readFile(path.join(afterDir, `report-${t}.json`), "utf8"));
const shots = [...(await load("light")).shots, ...(await load("dark")).shots];
const intro = await readFile(introPath, "utf8");
const outro = await readFile(outroPath, "utf8");

const GROUPS = [
  ["duo-laptop", "iPhone Duo laptop pose, 951 x 620, fold across", true, 360],
  ["duo-book", "iPhone Duo book pose, 669 x 902, fold down the middle", true, 240],
  ["duo-outer-portrait", "iPhone Duo outer screen, 382 x 618", true, 180],
  ["duo-outer-landscape", "iPhone Duo outer screen landscape, 594 x 406", false, 240],
  ["duo-inner-portrait", "iPhone Duo inner screen, 669 x 902", false, 240],
  ["duo-inner-landscape", "iPhone Duo inner screen landscape, 951 x 620", false, 360],
  ["duo-split", "iPhone Duo Split View, 385 x 609", false, 180],
  ["desktop", "Desktop, 1440 x 900", false, 360],
  ["iphone", "iPhone, 390 x 844", false, 180],
];

const label = (p) => (p === "/" ? "home" : p.startsWith("/?open=") ? `app: ${p.slice(7)}` : p);
const img = (s, w) => (s?.file ? `<a href="${BLOB}/${s.file}?raw=true"><img src="${BLOB}/${s.file}?raw=true" width="${w}"></a>` : "missing");

let out = intro.trim() + "\n\n## Screenshots\n\nDuo first. Light on the left, dark on the right. Click any image for full size. Taken from a local production build (`next build`, `next start`) because Vercel previews are off on the Hobby plan.\n";
for (const [view, title, open, w] of GROUPS) {
  const light = shots.filter((s) => s.viewName === view && s.theme === "light" && s.file);
  if (!light.length) continue;
  // App states first in the poses (that is where the two screen layouts live).
  light.sort((a, b) => Number(!a.page.startsWith("/?open")) - Number(!b.page.startsWith("/?open")));
  out += `\n<details${open ? " open" : ""}><summary><strong>${title}</strong> (${light.length} pages and app states)</summary>\n\n| Page | Light | Dark |\n|---|---|---|\n`;
  for (const s of light) {
    const dark = shots.find((d) => d.viewName === view && d.theme === "dark" && d.page === s.page);
    out += `| \`${label(s.page)}\` | ${img(s, w)} | ${img(dark, w)} |\n`;
  }
  out += "\n</details>\n";
}
out += "\n" + outro.trim() + "\n";
process.stdout.write(out);
