"use client";

import React from "react";

// ============================================================================
// MARKDOWN VIEWER (ryOS Document Viewer)
// ============================================================================
// Renders pre-processed HTML from markdown content inside windows.
// Includes a subtle toolbar and footer bar like classic Mac document apps.
// ============================================================================

interface MarkdownViewerProps {
  html: string;
  className?: string;
  title?: string;
}

export default function MarkdownViewer({ html, className = "", title }: MarkdownViewerProps) {
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
          {title || "Document"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div
          className={`
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
            px-6 py-5
            ${className}
          `}
          dangerouslySetInnerHTML={{ __html: html }}
        />
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
