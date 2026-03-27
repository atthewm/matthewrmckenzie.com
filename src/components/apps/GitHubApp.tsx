"use client";

import React, { useState } from "react";
import { ExternalLink, GitFork, Star, Code2, Bot, Server, Coffee, Gamepad2, Globe } from "lucide-react";

// ============================================================================
// GITHUB APP - Public Repositories Showcase
// ============================================================================

type RepoCategory = "all" | "mcp" | "bots" | "projects";

interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  languageColor: string;
  category: RepoCategory[];
  icon: React.ReactNode;
  stars?: number;
  license?: string;
  updated: string;
}

const repos: Repo[] = [
  {
    name: "toast-mcp-server",
    description: "MCP server for the Toast restaurant platform. Safe, read-oriented AI access to menus, orders, and restaurant operations.",
    url: "https://github.com/atthewm/toast-mcp-server",
    language: "TypeScript",
    languageColor: "#3178c6",
    category: ["mcp"],
    icon: <Server size={14} />,
    license: "MIT",
    updated: "Mar 2026",
  },
  {
    name: "toast-teams-bot",
    description: "Microsoft Teams bot for Toast restaurant operations. Queries menus, orders, and system health via the Toast MCP Server.",
    url: "https://github.com/atthewm/toast-teams-bot",
    language: "TypeScript",
    languageColor: "#3178c6",
    category: ["bots"],
    icon: <Bot size={14} />,
    license: "MIT",
    updated: "Mar 2026",
  },
  {
    name: "marginedge-mcp-server",
    description: "MCP server for MarginEdge restaurant back-office platform. AI-accessible data layer for invoices, recipes, and operations.",
    url: "https://github.com/atthewm/marginedge-mcp-server",
    language: "TypeScript",
    languageColor: "#3178c6",
    category: ["mcp"],
    icon: <Server size={14} />,
    updated: "Mar 2026",
  },
  {
    name: "marginedge-teams-bot",
    description: "Microsoft Teams bot for MarginEdge restaurant back-office. AI assistant for invoices, food costs, and vendor management.",
    url: "https://github.com/atthewm/marginedge-teams-bot",
    language: "TypeScript",
    languageColor: "#3178c6",
    category: ["bots"],
    icon: <Bot size={14} />,
    updated: "Mar 2026",
  },
  {
    name: "matthewrmckenzie.com",
    description: "Personal website built as a Mac OS X Panther desktop environment. Next.js 15, TypeScript, Tailwind CSS.",
    url: "https://github.com/atthewm/matthewrmckenzie.com",
    language: "TypeScript",
    languageColor: "#3178c6",
    category: ["projects"],
    icon: <Globe size={14} />,
    updated: "Mar 2026",
  },
  {
    name: "cosmos-collector",
    description: "Download all images and videos from your cosmos.so boards. Headless, fast, with LLM-ready batches.",
    url: "https://github.com/atthewm/cosmos-collector",
    language: "Python",
    languageColor: "#3572A5",
    category: ["projects"],
    icon: <Code2 size={14} />,
    license: "MIT",
    updated: "Mar 2026",
  },
  {
    name: "snowcraft-remake",
    description: "Snowcraft browser game remake. Rebuilt from the ground up in TypeScript.",
    url: "https://github.com/atthewm/snowcraft-remake",
    language: "TypeScript",
    languageColor: "#3178c6",
    category: ["projects"],
    icon: <Gamepad2 size={14} />,
    updated: "Feb 2026",
  },
  {
    name: "snowcraft",
    description: "Original Snowcraft game.",
    url: "https://github.com/atthewm/snowcraft",
    language: "",
    languageColor: "#888",
    category: ["projects"],
    icon: <Gamepad2 size={14} />,
    updated: "Feb 2026",
  },
];

const filters: { label: string; value: RepoCategory }[] = [
  { label: "All", value: "all" },
  { label: "MCP Servers", value: "mcp" },
  { label: "Teams Bots", value: "bots" },
  { label: "Projects", value: "projects" },
];

export default function GitHubApp() {
  const [activeFilter, setActiveFilter] = useState<RepoCategory>("all");

  const filtered = activeFilter === "all"
    ? repos
    : repos.filter((r) => r.category.includes(activeFilter));

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 h-[28px] border-b text-[10px]"
        style={{
          borderColor: "var(--desktop-border)",
          background: "var(--desktop-surface-raised)",
        }}
      >
        <span className="text-desktop-text-secondary font-medium uppercase tracking-wider">
          Repositories
        </span>
        <span className="text-desktop-text-secondary/50 ml-auto">{filtered.length} repos</span>
      </div>

      {/* Header */}
      <div className="shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #24292e 0%, #40464d 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          >
            <GitFork size={16} className="text-white" />
          </div>
          <div>
            <a
              href="https://github.com/atthewm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold text-desktop-text hover:underline"
            >
              @atthewm
            </a>
            <p className="text-[10px] text-desktop-text-secondary">
              MCP servers, Teams bots, and other projects
            </p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
              style={{
                background: activeFilter === f.value ? "var(--desktop-accent)" : "rgba(0,0,0,0.04)",
                color: activeFilter === f.value ? "#fff" : "var(--desktop-text-secondary)",
                border: `1px solid ${activeFilter === f.value ? "var(--desktop-accent)" : "var(--desktop-border)"}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Repo list */}
      <div className="flex-1 overflow-auto px-5 pb-4">
        <div className="space-y-2">
          {filtered.map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-3 hover:bg-desktop-accent/5 transition-colors group"
              style={{ borderColor: "var(--desktop-border)" }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 text-desktop-text-secondary group-hover:text-desktop-accent transition-colors"
                >
                  {repo.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-desktop-accent truncate">
                      {repo.name}
                    </span>
                    <ExternalLink
                      size={10}
                      className="text-desktop-text-secondary/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-[11px] text-desktop-text-secondary leading-snug mt-0.5">
                    {repo.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    {repo.language && (
                      <span className="flex items-center gap-1 text-[10px] text-desktop-text-secondary">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ background: repo.languageColor }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.license && (
                      <span className="text-[10px] text-desktop-text-secondary">
                        {repo.license}
                      </span>
                    )}
                    <span className="text-[10px] text-desktop-text-secondary/60 ml-auto">
                      {repo.updated}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
      >
        github.com/atthewm
      </div>
    </div>
  );
}
