// ============================================================================
// AFFILIATION ROW — visual proof strip
// ============================================================================
// Displays affiliations/associations in a clean horizontal row.
// Text-based for now; swap in SVG logos when available.
// ============================================================================

const affiliations = [
  { name: "Civitas Capital Group", href: "https://civitascapital.com" },
  { name: "Remote Coffee", href: "https://www.remotecoffee.com" },
  { name: "SMU", href: "https://www.smu.edu" },
  { name: "Villanova", href: "https://www1.villanova.edu" },
];

export default function AffiliationRow() {
  return (
    <div className="mt-10 pt-6 border-t border-desktop-border">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-desktop-text-secondary mb-3">
        Affiliations
      </p>
      <div className="flex items-center gap-6 flex-wrap">
        {affiliations.map((a) => (
          <a
            key={a.name}
            href={a.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-desktop-text-secondary hover:text-desktop-text transition-colors"
          >
            {a.name}
          </a>
        ))}
      </div>
    </div>
  );
}
