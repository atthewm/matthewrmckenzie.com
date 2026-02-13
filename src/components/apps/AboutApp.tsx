"use client";

import React from "react";

// ============================================================================
// ABOUT APP (ryOS "About This Mac" Style)
// ============================================================================

interface AboutAppProps {
  contentHtml?: string;
}

export default function AboutApp({ contentHtml }: AboutAppProps) {
  return (
    <div className="flex flex-col h-full">
      {/* System info header */}
      <div
        className="shrink-0 px-6 pt-6 pb-4 text-center border-b"
        style={{ borderColor: "var(--desktop-border)" }}
      >
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold"
          style={{
            background: "linear-gradient(135deg, #7eb8da 0%, #5080a8 100%)",
            boxShadow: "0 3px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          MM
        </div>

        <h1 className="text-base font-semibold text-desktop-text mt-3">McKenzie OS</h1>
        <p className="text-[11px] text-desktop-text-secondary mt-0.5">
          Version 2.0 &middot; Matthew McKenzie
        </p>

        <div
          className="mt-3 mx-auto max-w-[320px] rounded-lg px-4 py-2.5 text-[10px] leading-relaxed"
          style={{ background: "rgba(0,0,0,0.03)", border: "1px solid var(--desktop-border)" }}
        >
          <div className="flex justify-between">
            <span className="text-desktop-text-secondary">Processor</span>
            <span className="text-desktop-text font-medium">Curiosity-Driven</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-desktop-text-secondary">Memory</span>
            <span className="text-desktop-text font-medium">Always Learning</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-desktop-text-secondary">Stack</span>
            <span className="text-desktop-text font-medium">Next.js &middot; TypeScript</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-desktop-text-secondary">Status</span>
            <span className="font-medium" style={{ color: "var(--desktop-accent)" }}>Online</span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {contentHtml ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none
                       prose-h1:hidden prose-h2:text-[11px] prose-h2:font-semibold prose-h2:uppercase prose-h2:tracking-wider prose-h2:text-desktop-text-secondary prose-h2:mt-5 prose-h2:mb-2
                       prose-h3:text-sm prose-h3:font-medium
                       prose-p:text-[13px] prose-p:leading-relaxed prose-p:text-desktop-text
                       prose-a:text-desktop-accent prose-a:no-underline hover:prose-a:underline
                       prose-li:text-[13px]
                       prose-code:text-[11px] prose-code:bg-desktop-border/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p className="text-sm text-desktop-text-secondary leading-relaxed">
            Builder &middot; Thinker &middot; Maker
          </p>
        )}
      </div>
    </div>
  );
}
