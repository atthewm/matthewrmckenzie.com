import type { ReactNode } from "react";

// One homepage chapter: number and heading in columns 1 to 4, a few sentences
// and a link in columns 5 to 11, and a data element across the full width.

interface ChapterProps {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
  links: ReactNode;
  data: ReactNode;
}

export default function Chapter({ id, number, title, children, links, data }: ChapterProps) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} className="chapter" aria-labelledby={headingId} data-chapter>
      <div className="site-wrap">
        <div className="site-grid chapter-grid" data-chapter-rise>
          <header className="col-head chapter-head">
            <p className="site-eyebrow">
              <span className="site-num">{number}</span>
            </p>
            <h2 id={headingId} className="site-h2">
              {title}
            </h2>
          </header>
          <div className="col-body chapter-body">
            <div className="chapter-text">{children}</div>
            <p className="chapter-links">{links}</p>
          </div>
          <div className="chapter-data">{data}</div>
        </div>
      </div>
    </section>
  );
}
