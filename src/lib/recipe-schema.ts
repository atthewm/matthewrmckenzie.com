// ============================================================================
// RECIPE JSON-LD
// ============================================================================
// Builds a schema.org Recipe object from recipe metadata and its markdown
// body, so search engines can show rich results for /recipes/[slug].
// ============================================================================

import type { RecipeMeta } from "@/content/recipes/index";

function section(raw: string, heading: RegExp): string[] {
  const lines = raw.split("\n");
  const start = lines.findIndex((l) => /^##\s+/.test(l) && heading.test(l));
  if (start === -1) return [];
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    const m = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (m) out.push(m[1].replace(/\*\*/g, "").trim());
  }
  return out;
}

export function recipeSchema(recipe: RecipeMeta, raw: string) {
  const ingredients = section(raw, /ingredient/i);
  const steps = section(raw, /instruction|method|steps/i);
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.subtitle,
    author: { "@type": "Person", name: "Matthew McKenzie", url: "https://matthewrmckenzie.com" },
    recipeYield: recipe.yield || undefined,
    recipeCategory: recipe.category,
    keywords: recipe.tags.join(", "),
    dateModified: recipe.updated || undefined,
    url: `https://matthewrmckenzie.com/recipes/${recipe.slug}`,
    recipeIngredient: ingredients.length ? ingredients : undefined,
    recipeInstructions: steps.length
      ? steps.map((text) => ({ "@type": "HowToStep", text }))
      : undefined,
  };
}
