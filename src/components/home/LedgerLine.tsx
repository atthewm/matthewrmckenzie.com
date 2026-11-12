import { milestones } from "./milestones";

// A thin horizontal ledger line with the career milestones from resume.md.
// The line and entries are in their final state in the markup; HomeMotion
// draws the line left to right with scrub when motion is allowed.

export default function LedgerLine() {
  return (
    <div className="ledger" data-ledger>
      <div className="ledger-rule" aria-hidden="true">
        <span className="ledger-rule-line" data-ledger-line />
      </div>
      <ol className="ledger-entries">
        {milestones.map((m) => (
          <li key={`${m.year}-${m.role}`} className={m.current ? "ledger-entry is-current" : "ledger-entry"} data-ledger-entry>
            <span className="ledger-tick" aria-hidden="true" />
            <span className="ledger-year site-num">{m.year}</span>
            <span className="ledger-role">{m.role}</span>
            <span className="ledger-firm">{m.firm}</span>
            <span className="ledger-period site-num">{m.period}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
