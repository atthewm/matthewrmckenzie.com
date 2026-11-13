// ============================================================================
// AQUA LOADING
// ============================================================================
// Skeleton for data panels: a label, an Aqua barber-pole progress bar and a
// few placeholder lines, so a loading panel never shows as a blank box.
// ============================================================================

export default function AquaLoading({ label, lines = 4 }: { label: string; lines?: number }) {
  return (
    <div className="flex flex-col gap-3 p-5" role="status" aria-live="polite">
      <p className="text-[14px] font-semibold text-desktop-text">{label}</p>
      <div className="aqua-progress" aria-hidden="true">
        <span />
      </div>
      <div className="flex flex-col gap-2 mt-2" aria-hidden="true">
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="aqua-skeleton-line" style={{ width: `${90 - ((i * 23) % 40)}%` }} />
        ))}
      </div>
    </div>
  );
}
