// ============================================================================
// RECIPE PARSING FOR COOKING MODE
// ============================================================================
// Pulls ingredients and steps out of a recipe's markdown. Ingredients are the
// bullets under headings that mention ingredients (or the first bullet list
// that is not Equipment). Steps are numbered list items, or "### 1) Title"
// sections with their bullets joined into one step.
// ============================================================================

export interface ParsedRecipe {
  ingredients: string[];
  steps: string[];
}

function clean(s: string): string {
  return s.replace(/\*\*|__|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
}

export function parseRecipe(md: string): ParsedRecipe {
  const lines = md.replace(/^---[\s\S]*?---\n/, "").split("\n");
  const ingredients: string[] = [];
  const steps: string[] = [];
  let heading = "";
  let section: string[] = [];
  const firstBullets: string[] = [];
  let sawIngredientHeading = false;
  let stepSection: { title: string; bullets: string[] } | null = null;

  const flushStep = () => {
    if (stepSection) steps.push(clean([stepSection.title, ...stepSection.bullets].join(". ").replace(/\.\./g, ".")));
    stepSection = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      flushStep();
      const numbered = /^\d+[).]\s*(.*)$/.exec(h[2]);
      if (h[1] === "###" && numbered) {
        stepSection = { title: numbered[1], bullets: [] };
      }
      heading = h[2].toLowerCase();
      if (/ingredient/.test(heading)) sawIngredientHeading = true;
      section = [];
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const ordered = /^\d+\.\s+(.*)$/.exec(line);
    if (ordered) {
      flushStep();
      steps.push(clean(ordered[1]));
      continue;
    }
    if (bullet) {
      if (stepSection) {
        stepSection.bullets.push(bullet[1]);
        continue;
      }
      if (/ingredient|starter|dough|filling|crust|topping|sauce|glaze|frosting/.test(heading) && !/equipment|tool/.test(heading)) {
        ingredients.push(clean(bullet[1]));
      } else if (!/equipment|tool|timing|note|overview|storage|macro|nutrition|tip/.test(heading)) {
        if (firstBullets.length === 0 || section.length > 0) firstBullets.push(clean(bullet[1]));
      }
      section.push(bullet[1]);
    }
  }
  flushStep();
  return { ingredients: ingredients.length > 0 || sawIngredientHeading ? ingredients : firstBullets, steps };
}

/** First duration in a step, in minutes ("30 minutes", "1 hour", "45 to 60 min"). */
export function firstDurationMinutes(step: string): number | null {
  const m = /(\d+(?:\.\d+)?)\s*(?:to\s*\d+\s*)?(hours?|hrs?|minutes?|mins?)\b/i.exec(step);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return /h/i.test(m[2]) ? Math.round(n * 60) : Math.round(n);
}
