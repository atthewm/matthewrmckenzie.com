// ============================================================================
// AFFILIATION ROW
// ============================================================================

const affiliations = [
  { name: "Menlo Equities", href: "https://www.menloequities.com" },
  { name: "Civitas Capital Group", href: "https://civitascapital.com" },
  { name: "SMU", href: "https://www.smu.edu" },
  { name: "Villanova", href: "https://www1.villanova.edu" },
];

export default function AffiliationRow() {
  return (
    <div className="mt-12 pt-6 border-t" style={{ borderColor: "var(--site-rule)" }}>
      <p className="site-eyebrow mb-3">Affiliations</p>
      <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
        {affiliations.map((a) => (
          <a
            key={a.name}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-display text-[17px] hover:underline"
            style={{ color: "var(--site-muted)" }}
          >
            {a.name}
          </a>
        ))}
      </div>
    </div>
  );
}
