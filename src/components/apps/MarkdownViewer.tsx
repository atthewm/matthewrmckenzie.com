"use client";

import React from "react";

// ============================================================================
// MARKDOWN VIEWER
// ============================================================================
// Renders pre-processed HTML from markdown content inside windows.
// Used by documents and apps that show markdown content.
// ============================================================================

interface MarkdownViewerProps {
  html: string;
  className?: string;
}

export default function MarkdownViewer({ html, className = "" }: MarkdownViewerProps) {
  return (
    <div
      className={`
        prose prose-sm dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h1:text-xl prose-h1:mb-3 prose-h1:mt-0
        prose-h2:text-lg prose-h2:mb-2
        prose-h3:text-base
        prose-p:text-sm prose-p:leading-relaxed
        prose-li:text-sm
        prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline
        prose-code:text-xs prose-code:bg-desktop-border/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-hr:border-desktop-border
        p-5
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
