import { test } from "node:test";
import assert from "node:assert/strict";
import { splitProse, monoNumbers, slugifyHeading } from "./prose.ts";

test("splitProse lifts the first h1 out as the title", () => {
  const result = splitProse("<h1>Work</h1>\n<p>Intro.</p>");
  assert.equal(result.title, "Work");
  assert.equal(result.intro, "<p>Intro.</p>");
  assert.deepEqual(result.sections, []);
});

test("splitProse cuts the body into one section per h2", () => {
  const html = "<h1>About</h1><p>Lead.</p><h2>Work</h2><p>A</p><p>B</p><h2>Health &#x26; Fitness</h2><ul><li>C</li></ul>";
  const result = splitProse(html);
  assert.equal(result.intro, "<p>Lead.</p>");
  assert.equal(result.sections.length, 2);
  assert.deepEqual(result.sections[0], { id: "work", heading: "Work", html: "<p>A</p><p>B</p>" });
  assert.equal(result.sections[1].heading, "Health &#x26; Fitness");
  assert.equal(result.sections[1].id, "health-fitness");
  assert.equal(result.sections[1].html, "<ul><li>C</li></ul>");
});

test("splitProse returns a null title and whole intro when there are no headings", () => {
  const result = splitProse("<p>Only this.</p>");
  assert.equal(result.title, null);
  assert.equal(result.intro, "<p>Only this.</p>");
});

test("splitProse gives repeated headings distinct ids", () => {
  const result = splitProse("<h2>Notes</h2><p>a</p><h2>Notes</h2><p>b</p>");
  assert.deepEqual(result.sections.map((s) => s.id), ["notes", "notes-2"]);
});

test("slugifyHeading strips tags, entities and punctuation", () => {
  assert.equal(slugifyHeading("Starter (build this first)"), "starter-build-this-first");
  assert.equal(slugifyHeading("<em>Day 1</em> steps"), "day-1-steps");
});

test("monoNumbers wraps numbers in text, not in tags or entities", () => {
  assert.equal(
    monoNumbers('<li>950 g flour, 1/2 tsp salt</li>'),
    '<li><span class="num">950</span> g flour, <span class="num">1/2</span> tsp salt</li>',
  );
  assert.equal(monoNumbers('<a href="/r/2">it&#39;s</a>'), '<a href="/r/2">it&#39;s</a>');
  assert.equal(monoNumbers("<p>Bake at 450.5 F</p>"), '<p>Bake at <span class="num">450.5</span> F</p>');
});

test("monoNumbers leaves heading text alone", () => {
  assert.equal(monoNumbers("<h3>Day 1</h3><p>2 cups</p>"), '<h3>Day 1</h3><p><span class="num">2</span> cups</p>');
});

test("linkRecipesOnSite repoints recipe links and leaves other desktop links", async () => {
  const { linkRecipesOnSite } = await import("./prose.ts");
  const html = '<a href="/desktop?open=rye-starter">Rye</a> <a href="/desktop?open=resume">Resume</a>';
  assert.equal(
    linkRecipesOnSite(html, new Set(["rye-starter"])),
    '<a href="/recipes/rye-starter">Rye</a> <a href="/desktop?open=resume">Resume</a>',
  );
});
