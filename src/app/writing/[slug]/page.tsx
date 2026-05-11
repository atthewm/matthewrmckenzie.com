import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import JsonLd, { breadcrumbSchema, blogPostingSchema } from "@/components/ui/JsonLd";

const essaysDir = path.join(process.cwd(), "src/content/essays");

function getEssaySlugs(): string[] {
  try {
    return fs
      .readdirSync(essaysDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

async function getEssay(slug: string) {
  const filePath = path.join(essaysDir, `${slug}.md`);
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const processed = await remark().use(html).process(content);
    return { frontmatter: data, html: processed.toString(), raw: content };
  } catch {
    return null;
  }
}

function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateStaticParams() {
  return getEssaySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) return {};
  const title = (essay.frontmatter.title as string) || slug;
  const description = (essay.frontmatter.description as string) || "";
  const datePublished = essay.frontmatter.date as string | undefined;
  const dateModified = (essay.frontmatter.dateModified as string | undefined) ?? datePublished;
  const url = `https://matthewrmckenzie.com/writing/${slug}`;
  return {
    title: `${title} | Matthew McKenzie`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [`/writing/${slug}/opengraph-image`],
      publishedTime: datePublished,
      modifiedTime: dateModified,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/writing/${slug}/opengraph-image`],
    },
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essay = await getEssay(slug);
  if (!essay) notFound();

  const title = essay.frontmatter.title as string;
  const date = essay.frontmatter.date
    ? new Date(essay.frontmatter.date as string).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <StaticPageLayout>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://matthewrmckenzie.com" },
          { name: "Writing", url: "https://matthewrmckenzie.com/writing" },
          { name: title, url: `https://matthewrmckenzie.com/writing/${slug}` },
        ])}
      />
      <JsonLd
        data={blogPostingSchema({
          title,
          description: (essay.frontmatter.description as string) || "",
          slug,
          datePublished: essay.frontmatter.date as string,
          dateModified:
            (essay.frontmatter.dateModified as string | undefined) ??
            (essay.frontmatter.date as string),
          articleBody: toPlainText(essay.raw),
        })}
      />
      <article
        className="prose prose-sm dark:prose-invert max-w-none
                   prose-headings:font-semibold
                   prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline"
      >
        {date && (
          <p className="text-desktop-text-secondary text-xs mb-4">{date}</p>
        )}
        <div dangerouslySetInnerHTML={{ __html: essay.html }} />
        <hr className="my-8" />
        <p className="text-desktop-text-secondary text-sm">
          <Link href="/writing">&larr; Back to Writing</Link>
        </p>
      </article>
    </StaticPageLayout>
  );
}
