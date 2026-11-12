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
    <div className="mt-12 pt-6 border-t" style={{ borderColor: "var(--site-rule)" }}>
      <p className="site-eyebrow mb-3">Affiliations</p>
      <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
        {affiliations.map((a) => (
          <span key={a.name} className="inline-flex items-baseline gap-x-2">
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="site-display text-[17px] hover:underline"
              style={{ color: "var(--site-muted)" }}
            >
              {a.name}
            </a>
            {a.period ? (
              <span className="text-[12px]" style={{ color: "var(--site-muted)" }}>
                {a.period}
              </span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
