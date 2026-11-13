import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import { recipes, RECIPE_CATEGORIES } from "@/content/recipes/index";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Matthew McKenzie's kitchen notebook: sourdough, family recipe cards, high-protein baking, and weeknight dinners, with macros.",
  alternates: { canonical: "https://matthewrmckenzie.com/recipes" },
  openGraph: {
    images: ["/opengraph-image"],
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
    <StaticPageLayout wide>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://matthewrmckenzie.com" },
          { name: "Recipes", url: "https://matthewrmckenzie.com/recipes" },
        ])}
      />
      <header className="max-w-[680px]">
        <p className="site-eyebrow">Kitchen notebook &middot; {recipes.length} recipes</p>
        <h1 className="site-display text-[40px] sm:text-[52px] leading-[1.05] mt-3">Recipes</h1>
        <p className="text-[17px] leading-relaxed mt-4" style={{ color: "var(--site-muted)" }}>
          Weekly sourdough, cards from the family recipe box, and a running series of protein-forward
          desserts. Most include macros. Every recipe can be downloaded as plain text.
        </p>
        <nav aria-label="Recipe categories" className="flex flex-wrap gap-2 mt-6">
          {groups.map((g) => (
            <a
              key={g.category}
              href={`#${g.category.toLowerCase()}`}
              className="site-mono text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border"
              style={{ borderColor: "var(--site-rule)", color: "var(--site-muted)" }}
            >
              {g.category} &middot; {g.items.length}
            </a>
          ))}
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g.category} id={g.category.toLowerCase()} className="mt-14 scroll-mt-6">
          <h2 className="site-display text-[28px] pb-3 border-b" style={{ borderColor: "var(--site-rule)" }}>
            {g.category}
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {g.items.map((r) => (
              <li key={r.slug} className="border-b" style={{ borderColor: "var(--site-rule)" }}>
                <Link href={`/recipes/${r.slug}`} className="group block py-5">
                  <span className="block text-[17px] font-medium leading-snug group-hover:underline underline-offset-4">
                    {r.title}
                  </span>
                  <span className="block text-[14px] leading-snug mt-1" style={{ color: "var(--site-muted)" }}>
                    {r.subtitle}
                  </span>
                  <span className="block site-mono text-[11px] mt-2" style={{ color: "var(--site-gold)" }}>
                    {r.yield}
                    {r.source === "Family recipe card" ? " · Family card" : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </StaticPageLayout>
  );
}
