"use client";

import React from "react";
import { Mail, Linkedin, Github, ExternalLink } from "lucide-react";

// ============================================================================
// CONTACT APP
// ============================================================================

export default function ContactApp() {
  const links = [
    { icon: Mail, label: "Email", href: "mailto:matthew.mckenzie@mac.com", display: "matthew.mckenzie@mac.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/matthewrmckenzie/", display: "linkedin.com/in/matthewrmckenzie" },
    { icon: Github, label: "GitHub", href: "https://github.com/matthewrmckenzie", display: "github.com/matthewrmckenzie" },
  ];

  return (
    <div className="p-5">
      <h1 className="text-lg font-semibold text-desktop-text mb-1">Get in Touch</h1>
      <p className="text-sm text-desktop-text-secondary mb-6">
        The best way to reach me is by email. I try to respond within a few days.
      </p>

      <div className="space-y-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="flex items-center gap-3 p-3 rounded-xl
                       border border-desktop-border hover:border-desktop-accent/30
                       hover:bg-desktop-accent/5 transition-all duration-150 group"
          >
            <div className="w-9 h-9 rounded-lg bg-desktop-accent/10 flex items-center justify-center">
              <link.icon size={18} className="text-desktop-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-desktop-text">{link.label}</div>
              <div className="text-xs text-desktop-text-secondary truncate">{link.display}</div>
            </div>
            <ExternalLink size={14} className="text-desktop-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  );
}
