"use client";

import React from "react";
import { Briefcase, Heart, UtensilsCrossed, Mail } from "lucide-react";
import { useDesktop } from "@/hooks/useDesktopStore";
import { findFSItem } from "@/data/fs";

// ============================================================================
// START HERE APP (Mac OS X 10.3 Panther Style)
// ============================================================================
// 2x2 card grid that opens key sections of the OS.
// ============================================================================

const cards = [
  { id: "work", label: "Work", desc: "Projects and case studies", icon: Briefcase, color: "#8B5E34" },
  { id: "health", label: "Health", desc: "WHOOP metrics and workouts", icon: Heart, color: "#D32F2F" },
  { id: "recipes", label: "Recipes", desc: "Tried and true from the kitchen", icon: UtensilsCrossed, color: "#E65100" },
  { id: "contact", label: "Contact", desc: "Get in touch", icon: Mail, color: "#2A6FA8" },
];

export default function StartHereApp() {
  const { openItem } = useDesktop();

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
          Start Here
        </span>
      </div>

      {/* Card grid */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-2 gap-4 max-w-[360px] w-full">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => {
                  const item = findFSItem(card.id);
                  if (item) openItem(item);
                }}
                className="flex flex-col items-center gap-2 p-5 rounded-lg
                           text-desktop-text transition-all duration-150
                           hover:shadow-md active:scale-[0.98]"
                style={{
                  background: "var(--desktop-surface)",
                  border: "1px solid var(--desktop-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.color }}
                >
                  <Icon size={20} color="white" />
                </div>
                <span className="text-[13px] font-semibold">{card.label}</span>
                <span className="text-[10px] text-desktop-text-secondary text-center leading-tight">
                  {card.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="shrink-0 h-[22px] flex items-center justify-center border-t text-[10px] text-desktop-text-secondary"
        style={{
          borderColor: "var(--desktop-border)",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        Welcome to McKenzie OS
      </div>
    </div>
  );
}
