import type { ReactNode } from "react";

// One row of the reading layout: heading hung in columns 1 to 4, content in
// columns 5 to 11. Stacks on phones.

interface SiteRowProps {
  id?: string;
  heading?: ReactNode;
  /** Markdown heading HTML (inline tags and entities). Wins over heading. */
  headingHtml?: string;
  note?: ReactNode;
  /** Use columns 5 to 12 instead of 5 to 11. */
  wide?: boolean;
  children: ReactNode;
}

export default function SiteRow({ id, heading, headingHtml, note, wide = false, children }: SiteRowProps) {
  const hasHead = Boolean(heading || headingHtml || note);
  return (
    <section id={id} className="site-grid site-row">
      {hasHead ? (
        <div className="col-head">
          {headingHtml ? (
            <h2 className="site-row-head" dangerouslySetInnerHTML={{ __html: headingHtml }} />
          ) : heading ? (
            <h2 className="site-row-head">{heading}</h2>
          ) : null}
          {note ? <p className="site-row-note">{note}</p> : null}
        </div>
      ) : null}
      <div className={wide ? "col-wide" : "col-body"}>{children}</div>
    </section>
  );
}
