// ============================================================================
// CONTENT LOADER
// ============================================================================
// Reads markdown content files. Used by both desktop apps and static routes.
// ============================================================================

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "src/content");

export interface ContentData {
  id: string;
  html: string;
  title: string;
  raw: string;
  frontmatter: Record<string, unknown>;
}

export async function getContent(slug: string): Promise<ContentData | null> {
  const filePath = path.join(contentDirectory, `${slug}.md`);
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    const processed = await remark().use(html).process(content);
    const contentHtml = processed.toString();

    // Extract title from first heading if not in frontmatter
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = (data.title as string) || (titleMatch ? titleMatch[1] : slug);

    return {
      id: slug,
      html: contentHtml,
      title,
      raw: content,
      frontmatter: data,
    };
  } catch {
    return null;
  }
}

export function getAllContentSlugs(): string[] {
  try {
    const files = fs.readdirSync(contentDirectory);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}
