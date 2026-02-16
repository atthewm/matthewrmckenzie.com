"use client";

import React from "react";
import { Download, ExternalLink } from "lucide-react";
import type { FSItem } from "@/data/fs";
import { siteConfig } from "@/lib/config";

// ============================================================================
// RECIPE VIEWER (Mac OS X 10.3 Panther Document Style)
// ============================================================================
// Renders a single recipe with markdown content, a download button for the
// raw .md file, and a link to the Notion Recipe Library.
// ============================================================================

interface RecipeViewerProps {
  contentHtml?: string;
  fsItem?: FSItem;
}

export default function RecipeViewer({ contentHtml, fsItem }: RecipeViewerProps) {
  const slug = fsItem?.id || "";
  const title = fsItem?.name || "Recipe";
  const downloadUrl = `/recipes/${slug}.md`;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center justify-between px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          {title}
        </span>
        <a
          href={downloadUrl}
          download={`${slug}.md`}
          className="flex items-center gap-1 px-2 py-0.5 rounded
                     text-desktop-accent hover:bg-desktop-accent/10 transition-colors"
          title={`Download ${slug}.md`}
        >
          <Download size={11} />
          <span>Download .md</span>
        </a>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {contentHtml ? (
          <div
            className="
              prose prose-sm dark:prose-invert max-w-none
              prose-headings:font-semibold
              prose-h1:text-lg prose-h1:mb-3 prose-h1:mt-0 prose-h1:text-desktop-text
              prose-h2:text-[13px] prose-h2:mb-2 prose-h2:mt-6 prose-h2:text-desktop-text
              prose-h3:text-[12px] prose-h3:font-medium
              prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-desktop-text
              prose-li:text-[13px]
              prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline
              prose-code:text-[11px] prose-code:bg-desktop-border/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-hr:border-desktop-border
              prose-strong:text-desktop-text prose-strong:font-semibold
              prose-table:text-[12px]
              prose-th:text-left prose-th:py-1 prose-th:px-2 prose-th:border-b prose-th:border-desktop-border
              prose-td:py-1 prose-td:px-2 prose-td:border-b prose-td:border-desktop-border/50
              px-6 py-5
            "
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <div className="p-5 text-sm text-desktop-text-secondary">
            No content found for this recipe.
          </div>
        )}

        {/* Notion Recipe Library link */}
        <div
          className="mx-6 mb-5 mt-2 px-4 py-3 rounded-lg border flex items-center justify-between"
          style={{
            borderColor: "var(--desktop-border)",
            background: "rgba(0,0,0,0.02)",
          }}
        >
          <div>
            <p className="text-[11px] font-medium text-desktop-text">
              Notion Recipe Library
            </p>
            <p className="text-[10px] text-desktop-text-secondary">
              Downloads and updates
            </p>
          </div>
          <a
            href={siteConfig.notionRecipesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-medium
                       bg-desktop-accent text-white hover:opacity-90 transition-opacity"
          >
            <ExternalLink size={10} />
            Open in Notion
          </a>
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        Recipe
      </div>
    </div>
  );
}
