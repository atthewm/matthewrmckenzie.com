import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import { getContent } from "@/lib/content";
import { recipes, getRecipeBySlug } from "@/content/recipes/index";
import { recipeSchema } from "@/lib/recipe-schema";
import { splitProse, monoNumbers, type ProseSection } from "@/lib/prose";

// Sections that list what you need sit in the sticky left column on desktop.
const SIDE_SECTION = /ingredients|equipment/i;

function RecipeSections({ sections }: { sections: readonly ProseSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          <h2 dangerouslySetInnerHTML={{ __html: section.heading }} />
          <div className="site-prose" dangerouslySetInnerHTML={{ __html: monoNumbers(section.html) }} />
        </section>
      ))}
    </>
  );
}

const SITE = "https://matthewrmckenzie.com";

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  if (!recipe) return {};
  return {
    title: `${recipe.title} | Recipes`,
    description: recipe.subtitle,
    alternates: { canonical: `${SITE}/recipes/${slug}` },
    openGraph: { title: recipe.title, description: recipe.subtitle, type: "article" },
  };
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);
  const content = recipe ? await getContent(`recipes/${slug}`) : null;
  if (!recipe || !content) notFound();

  const index = recipes.findIndex((r) => r.slug === slug);
  const next = recipes[(index + 1) % recipes.length];

  const facts = [
    { label: "Yield", value: recipe.yield },
    { label: "Time", value: recipe.totalTime },
    { label: "Source", value: recipe.source },
  ].filter((f) => f.value);

  const { intro, sections } = splitProse(content.html);
  const sideSections = sections.filter((s) => SIDE_SECTION.test(s.heading));
  const methodSections = sections.filter((s) => !SIDE_SECTION.test(s.heading));

  return (
    <StaticPageLayout>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE },
          { name: "Recipes", url: `${SITE}/recipes` },
          { name: recipe.title, url: `${SITE}/recipes/${slug}` },
        ])}
      />
      <JsonLd data={recipeSchema(recipe, content.raw)} />

      <article>
        <header className="site-grid page-head">
          <Link href="/recipes" className="page-back site-noprint">
            <span aria-hidden="true">&larr;</span> All recipes
          </Link>
          <p className="site-eyebrow">{recipe.category}</p>
          <h1 className="site-title col-title">{recipe.title}</h1>
          {recipe.subtitle && <p className="site-lede col-body">{recipe.subtitle}</p>}
          <dl className="site-facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="site-noprint site-actions">
            <a href={`/recipes/${slug}.md`} download className="site-link">
              Download as text
            </a>
            {recipe.tags.length > 0 && (
              <span className="site-mono site-muted" style={{ fontSize: "var(--text-label)" }}>
                {recipe.tags.join(" · ")}
              </span>
            )}
          </div>
        </header>

        <div className={sideSections.length > 0 ? "site-grid recipe-body" : "site-grid recipe-body is-solo"}>
          {intro && (
            <div
              className="recipe-intro site-prose site-prose-intro"
              dangerouslySetInnerHTML={{ __html: monoNumbers(intro) }}
            />
          )}
          {sideSections.length > 0 && (
            <aside className="recipe-side" aria-label="Ingredients and equipment">
              <RecipeSections sections={sideSections} />
            </aside>
          )}
          <div className="recipe-method">
            <RecipeSections sections={methodSections} />
          </div>
        </div>
      </article>

      {next && next.slug !== slug && (
        <nav aria-label="Next recipe" className="site-grid site-row site-noprint" style={{ marginTop: "var(--space-block)" }}>
          <p className="site-eyebrow col-head">Next recipe</p>
          <div className="col-body">
            <Link href={`/recipes/${next.slug}`} className="site-index-title" style={{ fontSize: "var(--text-h2)" }}>
              {next.title}
            </Link>
          </div>
        </nav>
      )}
    </StaticPageLayout>
  );
}
