"use client";

import React from "react";

// ============================================================================
// HOBBIES APP
// ============================================================================
// Specs come from the tennis racket spec log in Notion (measured 2026-08-20).
// Tensions and lead placement aren't recorded there, so they aren't shown.
// ============================================================================

interface SpecRow {
  label: string;
  value: string;
  note?: string;
}

const frameSpecs: SpecRow[] = [
  { label: "Head size", value: "100 in²", note: "645 cm²" },
  { label: "Stock weight", value: "315 g", note: "printed on the frame" },
  { label: "Playing weight", value: "344 g", note: "strung, weighted, with dampener" },
  { label: "Added weight", value: "About 29 g", note: "over stock, lead plus strings" },
  { label: "Balance", value: "310 mm" },
  { label: "Pattern", value: "16 × 20" },
  { label: "Length", value: "27 in", note: "685 mm" },
];

const stringSetup: SpecRow[] = [
  { label: "String", value: "Babolat VS Team BT7", note: "natural gut" },
  { label: "Gauge", value: "17", note: "1.25 mm" },
  { label: "Configuration", value: "Full bed", note: "gut mains and crosses" },
  { label: "Mains tension", value: "56 lbs" },
  { label: "Crosses tension", value: "54 lbs" },
  { label: "Manufacturer range", value: "48 to 57 lbs" },
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

function Hobby({
  emoji,
  title,
  children,
  first,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={first ? "mb-6" : "mb-6 pt-5"}
      style={first ? undefined : { borderTop: "1px solid var(--desktop-border)" }}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[15px]" aria-hidden="true">
          {emoji}
        </span>
        <h2 className="text-title font-semibold text-desktop-text">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function HobbiesApp() {
  return (
    <div className="h-full overflow-auto bg-desktop-surface p-5">
      <h1 className="text-[17px] font-semibold text-desktop-text mb-1">Hobbies</h1>
      <p className="text-2xs text-desktop-text-secondary mb-5">
        Training, tennis, the kitchen, music and a camera.
      </p>

      <Hobby emoji="🏋️" title="Training" first>
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Strength work and classes at the gym, tracked with WHOOP. The
          splits, recovery and sleep numbers are on the Health and Fitness page.
        </p>
      </Hobby>

      <Hobby emoji="🎾" title="Tennis">
        <p className="text-2xs leading-relaxed text-desktop-text-secondary mb-4">
          I play in Austin. The frame is
          weighted up from stock, and the string bed is a hybrid: natural gut mains
          for feel and tension hold, polyester crosses for control and durability.
        </p>

        <div className="mb-4">
          <SectionHeading>Frame: Head Graphene Pro</SectionHeading>
          <SpecTable rows={frameSpecs} />
        </div>

        <div>
          <SectionHeading>String setup</SectionHeading>
          <SpecTable rows={stringSetup} />
        </div>
      </Hobby>

      <Hobby emoji="🍞" title="Cooking and baking">
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Sourdough from my own rye starter, a city loaf, jams, and high protein
          versions of the things I actually want to eat. Every method is written down
          in Cooking and Baking so the results repeat.
        </p>
      </Hobby>

      <Hobby emoji="🎧" title="DJing and music">
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Learning to mix on a Pioneer DDJ-800 in rekordbox, starting from the
          basics: beatmatching, phrasing and clean transitions.
        </p>
      </Hobby>

      <Hobby emoji="💿" title="Rematch">
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Years ago iTunes Match scrambled the tags on my lossless library, so
          songs showed up under the wrong artist, album and genre. Rematch is the
          tool I built in Python to fix it. It ignores the old tags, identifies
          every file by its audio fingerprint against MusicBrainz, and sends the
          few it can&apos;t settle to a review queue. It never touches the audio
          and works on a copy, so the originals stay safe.
        </p>
        <p className="mt-2 text-2xs leading-relaxed text-desktop-text-secondary">
          The result: 11,936 tracks in a clean library, 8,956 of them corrected.
        </p>
      </Hobby>

      <Hobby emoji="📷" title="Photography">
        <p className="text-2xs leading-relaxed text-desktop-text-secondary">
          Studied photography alongside economics at SMU. Back behind a proper camera,
          shooting a new city.
        </p>
      </Hobby>
    </div>
  );
}
