import type { ReactNode } from "react";

// Page head for inner pages: small label, title in the display face, and an
// optional lede. The title spans the wide columns; rows below hang their
// headings in columns 1 to 4.

interface PageHeadProps {
  eyebrow?: ReactNode;
  /** Plain text title. Use titleHtml for markdown headings with inline tags. */
  title?: string;
  titleHtml?: string;
  lede?: ReactNode;
  children?: ReactNode;
}

export default function PageHead({ eyebrow, title, titleHtml, lede, children }: PageHeadProps) {
  return (
    <header className="site-grid page-head">
      {eyebrow ? <p className="site-eyebrow">{eyebrow}</p> : null}
      {titleHtml ? (
        <h1 className="site-title col-title" dangerouslySetInnerHTML={{ __html: titleHtml }} />
      ) : (
        <h1 className="site-title col-title">{title}</h1>
      )}
      {lede ? <p className="site-lede col-body">{lede}</p> : null}
      {children}
    </header>
  );
}
