"use client";

import React from "react";

// ============================================================================
// ABOUT APP
// ============================================================================
// The "About" window. Content is passed as pre-rendered HTML.
// ============================================================================

interface AboutAppProps {
  contentHtml?: string;
}

export default function AboutApp({ contentHtml }: AboutAppProps) {
  if (!contentHtml) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                          flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            MM
          </div>
          <div>
            <h1 className="text-lg font-semibold text-desktop-text">Matthew McKenzie</h1>
            <p className="text-sm text-desktop-text-secondary">Builder · Thinker · Maker</p>
          </div>
        </div>
        <p className="text-sm text-desktop-text-secondary leading-relaxed">
          This is a placeholder. Edit <code className="text-xs bg-desktop-border/50 px-1 py-0.5 rounded">src/content/about.md</code> to add your real content.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
                        flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          MM
        </div>
        <div>
          <h1 className="text-lg font-semibold text-desktop-text">Matthew McKenzie</h1>
          <p className="text-sm text-desktop-text-secondary">Builder · Thinker · Maker</p>
        </div>
      </div>
      <div
        className="prose prose-sm dark:prose-invert max-w-none
                   prose-h1:hidden prose-h2:text-base prose-h3:text-sm
                   prose-p:text-sm prose-p:leading-relaxed
                   prose-a:text-desktop-accent"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
