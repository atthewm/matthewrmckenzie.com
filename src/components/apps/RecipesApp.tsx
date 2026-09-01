"use client";

import React, { useMemo, useState } from "react";
import {
  Clock,
  Search,
  Wheat,
  Croissant,
  Drumstick,
  Cookie,
  Cherry,
  ExternalLink,
  UtensilsCrossed,
} from "lucide-react";
import { findFSItem, type FSItem } from "@/data/fs";
import { useDesktop } from "@/hooks/useDesktopStore";
import {
  recipes as recipeIndex,
  getRecipeCategory,
  RECIPE_CATEGORIES,
  type RecipeMeta,
  type RecipeCategoryId,
} from "@/content/recipes/index";
import { siteConfig } from "@/lib/config";

// ============================================================================
// RECIPES — card grid index over src/content/recipes
// ============================================================================
// Replaces the plain Finder list for the Recipes folder. Filter by category or
// search, then open a card to launch the existing RecipeViewer window (the
// markdown is already preloaded into contentMap by the server, keyed by slug).
// ============================================================================

/**
 * Card icon, chosen from the recipe's own tags rather than its filter category,
 * so a jam does not inherit the sweets cookie and tortillas do not inherit the
 * mains drumstick. First matching rule wins.
 */
const ICON_RULES: { tags: string[]; icon: React.ComponentType<{ className?: string }> }[] = [
  { tags: ["jam", "fruit"], icon: Cherry },
  { tags: ["bread", "sourdough", "starter", "rye", "tortillas"], icon: Wheat },
  { tags: ["breakfast", "oats"], icon: Croissant },
  { tags: ["dessert", "brownies", "baking"], icon: Cookie },
  { tags: ["chicken", "meatballs", "dinner"], icon: Drumstick },
];

function iconFor(recipe: RecipeMeta): React.ComponentType<{ className?: string }> {
  for (const rule of ICON_RULES) {
    if (recipe.tags.some((t) => rule.tags.includes(t))) return rule.icon;
  }
  return UtensilsCrossed;
}

/**
 * Card art. There are no recipe photos in the repo yet, so each card gets a
 * stable illustrated tile instead of an empty box: a category icon over a
 * gradient seeded from the slug, so every recipe looks distinct and a given
 * recipe looks the same on every render. A real photo takes over automatically
 * once `image` is set on the recipe.
 */
function CardArt({ recipe }: { recipe: RecipeMeta }) {
  const Icon = iconFor(recipe);

  // Deterministic hue from the slug.
  const hue = useMemo(() => {
    let h = 0;
    for (let i = 0; i < recipe.slug.length; i++) {
      h = (h * 31 + recipe.slug.charCodeAt(i)) % 360;
    }
    return h;
  }, [recipe.slug]);

  if (recipe.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={recipe.image}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `linear-gradient(135deg,
          hsl(${hue} 45% 62%) 0%,
          hsl(${(hue + 38) % 360} 48% 46%) 100%)`,
      }}
    >
      <Icon className="h-7 w-7 text-white/85" />
    </div>
  );
}

function RecipeCard({ recipe, onOpen }: { recipe: RecipeMeta; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title={recipe.subtitle}
      className="group flex flex-col overflow-hidden rounded-lg border border-desktop-border
                 bg-desktop-surface text-left transition-colors
                 hover:border-desktop-accent
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-desktop-accent"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-desktop-bg">
        <CardArt recipe={recipe} />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2">
        <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-desktop-text">
          {recipe.title}
        </span>
        <span className="line-clamp-2 text-[10px] leading-snug text-desktop-text-secondary">
          {recipe.subtitle}
        </span>
        <span className="mt-auto flex items-center gap-1 pt-1 text-[10px] text-desktop-text-secondary">
          <Clock className="h-3 w-3 shrink-0" />
          <span className="truncate">{recipe.totalTime}</span>
        </span>
      </div>
    </button>
  );
}

export default function RecipesApp({ fsItem }: { fsItem?: FSItem }) {
  const { openItem } = useDesktop();
  const [category, setCategory] = useState<RecipeCategoryId | "all">("all");
  const [query, setQuery] = useState("");

  // The window's own children carry contentPath, which is what RecipeViewer
  // needs; fall back to a lookup so the app works opened from anywhere.
  const childById = useMemo(() => {
    const children = fsItem?.children ?? findFSItem("recipes")?.children ?? [];
    return new Map(children.map((c) => [c.id, c]));
  }, [fsItem]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipeIndex.filter((r) => {
      if (category !== "all" && getRecipeCategory(r) !== category) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const open = (recipe: RecipeMeta) => {
    const item = childById.get(recipe.slug);
    if (item) openItem(item);
  };

  const filters: { id: RecipeCategoryId | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...RECIPE_CATEGORIES.map((c) => ({ id: c.id as RecipeCategoryId, label: c.label })),
  ];

  return (
    <div className="flex h-full flex-col bg-desktop-bg text-desktop-text">
      <header className="shrink-0 border-b border-desktop-border">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UtensilsCrossed className="h-4 w-4" />
            Recipes
          </div>
          <div className="flex flex-wrap justify-end gap-1">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCategory(f.id)}
                className={
                  "rounded px-2 py-0.5 text-[11px] " +
                  (category === f.id
                    ? "bg-desktop-accent text-white"
                    : "text-desktop-text-secondary hover:bg-desktop-surface")
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 pb-2">
          <label className="relative block">
            <span className="sr-only">Search recipes</span>
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-desktop-text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes and tags"
              className="w-full rounded border border-desktop-border bg-desktop-surface py-1 pl-7 pr-2
                         text-[11px] text-desktop-text placeholder:text-desktop-text-secondary
                         focus:border-desktop-accent focus:outline-none"
            />
          </label>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {shown.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-xs text-desktop-text-secondary">
            No recipe matches that filter.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(132px,1fr))] gap-3">
            {shown.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} onOpen={() => open(recipe)} />
            ))}
          </div>
        )}

        <div
          className="mt-3 flex items-center justify-between rounded-lg border px-3 py-2.5"
          style={{
            borderColor: "var(--desktop-border)",
            background: "var(--desktop-surface-raised)",
          }}
        >
          <div>
            <p className="text-[11px] font-medium text-desktop-text">Notion Recipe Library</p>
            <p className="text-[10px] text-desktop-text-secondary">Browse the full collection</p>
          </div>
          <a
            href={siteConfig.notionRecipesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded bg-desktop-accent px-2.5 py-1.5 text-[10px]
                       font-medium text-white transition-opacity hover:opacity-90"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Open in Notion
          </a>
        </div>
      </div>

      <footer
        className="shrink-0 border-t border-desktop-border px-3 py-1 text-[10px] text-desktop-text-secondary"
      >
        {shown.length} of {recipeIndex.length} recipe{recipeIndex.length !== 1 ? "s" : ""}
      </footer>
    </div>
  );
}
