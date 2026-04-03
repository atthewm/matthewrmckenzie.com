"use client";

import React from "react";
import {
  ExternalLink,
  Linkedin,
  Github,
  Calendar,
  Mail,
  Instagram,
  Globe,
  Server,
  Bot,
  Link2,
  Coffee,
} from "lucide-react";

// ============================================================================
// LINKTREE APP - Link Bio Page
// ============================================================================
// Full link bio with sections: social, projects, tools.
// ============================================================================

interface LinkItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const socialLinks: LinkItem[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mrmckenzie/", icon: Linkedin, description: "Connect professionally" },
  { label: "GitHub", href: "https://github.com/atthewm", icon: Github, description: "Code and open source projects" },
  { label: "Instagram", href: "https://www.instagram.com/mrem/", icon: Instagram, description: "Photos and stories" },
];

const projectLinks: LinkItem[] = [
  { label: "Toast MCP Server", href: "https://github.com/atthewm/toast-mcp-server", icon: Server, description: "AI access to Toast restaurant platform" },
  { label: "Toast Teams Bot", href: "https://github.com/atthewm/toast-teams-bot", icon: Bot, description: "Teams bot for restaurant operations" },
  { label: "MarginEdge MCP Server", href: "https://github.com/atthewm/marginedge-mcp-server", icon: Server, description: "AI access to MarginEdge back-office" },
  { label: "MarginEdge Teams Bot", href: "https://github.com/atthewm/marginedge-teams-bot", icon: Bot, description: "Teams bot for invoices and food costs" },
  { label: "Cosmos Collector", href: "https://github.com/atthewm/cosmos-collector", icon: Globe, description: "Download cosmos.so boards headlessly" },
];

const actionLinks: LinkItem[] = [
  { label: "Schedule a Call", href: "https://cal.com/mattmck/site", icon: Calendar, description: "Book a meeting with me" },
  { label: "Email", href: "mailto:matthew.mckenzie@mac.com", icon: Mail, description: "matthew.mckenzie@mac.com" },
  { label: "URL Shortener", href: "https://mckm.at", icon: Link2, description: "mckm.at — my link shortener" },
  { label: "Remote Coffee", href: "https://www.remotecoffee.com", icon: Coffee, description: "The best coffee in Austin" },
];

function LinkSection({ title, links }: { title: string; links: LinkItem[] }) {
  return (
    <div className="mb-4">
      <h3
        className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 px-1"
        style={{ color: "var(--desktop-text-secondary)" }}
      >
        {title}
      </h3>
      <div className="space-y-1.5">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border
                       hover:bg-desktop-accent/5 transition-colors group"
            style={{ borderColor: "var(--desktop-border)" }}
          >
            <link.icon
              size={15}
              className="text-desktop-text-secondary group-hover:text-desktop-accent transition-colors shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-desktop-text">
                {link.label}
              </p>
              <p className="text-[10px] text-desktop-text-secondary truncate">
                {link.description}
              </p>
            </div>
            <ExternalLink
              size={10}
              className="text-desktop-text-secondary/30 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

export default function LinktreeApp() {
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
          Link Bio
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="max-w-[380px] mx-auto">
          {/* Profile header */}
          <div className="text-center mb-5">
            <img
              src="/headshot.jpg"
              alt="Matthew McKenzie"
              width={64}
              height={64}
              className="w-16 h-16 mx-auto rounded-full object-cover"
              style={{
                boxShadow: "0 3px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
            <h2
              className="text-[15px] font-semibold mt-2.5"
              style={{ color: "var(--desktop-text)" }}
            >
              Matthew McKenzie
            </h2>
            <p className="text-[11px] text-desktop-text-secondary mt-0.5 max-w-[280px] mx-auto leading-relaxed">
              Capital formation, growth strategy, and AI-powered tools for restaurant operations.
            </p>
          </div>

          <LinkSection title="Social" links={socialLinks} />
          <LinkSection title="Projects" links={projectLinks} />
          <LinkSection title="Connect" links={actionLinks} />
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "var(--desktop-surface-raised)" }}
      >
        mckm.at
      </div>
    </div>
  );
}
