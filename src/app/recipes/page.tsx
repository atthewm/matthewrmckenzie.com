import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import PageHead from "@/components/site/PageHead";
import SiteRow from "@/components/site/SiteRow";
import { recipes, RECIPE_CATEGORIES } from "@/content/recipes/index";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Matthew McKenzie's kitchen notebook: sourdough, family recipe cards, high-protein baking, and weeknight dinners, with macros.",
  alternates: { canonical: "https://matthewrmckenzie.com/recipes" },
  openGraph: {
    title: "Recipes | Matthew McKenzie",
    description: "Sourdough, family recipe cards, high-protein baking, and weeknight dinners.",
  },
};

export default function RecipesPage() {
  const groups = RECIPE_CATEGORIES.map((category) => ({
    category,
    items: recipes.filter((r) => r.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <StaticPageLayout>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://matthewrmckenzie.com" },
          { name: "Recipes", url: "https://matthewrmckenzie.com/recipes" },
        ])}
      />
      <PageHead
        eyebrow={<>Kitchen notebook &middot; {recipes.length} recipes</>}
        title="Recipes"
        lede="Weekly sourdough, cards from the family recipe box, and a running series of protein-forward desserts. Most include macros. Every recipe can be downloaded as plain text."
      >
        <nav aria-label="Recipe categories" className="col-body flex flex-wrap gap-2">
          {groups.map((g) => (
            <a key={g.category} href={`#${g.category.toLowerCase()}`} className="site-chip">
              {g.category} &middot; {g.items.length}
            </a>
          ))}
        </nav>
      </PageHead>

      {groups.map((g) => (
        <SiteRow
          key={g.category}
          id={g.category.toLowerCase()}
          heading={g.category}
          note={`${g.items.length} ${g.items.length === 1 ? "recipe" : "recipes"}`}
          wide
        >
          <ul className="site-index">
            {g.items.map((r) => (
              <li key={r.slug}>
                <Link href={`/recipes/${r.slug}`}>
                  <span className="site-index-title">{r.title}</span>
                  <span className="site-index-sub">{r.subtitle}</span>
                  <span className="site-index-meta">
                    {r.yield}
                    {r.source === "Family recipe card" ? " · Family card" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </SiteRow>
      ))}
    </StaticPageLayout>
  );
}
