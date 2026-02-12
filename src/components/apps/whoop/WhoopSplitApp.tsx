"use client";

import React, { useState, useCallback } from "react";
import { findSplitByFsId, type WhoopSplit } from "@/data/whoop/splits";
import type { FSItem } from "@/data/fs";

// ============================================================================
// WHOOP SPLIT FILE VIEWER
// ============================================================================
// Opens a .whoop "file" showing the split name, description, and share link.
// ============================================================================

interface WhoopSplitAppProps {
  contentHtml?: string;
  fsItem?: FSItem;
}

function SplitContent({ split }: { split: WhoopSplit }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(split.shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [split.shareUrl]);

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0d1b2a 0%, #091219 100%)",
        color: "#e0e0e0",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-5">
        {/* File icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #00f19b 0%, #00b4e6 100%)",
            boxShadow: "0 4px 20px rgba(0,241,155,0.2)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L6 22" /><path d="M18 2L18 22" />
            <path d="M6 12H18" /><path d="M6 7H18" /><path d="M6 17H18" />
          </svg>
        </div>

        {/* Split name */}
        <div>
          <h2 className="text-lg font-bold text-white">{split.displayName}</h2>
          <p className="text-xs text-gray-400 mt-1 font-mono">{split.sillyFileName}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 max-w-xs italic">
          &ldquo;{split.description}&rdquo;
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full max-w-[220px]">
          <a
            href={split.shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 rounded-md text-sm font-medium text-center text-black transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(180deg, #00f19b 0%, #00c77d 100%)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            Open in WHOOP
          </a>
          <button
            onClick={handleCopy}
            className="w-full py-2 rounded-md text-sm font-medium transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 py-2 text-center">
        <p className="text-[9px] text-gray-600">WHOOP Strength Trainer Split</p>
      </div>
    </div>
  );
}

export default function WhoopSplitApp({ fsItem }: WhoopSplitAppProps) {
  if (!fsItem) {
    return (
      <div className="p-5 text-sm text-desktop-text-secondary">
        Split data not found.
      </div>
    );
  }

  const split = findSplitByFsId(fsItem.id);
  if (!split) {
    return (
      <div className="p-5 text-sm text-desktop-text-secondary">
        Unknown split: {fsItem.id}
      </div>
    );
  }

  return <SplitContent split={split} />;
}
