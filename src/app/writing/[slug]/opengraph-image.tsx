import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const alt = "Matthew McKenzie essay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const essaysDir = path.join(process.cwd(), "src/content/essays");

export async function generateStaticParams() {
  try {
    return fs
      .readdirSync(essaysDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({ slug: f.replace(/\.md$/, "") }));
  } catch {
    return [];
  }
}

function readTitle(slug: string): string {
  try {
    const raw = fs.readFileSync(path.join(essaysDir, `${slug}.md`), "utf8");
    const { data } = matter(raw);
    return (data.title as string) || slug;
  } catch {
    return slug;
  }
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = readTitle(slug);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 40%, #111 100%)",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 22,
            color: "#999",
            letterSpacing: "3px",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
          }}
        >
          Matthew McKenzie
          <span style={{ color: "#444", margin: "0 14px" }}>/</span>
          Writing
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "#fff",
            display: "flex",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 18,
            color: "#777",
            letterSpacing: "1px",
          }}
        >
          <div style={{ display: "flex" }}>Capital Formation &amp; Growth Strategy</div>
          <div style={{ display: "flex", color: "#444", letterSpacing: "3px", textTransform: "uppercase" }}>
            matthewrmckenzie.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
