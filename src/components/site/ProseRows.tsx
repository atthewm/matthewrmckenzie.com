import type { ReactNode } from "react";
import { splitProse } from "@/lib/prose";
import PageHead from "./PageHead";
import SiteRow from "./SiteRow";

// ============================================================================
// PROSE ROWS
// ============================================================================
// Lays out one markdown page: the h1 becomes the page title, the opening
// paragraphs sit in the reading column, and every h2 section becomes a row
// with its heading hung on the left. The HTML is this repo's own markdown.
// ============================================================================

interface ProseRowsProps {
  html: string;
  eyebrow?: ReactNode;
  /** Small note shown in the left columns next to the intro. */
  introNote?: ReactNode;
  /** Extra rows after the markdown sections. */
  children?: ReactNode;
}

export default function ProseRows({ html, eyebrow, introNote, children }: ProseRowsProps) {
  const { title, intro, sections } = splitProse(html);

  return (
    <article>
      {title ? <PageHead eyebrow={eyebrow} titleHtml={title} /> : null}
      <div>
        {intro ? (
          <SiteRow note={introNote}>
            <div className="site-prose site-prose-intro" dangerouslySetInnerHTML={{ __html: intro }} />
          </SiteRow>
        ) : null}
        {sections.map((section) => (
          <SiteRow key={section.id} id={section.id} headingHtml={section.heading}>
            <div className="site-prose" dangerouslySetInnerHTML={{ __html: section.html }} />
          </SiteRow>
        ))}
        {children}
      </div>
    </article>
  );
}
