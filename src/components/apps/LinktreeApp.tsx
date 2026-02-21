"use client";

import React from "react";
import { ExternalLink, Linkedin, Github, Calendar, Mail, Instagram } from "lucide-react";

// ============================================================================
// LINKTREE APP - Internal Links Hub
// ============================================================================
// Native links page replacing the iframe embed (blocked by X-Frame-Options).
// Lists key links with an option to open the external link hub.
// ============================================================================

const links = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/mrmckenzie/", icon: Linkedin, description: "Connect professionally" },
  { label: "GitHub", href: "https://github.com/atthewm", icon: Github, description: "Code and projects" },
  { label: "Instagram", href: "https://www.instagram.com/mrem/", icon: Instagram, description: "Photos" },
  { label: "Schedule a Call", href: "https://cal.com/mattmck/site", icon: Calendar, description: "Book a meeting" },
  { label: "Email", href: "mailto:matthew.mckenzie@mac.com", icon: Mail, description: "Get in touch" },
];

export default function LinktreeApp() {
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
          Links
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-5">
        <div className="max-w-[360px] mx-auto">
          <h2
            className="text-[15px] font-semibold mb-1"
            style={{ color: "var(--desktop-text)" }}
          >
            Matthew McKenzie
          </h2>
          <p className="text-[11px] text-desktop-text-secondary mb-5">
            All links in one place
          </p>

          <div className="space-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg border
                           hover:bg-desktop-accent/5 transition-colors group"
                style={{ borderColor: "var(--desktop-border)" }}
              >
                <link.icon
                  size={16}
                  className="text-desktop-text-secondary group-hover:text-desktop-accent transition-colors shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-desktop-text">
                    {link.label}
                  </p>
                  <p className="text-[10px] text-desktop-text-secondary">
                    {link.description}
                  </p>
                </div>
                <ExternalLink
                  size={11}
                  className="text-desktop-text-secondary/40 shrink-0"
                />
              </a>
            ))}
          </div>

          {/* External link hub fallback */}
          <div className="mt-6 pt-4 border-t" style={{ borderColor: "var(--desktop-border)" }}>
            <a
              href="https://mckm.at/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded text-[12px] font-medium
                         bg-desktop-accent text-white hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={12} />
              Open Link Hub
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center px-3 border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        Links
      </div>
    </div>
  );
}
