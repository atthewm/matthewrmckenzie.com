import SiteRow from "@/components/site/SiteRow";

// ============================================================================
// AFFILIATION ROW
// ============================================================================
// Each employer carries its period so a past role never reads as current.

interface Affiliation {
  readonly name: string;
  readonly href: string;
  readonly period?: string;
}

const affiliations: readonly Affiliation[] = [
  { name: "Menlo Equities", href: "https://www.menloequities.com", period: "2026 to present" },
  { name: "Civitas Capital Group", href: "https://civitascapital.com", period: "previously, 2016 to 2026" },
  { name: "SMU", href: "https://www.smu.edu" },
  { name: "Villanova", href: "https://www1.villanova.edu" },
];

export default function AffiliationRow() {
  return (
    <SiteRow heading="Affiliations">
      <ul className="site-affiliations">
        {affiliations.map((a) => (
          <li key={a.name}>
            <a href={a.href} target="_blank" rel="noopener noreferrer" className="site-affiliation-name">
              {a.name}
            </a>
            {a.period ? <span className="site-affiliation-period">{a.period}</span> : null}
          </li>
        ))}
      </ul>
    </SiteRow>
  );
}
