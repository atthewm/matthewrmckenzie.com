// Career milestones for the homepage ledger line. Every entry is taken from
// src/content/resume.md and src/content/work.md. Do not add anything that is
// not in those files. Civitas is a past employer (2016 to 2026); Menlo
// Equities is the current one (2026 to present).

export interface Milestone {
  readonly year: string;
  readonly role: string;
  readonly firm: string;
  readonly period: string;
  readonly current?: boolean;
}

export const milestones: readonly Milestone[] = [
  {
    year: "2016",
    role: "Investor Relations Analyst",
    firm: "Civitas Capital Group",
    period: "May 2016 to December 2018",
  },
  {
    year: "2019",
    role: "Investor Relations Associate",
    firm: "Civitas Capital Group",
    period: "January 2019 to December 2022",
  },
  {
    year: "2022",
    role: "Vice President, Investor Relations",
    firm: "Civitas Capital Group",
    period: "December 2022 to 2026",
  },
  {
    year: "2026",
    role: "Senior Vice President, Capital Formation",
    firm: "Menlo Equities",
    period: "2026 to present",
    current: true,
  },
];
