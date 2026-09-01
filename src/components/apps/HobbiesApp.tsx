"use client";

import React from "react";

// ============================================================================
// HOBBIES APP
// ============================================================================
// Tennis first, with the real frame and string setup. Specs are sourced from
// the tennis racket spec log in Notion (measured 2026-08-20), not estimated.
// ============================================================================

interface SpecRow {
  label: string;
  value: string;
  note?: string;
}

const frameSpecs: SpecRow[] = [
  { label: "Head size", value: "100 in²", note: "645 cm²" },
  { label: "Weight, printed", value: "315 g" },
  { label: "Weight, strung", value: "344 g", note: "measured, with dampener" },
  { label: "Weight, unstrung", value: "~322 g", note: "estimated" },
  { label: "Balance", value: "310 mm" },
  { label: "Beam", value: "22 mm" },
  { label: "Pattern", value: "16 × 20" },
  { label: "Length", value: "27 in", note: "685 mm" },
];

const stringSetup: SpecRow[] = [
  { label: "String", value: "Babolat VS Team BT7", note: "natural gut" },
  { label: "Gauge", value: "17", note: "1.25 mm" },
  { label: "Configuration", value: "Full bed", note: "gut mains and crosses" },
  { label: "Mains tension", value: "56 lbs" },
  { label: "Crosses tension", value: "54 lbs" },
  { label: "Manufacturer range", value: "48 – 57 lbs" },
  { label: "Overgrip", value: "Wilson Pro", note: "comfort" },
];

function SpecTable({ rows }: { rows: SpecRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="flex items-baseline gap-3 py-1.5"
          style={{
            borderBottom:
              i === rows.length - 1 ? "none" : "1px solid var(--desktop-border)",
          }}
        >
          <span className="text-2xs text-desktop-text-secondary w-36 shrink-0">
            {row.label}
          </span>
          <span className="text-title font-medium text-desktop-text">{row.value}</span>
          {row.note && (
            <span className="text-3xs text-desktop-text-secondary ml-auto shrink-0">
              {row.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-3xs font-bold uppercase tracking-wider text-desktop-text-secondary mb-2">
      {children}
    </p>
  );
}

export default function HobbiesApp() {
  return (
    <div className="h-full overflow-auto bg-desktop-surface p-5">
      <h1 className="text-[17px] font-semibold text-desktop-text mb-1">Hobbies</h1>
      <p className="text-2xs text-desktop-text-secondary mb-5">
        The things that keep me sharp outside the desk.
      </p>

      {/* -- Tennis -- */}
      <section className="mb-6">
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[15px]" aria-hidden="true">
            🎾
          </span>
          <h2 className="text-title font-semibold text-desktop-text">Tennis</h2>
          <span className="text-3xs text-desktop-text-secondary ml-auto">
            Casual and social
          </span>
        </div>

        <p className="text-2xs leading-relaxed text-desktop-text-secondary mb-4">
          I play social tennis, which means I optimize the setup for tension retention
          rather than power. A dead string bed is the thing that actually ruins a
          match, so the current build is a full natural gut bed. It holds tension far
          longer than any polyester, and gut on gut does not saw itself apart the way a
          gut and poly hybrid does.
        </p>

        <div className="mb-4">
          <SectionHeading>Frame — Head Graphene Pro</SectionHeading>
          <SpecTable rows={frameSpecs} />
        </div>

        <div className="mb-3">
          <SectionHeading>Current string setup</SectionHeading>
          <SpecTable rows={stringSetup} />
        </div>

        <p className="text-3xs leading-relaxed text-desktop-text-secondary italic">
          Expected service life at casual frequency is 20 to 30+ hours with minimal
          tension drop, roughly double what a poly-containing bed gives. Gut&apos;s real
          enemy is moisture, not play, so the frame never rides in a hot car.
        </p>
      </section>

      {/* -- Baking -- */}
      <section
        className="mb-6 pt-5"
        style={{ borderTop: "1px solid var(--desktop-border)" }}
      >
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[15px]" aria-hidden="true">
            🍞
          </span>
          <h2 className="text-title font-semibold text-desktop-text">Baking</h2>
        </div>
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Rye starter, city loaf, and a rotating set of jams and high protein
          experiments. The full method for each is in the Recipes folder, written down
          properly so the results repeat.
        </p>
      </section>

      {/* -- Photography -- */}
      <section
        className="pt-5"
        style={{ borderTop: "1px solid var(--desktop-border)" }}
      >
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[15px]" aria-hidden="true">
            📷
          </span>
          <h2 className="text-title font-semibold text-desktop-text">Photography</h2>
        </div>
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Studied photography alongside economics at SMU. Recently back behind a proper
          camera, shooting a new city.
        </p>
      </section>
    </div>
  );
}
