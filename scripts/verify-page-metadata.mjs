import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "parse5";

const read = (file) => readFileSync(file, "utf8");
const root = path.resolve(".next");
const manifest = JSON.parse(read(path.join(root, "prerender-manifest.json")));
const { redirects } = JSON.parse(read(path.join(root, "routes-manifest.json")));
const unconditionalRedirects = redirects
  .filter((rule) => !rule.has?.length && !rule.missing?.length)
  .map((rule) => new RegExp(rule.regex));
const failures = [];
let checked = 0;

for (const [route, details] of Object.entries(manifest.routes)) {
  if (details.initialStatus >= 300 || unconditionalRedirects.some((rule) => rule.test(route))) continue;
  const file = path.join(root, "server/app", (route === "/" ? "index" : route.slice(1)) + ".html");
  if (!existsSync(file)) continue;
  const doc = parse(read(file));
  const html = doc.childNodes.find((node) => node.tagName === "html");
  const head = html?.childNodes.find((node) => node.tagName === "head");
  if (!head) throw new Error("Missing head on " + route);
  const nodes = head.childNodes.map((node) => ({
    tag: node.tagName,
    attrs: Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value])),
    content: (node.childNodes ?? []).map((child) => child.value ?? "").join("").trim(),
  }));
  const meta = new Map(nodes.filter(({ tag }) => tag === "meta").map(({ attrs }) => [attrs.property || attrs.name, (attrs.content ?? "").trim()]));
  if (nodes.some(({ attrs }) => attrs.name === "robots" && /\b(?:noindex|none)\b/i.test(attrs.content ?? ""))) continue;
  if (nodes.some(({ attrs }) => attrs["http-equiv"]?.toLowerCase() === "refresh" || attrs.id === "__next-page-redirect")) continue;
  checked++;
  const title = nodes.find(({ tag }) => tag === "title")?.content ?? "";
  const description = meta.get("description") ?? "";
  if (!title || [...title].length > 60) failures.push(route + " title (1 to 60 characters)");
  if (!description || [...description].length > 155) failures.push(route + " description (1 to 155 characters)");
  for (const key of ["title", "description", "image", "url", "type"]) {
    if (!meta.get("og:" + key)) failures.push(route + " missing og:" + key);
  }
  const canonical = nodes.find(({ tag, attrs }) => tag === "link" && attrs.rel === "canonical")?.attrs.href;
  if (canonical && meta.get("og:url") && new URL(meta.get("og:url"), canonical).href !== new URL(canonical).href) {
    failures.push(route + " has a different canonical and og:url");
  }
}
console.log("Checked " + checked + " indexable HTML pages, " + failures.length + " metadata errors.");
for (const failure of failures) console.error(failure);
if (!checked || failures.length) process.exitCode = 1;
