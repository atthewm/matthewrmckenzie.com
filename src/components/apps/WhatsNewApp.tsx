"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Sparkles, Wrench, Bug, Palette } from "lucide-react";

// ============================================================================
// WHAT'S NEW APP - Changelog for McKenzie OS
// ============================================================================

type ChangeType = "feature" | "fix" | "polish" | "tool";

interface Change {
  text: string;
  type: ChangeType;
}

interface Release {
  version: string;
  date: string;
  title: string;
  changes: Change[];
}

const changeIcon: Record<ChangeType, React.ReactNode> = {
  feature: <Sparkles size={10} className="text-green-500" />,
  fix: <Bug size={10} className="text-red-400" />,
  polish: <Palette size={10} className="text-purple-400" />,
  tool: <Wrench size={10} className="text-blue-400" />,
};

const releases: Release[] = [
  {
    version: "2.6",
    date: "Mar 27, 2026",
    title: "GitHub & Link Bio",
    changes: [
      { text: "GitHub Projects app — filterable showcase of all public repos", type: "feature" },
      { text: "Link Bio upgrade — sectioned links page with Social, Projects, and Connect", type: "feature" },
      { text: "Updated About bio with MCP and AI operations work", type: "polish" },
      { text: "Terminal commands: github, gh, repos, links, bio", type: "tool" },
      { text: "GitHub app on desktop icons and Start Here explore row", type: "polish" },
      { text: "Links app added to dock for easy discovery", type: "polish" },
    ],
  },
  {
    version: "2.5",
    date: "Mar 25, 2026",
    title: "Security & SEO Hardening",
    changes: [
      { text: "Security headers: nosniff, DENY, referrer policy, permissions policy", type: "tool" },
      { text: "Noscript fallback for crawlers on JS-only homepage", type: "fix" },
      { text: "ProfilePage schema, AI crawler rules in robots.txt", type: "tool" },
      { text: "AVIF/WebP image optimization enabled", type: "polish" },
      { text: "Missing UrlShortenerApp component causing build failure", type: "fix" },
    ],
  },
  {
    version: "2.4",
    date: "Mar 13, 2026",
    title: "Dock Reorg, Sound Effects & Shut Down",
    changes: [
      { text: "Dock trimmed to essentials — games, recipes, health moved to desktop icons", type: "polish" },
      { text: "Sound effects via Web Audio — close, minimize sounds (toggleable)", type: "feature" },
      { text: "Shut Down in Apple menu with fadeout animation and auto-reboot", type: "feature" },
      { text: "Start Here redesigned with quick-access grid and keyboard shortcut tips", type: "polish" },
      { text: "Remote Coffee — hidden menu in Secrets folder, discoverable via Terminal", type: "feature" },
      { text: "Chess Queen movement bug and missing default return fixed", type: "fix" },
    ],
  },
  {
    version: "2.3",
    date: "Mar 13, 2026",
    title: "Exposé, Spotlight, Chess & Minesweeper",
    changes: [
      { text: "Exposé (F9) — bird's-eye view of all open windows", type: "feature" },
      { text: "Spotlight (Cmd+Space) — global search to find and open any app", type: "feature" },
      { text: "Genie minimize animation when minimizing windows to dock", type: "feature" },
      { text: "Draggable desktop icons with localStorage persistence", type: "feature" },
      { text: "Chess — full rules engine with minimax AI (depth 3, alpha-beta pruning)", type: "feature" },
      { text: "Minesweeper — 3 difficulties, flood reveal, chord click, timer", type: "feature" },
    ],
  },
  {
    version: "2.2",
    date: "Mar 13, 2026",
    title: "iChat, Photo Booth & Context Menus",
    changes: [
      { text: "iChat — AI chatbot powered by Claude Haiku", type: "feature" },
      { text: "Photo Booth — webcam app with 8 retro effects and snapshot capture", type: "feature" },
      { text: "Right-click context menu with Panther frosted glass styling", type: "feature" },
      { text: "Startup chime — synthesized F-major chord on boot", type: "feature" },
      { text: "Keyboard shortcuts: Cmd+N, Cmd+comma, Cmd+H", type: "tool" },
      { text: "Panther PNG icons for iChat and Photo Booth", type: "polish" },
    ],
  },
  {
    version: "2.1",
    date: "Mar 11, 2026",
    title: "Deep Polish Pass",
    changes: [
      { text: "SEO: meta completeness, single H1, OG image, sitemap dates", type: "tool" },
      { text: "Fix app name mismatches, standardize terminology", type: "fix" },
      { text: "Fill in TBD cook times, remove duplicate recipe sections", type: "fix" },
      { text: "Reorder resume with current roles first", type: "polish" },
      { text: "Expand now.md with actual current focuses", type: "polish" },
    ],
  },
  {
    version: "2.0",
    date: "Mar 9, 2026",
    title: "Video Backgrounds & Flying Toasters",
    changes: [
      { text: "Flying Toasters screensaver (After Dark) with sprite animation", type: "feature" },
      { text: "18 ambient video backgrounds (WebM + MP4 with poster fallback)", type: "feature" },
      { text: "Sound toggle for video themes with localStorage persistence", type: "feature" },
      { text: "Theme picker with poster thumbnails in Settings", type: "polish" },
    ],
  },
  {
    version: "1.0",
    date: "Feb 2026",
    title: "Initial Release",
    changes: [
      { text: "Mac OS X 10.3 Panther desktop environment", type: "feature" },
      { text: "Draggable, resizable windows with minimize/maximize", type: "feature" },
      { text: "Dock with magnification effect", type: "feature" },
      { text: "Boot sequence with Mac startup animation", type: "feature" },
      { text: "Apps: About, Work, Contact, Photos, Music, Videos, Recipes, Health, Terminal, Stickies, and more", type: "feature" },
      { text: "Dark mode + Panther Aqua theme", type: "feature" },
      { text: "Authentic Panther PNG icon set", type: "polish" },
    ],
  },
];

function ReleaseCard({ release, defaultOpen }: { release: Release; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--desktop-border)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-desktop-accent/5 transition-colors"
      >
        {open ? (
          <ChevronDown size={12} className="text-desktop-text-secondary shrink-0" />
        ) : (
          <ChevronRight size={12} className="text-desktop-text-secondary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-semibold text-desktop-text">
              v{release.version}
            </span>
            <span className="text-[11px] text-desktop-text-secondary truncate">
              {release.title}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-desktop-text-secondary/60 shrink-0">
          {release.date}
        </span>
      </button>

      {open && (
        <div
          className="px-3.5 pb-3 pt-0.5 border-t"
          style={{ borderColor: "var(--desktop-border)" }}
        >
          <div className="space-y-1 mt-1.5">
            {release.changes.map((change, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] leading-snug">
                <span className="mt-0.5 shrink-0">{changeIcon[change.type]}</span>
                <span className="text-desktop-text">{change.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatsNewApp() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 h-[28px] flex items-center px-3 border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "var(--desktop-surface-raised)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Changelog
        </span>
        <span className="text-desktop-text-secondary/50 ml-auto">{releases.length} releases</span>
      </div>

      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3">
        <h2 className="text-[15px] font-semibold text-desktop-text">
          What&apos;s New
        </h2>
        <p className="text-[11px] text-desktop-text-secondary mt-0.5">
          Release history for McKenzie OS
        </p>

        {/* Legend */}
        <div className="flex gap-3 mt-2.5">
          {(["feature", "fix", "polish", "tool"] as ChangeType[]).map((t) => (
            <span key={t} className="flex items-center gap-1 text-[9px] text-desktop-text-secondary capitalize">
              {changeIcon[t]} {t}
            </span>
          ))}
        </div>
      </div>

      {/* Releases */}
      <div className="flex-1 overflow-auto px-5 pb-4">
        <div className="space-y-2">
          {releases.map((r, i) => (
            <ReleaseCard key={r.version} release={r} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
      >
        McKenzie OS Changelog
      </div>
    </div>
  );
}
