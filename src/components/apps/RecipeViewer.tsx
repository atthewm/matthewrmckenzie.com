"use client";

import React, { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import type { FSItem } from "@/data/fs";
import { getRecipeBySlug } from "@/content/recipes/index";

// ============================================================================
// RECIPE VIEWER (Mac OS X 10.3 Panther Document Style)
// ============================================================================
// Loads recipe HTML on demand from /api/recipes/[slug], shows a fact strip
// (yield, time, source), and links to the shareable web page and .md file.
// ============================================================================

interface RecipeViewerProps {
  contentHtml?: string;
  fsItem?: FSItem;
}

const htmlCache = new Map<string, string>();

export default function RecipeViewer({ contentHtml, fsItem }: RecipeViewerProps) {
  const slug = fsItem?.id || "";
  const meta = getRecipeBySlug(slug);
  const title = meta?.title || fsItem?.name || "Recipe";
  const [html, setHtml] = useState<string | null>(contentHtml ?? htmlCache.get(slug) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (html || !slug) return;
    let cancelled = false;
    fetch(`/api/recipes/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { html: string }) => {
        htmlCache.set(slug, d.html);
        if (!cancelled) setHtml(d.html);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [html, slug]);

  const facts = meta
    ? [
        { label: "Yield", value: meta.yield },
        { label: "Time", value: meta.totalTime },
        { label: "Source", value: meta.source },
      ].filter((f) => f.value)
    : [];

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-between gap-2 px-3 border-b text-[10px]"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider truncate">
          {meta?.category ?? "Recipe"}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={`/recipes/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-0.5 rounded text-desktop-accent hover:bg-desktop-accent/10 transition-colors"
          >
            <ExternalLink size={11} />
            <span>Web page</span>
          </a>
          <a
            href={`/recipes/${slug}.md`}
            download={`${slug}.md`}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-desktop-accent hover:bg-desktop-accent/10 transition-colors"
          >
            <Download size={11} />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 pt-5">
          <h2 className="text-[18px] font-semibold text-desktop-text leading-tight">{title}</h2>
          {meta?.subtitle && (
            <p className="text-[12px] text-desktop-text-secondary mt-1 leading-snug">{meta.subtitle}</p>
          )}
          {facts.length > 0 && (
            <dl
              className="grid grid-cols-3 gap-px mt-3 rounded-md overflow-hidden border"
              style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-border)" }}
            >
              {facts.map((f) => (
                <div key={f.label} className="px-2.5 py-1.5" style={{ background: "var(--desktop-surface)" }}>
                  <dt className="text-[9px] uppercase tracking-wider text-desktop-text-secondary">{f.label}</dt>
                  <dd className="text-[11px] text-desktop-text leading-snug">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {html ? (
          <div
            className="
              prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-semibold
              prose-h2:text-[13px] prose-h2:mb-2 prose-h2:mt-6 prose-h2:text-desktop-text
              prose-h3:text-[12px] prose-h3:font-medium
              prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-desktop-text
              prose-li:text-[13px] prose-li:my-0.5
              prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline
              prose-hr:border-desktop-border
              prose-strong:text-desktop-text prose-strong:font-semibold
              prose-table:text-[12px]
              prose-th:text-left prose-th:py-1 prose-th:px-2 prose-th:border-b prose-th:border-desktop-border
              prose-td:py-1 prose-td:px-2 prose-td:border-b prose-td:border-desktop-border/50
              px-6 pb-6 pt-1
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="px-6 py-6 text-[12px] text-desktop-text-secondary" role="status">
            {failed ? (
              <>
                Could not load this recipe.{" "}
                <a className="text-desktop-accent underline" href={`/recipes/${slug}`}>Open the web page</a> instead.
              </>
            ) : (
              "Loading recipe..."
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-between px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
      >
        <span>Recipe</span>
        {meta?.updated && <span>Updated {meta.updated}</span>}
      </div>
    </div>
  );
}
