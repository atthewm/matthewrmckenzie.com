import { NextResponse } from "next/server";
import { getContent } from "@/lib/content";
import { recipes } from "@/content/recipes/index";

// ============================================================================
// GET /api/recipes/[slug]
// ============================================================================
// Rendered recipe HTML for the desktop RecipeViewer. Prebuilt at build time
// so the home page does not have to ship every recipe up front.
// ============================================================================

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return recipes.map((r) => ({ slug: r.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getContent(`recipes/${slug}`);
  if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ html: content.html });
}
