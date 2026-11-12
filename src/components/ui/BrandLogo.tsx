import type { CSSProperties } from "react";
import { brands, type BrandKey } from "@/config/brands";

// Shows a brand's official logo as a link to the brand. The dark-mode file is
// used when the visitor's system is in dark mode.
export default function BrandLogo({ brand }: { brand: BrandKey }) {
  const b = brands[brand];
  const heights = {
    "--logo-h-light": `${b.light.displayHeight}px`,
    "--logo-h-dark": `${b.dark.displayHeight}px`,
  } as CSSProperties;

  return (
    <a href={b.href} target="_blank" rel="noopener noreferrer" className="brand-logo">
      <picture>
        <source
          srcSet={b.dark.src}
          media="(prefers-color-scheme: dark)"
          width={b.dark.width}
          height={b.dark.height}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.light.src}
          alt={`${b.name} logo`}
          width={b.light.width}
          height={b.light.height}
          loading="lazy"
          decoding="async"
          className="brand-logo-img"
          style={heights}
        />
      </picture>
    </a>
  );
}
