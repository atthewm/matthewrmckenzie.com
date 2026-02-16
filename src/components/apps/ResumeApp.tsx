"use client";

import React from "react";

// ============================================================================
// RESUME APP - Monospace Terminal Style
// ============================================================================
// An ironic, monospace-styled resume display. Tongue-in-cheek tone,
// presented like a terminal printout.
// ============================================================================

export default function ResumeApp() {
  return (
    <div
      className="h-full overflow-auto p-5"
      style={{
        fontFamily: '"SF Mono", "Fira Code", "Cascadia Code", "JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
        fontSize: "12px",
        lineHeight: 1.7,
        color: "var(--desktop-text)",
        backgroundColor: "var(--desktop-surface)",
      }}
    >
      <pre className="whitespace-pre-wrap">
{`RESUME.txt
==========================================================
Matthew McKenzie
matthew.mckenzie@mac.com
==========================================================

STATUS:     Employed, not looking
LOCATION:   Texas, USA
VIBE:       Building things that work

----------------------------------------------------------
EXPERIENCE
----------------------------------------------------------

Senior Product Manager / Fractional CPO
Various startups, 2018 - present
- Shipped products used by actual humans
- Wrote specs that engineers mostly agreed with
- Survived multiple pivots with sense of humor intact

Product & Growth, Earlier Chapters
2012 - 2018
- Cut teeth on SaaS, marketplaces, and mobile
- Learned that "move fast and break things" has limits
- Got good at saying "no" to feature requests

----------------------------------------------------------
SKILLS
----------------------------------------------------------

Product:    Strategy, roadmaps, user research, analytics
Technical:  Enough to be dangerous (Next.js, TS, SQL)
Soft:       Clear writing, honest feedback, calm in chaos
Other:      Makes very good coffee. Lifts heavy things.

----------------------------------------------------------
EDUCATION
----------------------------------------------------------

University of Texas at Austin
- Studied what interested me
- Graduated

----------------------------------------------------------
INTERESTS
----------------------------------------------------------

Strength training, electronic music, cooking,
reading about history, building side projects,
long walks with no particular destination.

----------------------------------------------------------
REFERENCES
----------------------------------------------------------

Available upon request, but honestly, just email me
and we can talk like normal people.

==========================================================
EOF`}
      </pre>
    </div>
  );
}
