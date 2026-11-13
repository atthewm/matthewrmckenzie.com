import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema } from "@/components/ui/JsonLd";
import { getContent } from "@/lib/content";
import { recipes, getRecipeBySlug } from "@/content/recipes/index";
import { recipeSchema } from "@/lib/recipe-schema";

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

  return (
    <StaticPageLayout title={recipe.title}>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: SITE },
          { name: "Recipes", url: `${SITE}/recipes` },
          { name: recipe.title, url: `${SITE}/recipes/${slug}` },
        ])}
      />
      <JsonLd data={recipeSchema(recipe, content.raw)} />

      <Link href="/recipes" className="site-noprint site-mono text-[13px] uppercase tracking-[0.12em]" style={{ color: "var(--site-muted)" }}>
        &larr; All recipes
      </Link>

      <header className="mt-6">
        <p className="site-eyebrow">{recipe.category}</p>
        <h1 className="site-display text-[36px] sm:text-[46px] leading-[1.08] mt-3">{recipe.title}</h1>
        {recipe.subtitle && (
          <p className="text-[18px] leading-relaxed mt-3" style={{ color: "var(--site-muted)" }}>
            {recipe.subtitle}
          </p>
        )}
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px mt-7 rounded-xl overflow-hidden border" style={{ borderColor: "var(--site-rule)", background: "var(--site-rule)" }}>
          {facts.map((f) => (
            <div key={f.label} className="px-4 py-3" style={{ background: "var(--site-surface)" }}>
              <dt className="site-mono text-[13px] uppercase tracking-[0.14em]" style={{ color: "var(--site-muted)" }}>{f.label}</dt>
              <dd className="text-[14px] mt-1 leading-snug">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="site-noprint flex gap-4 mt-4 text-[13px]">
          <a href={`/recipes/${slug}.md`} download className="site-link">Download as text</a>
          {recipe.tags.length > 0 && (
            <span className="site-mono text-[13px] self-center" style={{ color: "var(--site-muted)" }}>
              {recipe.tags.join(" · ")}
            </span>
          )}
        </div>
      </header>

      <article className="site-prose mt-10" dangerouslySetInnerHTML={{ __html: content.html }} />

      {next && next.slug !== slug && (
        <nav aria-label="Next recipe" className="site-noprint mt-14 pt-6 border-t" style={{ borderColor: "var(--site-rule)" }}>
          <p className="site-eyebrow">Next recipe</p>
          <Link href={`/recipes/${next.slug}`} className="site-display text-[24px] mt-2 inline-block hover:underline underline-offset-4">
            {next.title}
          </Link>
        </nav>
      )}
    </StaticPageLayout>
  );
}
