// ============================================================================
// BOARD EXPORT ("pack it in the backpack")
// ============================================================================
// Turns a pinned item into something the visitor can keep: a print-ready,
// self-contained HTML document for recipes, workouts, and written pages, or
// the real file for PDFs and the business card vCard.
// ============================================================================

import type { FSItem } from "@/data/fs";
import { getRecipeBySlug } from "@/content/recipes/index";
import { findSplitByFsId } from "@/data/whoop/splits";

export type PackResult =
  | { ok: true; filename: string }
  | { ok: false; reason: string };

interface DocParts {
  eyebrow: string;
  title: string;
  subtitle?: string;
  facts?: { label: string; value: string }[];
  bodyHtml: string;
}

const SITE = "matthewrmckenzie.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildDocument({ eyebrow, title, subtitle, facts = [], bodyHtml }: DocParts): string {
  const factRow = facts.length
    ? `<dl class="facts">${facts
        .map((f) => `<div><dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(f.value)}</dd></div>`)
        .join("")}</dl>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { --ink:#1d1b18; --muted:#6b645a; --rule:#d9d1c4; --accent:#b2452f; --paper:#fffdf8; }
  * { box-sizing: border-box; }
  body { margin:0; background:#efe9df; color:var(--ink); font: 15px/1.6 Georgia, "Times New Roman", serif; }
  main { max-width: 720px; margin: 32px auto; background: var(--paper); padding: 48px 56px; box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 12px 32px rgba(0,0,0,.08); border-top: 6px solid var(--accent); }
  .eyebrow { font: 600 11px/1 ui-monospace, Menlo, monospace; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); margin: 0 0 12px; }
  h1 { font-size: 32px; line-height: 1.15; margin: 0; font-weight: 600; }
  .subtitle { color: var(--muted); font-size: 17px; margin: 8px 0 0; font-style: italic; }
  .facts { display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1px; background: var(--rule); border: 1px solid var(--rule); margin: 24px 0 8px; }
  .facts div { background: var(--paper); padding: 10px 12px; }
  .facts dt { font: 600 10px/1 ui-monospace, Menlo, monospace; letter-spacing:.12em; text-transform: uppercase; color: var(--muted); }
  .facts dd { margin: 6px 0 0; font-size: 14px; }
  .body h1, .body h2 { font-size: 20px; margin: 32px 0 8px; padding-bottom: 6px; border-bottom: 1px solid var(--rule); }
  .body h3 { font-size: 16px; margin: 24px 0 6px; }
  .body li { margin: 4px 0; }
  .body table { border-collapse: collapse; width: 100%; font-size: 14px; }
  .body th, .body td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--rule); }
  .body a { color: var(--accent); }
  footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid var(--rule); color: var(--muted); font: 11px/1.4 ui-monospace, Menlo, monospace; display:flex; justify-content:space-between; }
  @media print {
    body { background: #fff; }
    main { margin: 0; box-shadow: none; padding: 0; border-top: 0; max-width: none; }
    a { color: inherit; }
  }
</style>
</head>
<body>
<main>
  <p class="eyebrow">${escapeHtml(eyebrow)}</p>
  <h1>${escapeHtml(title)}</h1>
  ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
  ${factRow}
  <div class="body">${bodyHtml}</div>
  <footer><span>${SITE}</span><span>Packed ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span></footer>
</main>
</body>
</html>`;
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadHtml(html: string, filename: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function recipeDocument(item: FSItem): Promise<DocParts | null> {
  const meta = getRecipeBySlug(item.id);
  const res = await fetch(`/api/recipes/${item.id}`);
  if (!res.ok) return null;
  const { html } = (await res.json()) as { html: string };
  return {
    eyebrow: meta?.category ? `Recipe · ${meta.category}` : "Recipe",
    title: meta?.title ?? item.name,
    subtitle: meta?.subtitle,
    facts: meta
      ? [
          { label: "Yield", value: meta.yield },
          { label: "Time", value: meta.totalTime },
          { label: "Source", value: meta.source },
        ].filter((f) => f.value)
      : [],
    bodyHtml: html,
  };
}

function splitDocument(item: FSItem): DocParts | null {
  const split = findSplitByFsId(item.id);
  if (!split) return null;
  const href = escapeHtml(split.shareUrl);
  return {
    eyebrow: "Workout · WHOOP Strength Trainer",
    title: split.displayName,
    subtitle: split.description,
    facts: [{ label: "File", value: split.sillyFileName }],
    bodyHtml: `<p>Open this split in WHOOP to load the full exercise list, sets, and reps:</p><p><a href="${href}">${href}</a></p>`,
  };
}

/** Build and download the packed version of an item. Never throws. */
export async function packItem(item: FSItem, contentMap: Record<string, string>): Promise<PackResult> {
  try {
    if (item.type === "link" && item.href?.toLowerCase().endsWith(".pdf")) {
      const filename = item.href.split("/").pop() ?? `${slugify(item.name)}.pdf`;
      triggerDownload(item.href, filename);
      return { ok: true, filename };
    }
    if (item.appComponent === "BusinessCardApp") {
      triggerDownload("/card/vcard", "Matthew-McKenzie.vcf");
      return { ok: true, filename: "Matthew-McKenzie.vcf" };
    }

    let parts: DocParts | null = null;
    if (item.appComponent === "RecipeViewer") parts = await recipeDocument(item);
    else if (item.appComponent === "WhoopSplitApp") parts = splitDocument(item);
    else if (contentMap[item.id]) {
      parts = {
        eyebrow: item.description ?? SITE,
        title: item.name.replace(/\.[a-z]+$/i, ""),
        bodyHtml: contentMap[item.id],
      };
    }

    if (!parts) return { ok: false, reason: `${item.name} can't be packed. Open it instead.` };
    const filename = `${slugify(parts.title) || "document"}.html`;
    downloadHtml(buildDocument(parts), filename);
    return { ok: true, filename };
  } catch (error) {
    console.error("[board] pack failed", item.id, error);
    return { ok: false, reason: `Couldn't pack ${item.name}. Try again.` };
  }
}

/** Whether an item has something to download, used to dim cards while dragging. */
export function isPackable(item: FSItem, contentMap: Record<string, string>): boolean {
  if (item.type === "link") return Boolean(item.href?.toLowerCase().endsWith(".pdf"));
  return (
    item.appComponent === "RecipeViewer" ||
    item.appComponent === "WhoopSplitApp" ||
    item.appComponent === "BusinessCardApp" ||
    Boolean(contentMap[item.id])
  );
}
