"use client";

import React from "react";

// ============================================================================
// PROJECTS APP (ryOS Retro Mac Style)
// ============================================================================
// Clean document viewer with subtle toolbar and well-styled prose.
// ============================================================================

interface ProjectsAppProps {
  contentHtml?: string;
}

export default function ProjectsApp({ contentHtml }: ProjectsAppProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Projects
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {contentHtml ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none px-6 py-5
                       prose-h1:text-lg prose-h1:font-semibold prose-h1:text-desktop-text prose-h1:mb-3
                       prose-h2:text-[13px] prose-h2:font-semibold prose-h2:text-desktop-text prose-h2:mt-6 prose-h2:mb-2
                       prose-h3:text-[12px] prose-h3:font-medium
                       prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-desktop-text
                       prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline
                       prose-strong:text-desktop-text prose-strong:font-semibold
                       prose-li:text-[13px]
                       prose-code:text-[11px] prose-code:bg-desktop-border/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                       prose-hr:border-desktop-border"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-desktop-text-secondary">
            <p className="text-sm">No projects yet.</p>
            <p className="text-[11px] mt-1 opacity-60">
              Edit <code className="text-[10px] bg-desktop-border/30 px-1 py-0.5 rounded">src/content/projects.md</code> to add content.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        Document
      </div>
    </div>
  );
}
