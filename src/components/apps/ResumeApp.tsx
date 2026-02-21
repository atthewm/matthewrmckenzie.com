"use client";

import React from "react";

// ============================================================================
// RESUME APP - Monospace Terminal Style
// ============================================================================
// A monospace-styled resume display presented like a terminal printout.
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
Capital Formation & Growth Strategy
matthew.mckenzie@mac.com
==========================================================

LOCATION:   Texas, USA
FOCUS:      Capital formation, growth strategy,
            real asset backed consumer platforms

----------------------------------------------------------
EXPERIENCE
----------------------------------------------------------

Vice President, Investor Relations
Civitas Capital Group
December 2022 - Present
- Capital formation for an alternative investment
  manager focused on U.S. real estate
- Manage relationships with family offices, UHNW
  investors, and institutional groups globally
- Work across both debt and equity structures

Investor Relations Associate
Civitas Capital Group
January 2019 - December 2022

Investor Relations Analyst
Civitas Capital Group
May 2016 - December 2018

Head of Capital Formation & Strategy
Remote Coffee (Part-time)
October 2025 - Present
- Growth strategy and capital formation for an
  early-stage consumer platform

----------------------------------------------------------
EDUCATION
----------------------------------------------------------

Southern Methodist University (SMU)
BSc, BA - Economics, Public Policy, Political Science,
Photography
2008 - 2012

Villanova University
Mechanical Engineering, Economics
2006 - 2008

----------------------------------------------------------
SKILLS
----------------------------------------------------------

Capital Formation, Investor Relations, Real Estate,
Deal Structuring, Business Development, Growth Strategy,
Underwriting, Platform Development

----------------------------------------------------------
LINKS
----------------------------------------------------------

LinkedIn:  linkedin.com/in/mrmckenzie
GitHub:    github.com/atthewm

==========================================================
EOF`}
      </pre>
    </div>
  );
}
