"use client";

import React from "react";
import { Mail, Linkedin, Github, ExternalLink } from "lucide-react";

// ============================================================================
// CONTACT APP (ryOS Address Book Style)
// ============================================================================

export default function ContactApp() {
  const links = [
    { icon: Mail, label: "Email", href: "mailto:matthew.mckenzie@mac.com", display: "matthew.mckenzie@mac.com" },
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/mrmckenzie/", display: "linkedin.com/in/mrmckenzie" },
    { icon: Github, label: "GitHub", href: "https://github.com/atthewm", display: "github.com/atthewm" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header card */}
      <div
        className="shrink-0 px-5 pt-5 pb-4 flex items-center gap-4 border-b"
        style={{ borderColor: "var(--desktop-border)" }}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, #7bc89a 0%, #5aad7d 100%)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25)",
            border: "1.5px solid rgba(255,255,255,0.2)",
          }}
        >
          MM
        </div>
        <div>
          <h1 className="text-sm font-semibold text-desktop-text">Matthew McKenzie</h1>
          <p className="text-[11px] text-desktop-text-secondary mt-0.5">
            The best way to reach me is by email.
          </p>
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-auto">
        {links.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="flex items-center gap-3 px-5 py-3 transition-colors duration-100
                       hover:bg-desktop-accent/5 group"
            style={{
              borderBottom: i < links.length - 1 ? "1px solid var(--desktop-border)" : undefined,
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid var(--desktop-border)",
              }}
            >
              <link.icon size={16} className="text-desktop-text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-desktop-text">{link.label}</div>
              <div className="text-[11px] text-desktop-accent truncate">{link.display}</div>
            </div>
            <ExternalLink
              size={12}
              className="text-desktop-text-secondary/0 group-hover:text-desktop-text-secondary/60 transition-all shrink-0"
            />
          </a>
        ))}
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center border-t text-[10px] text-desktop-text-secondary"
        style={{ borderColor: "var(--desktop-border)", background: "rgba(0,0,0,0.02)" }}
      >
        {links.length} contact{links.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
