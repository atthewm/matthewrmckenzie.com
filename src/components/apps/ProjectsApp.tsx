"use client";

import React from "react";

// ============================================================================
// PROJECTS APP
// ============================================================================

interface ProjectsAppProps {
  contentHtml?: string;
}

export default function ProjectsApp({ contentHtml }: ProjectsAppProps) {
  if (!contentHtml) {
    return (
      <div className="p-5">
        <h1 className="text-lg font-semibold text-desktop-text mb-4">Projects</h1>
        <p className="text-sm text-desktop-text-secondary">
          Projects will appear here. Edit <code className="text-xs bg-desktop-border/50 px-1 py-0.5 rounded">src/content/projects.md</code> to add content.
        </p>
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none p-5
                 prose-h1:text-xl prose-h2:text-base
                 prose-p:text-sm prose-p:leading-relaxed
                 prose-a:text-desktop-accent prose-strong:text-desktop-text"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}
