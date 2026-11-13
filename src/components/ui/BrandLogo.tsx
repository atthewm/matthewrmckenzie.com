import type { CSSProperties } from "react";
import { brands, type BrandKey } from "@/config/brands";

// Shows a brand's official logo as a link to the brand. Both files are in the
// HTML; CSS shows the one that matches the site theme (Light or Dark), so the
// logo follows the theme switch rather than only the system setting.
export default function BrandLogo({ brand }: { brand: BrandKey }) {
  const b = brands[brand];
  return (
    <a href={b.href} target="_blank" rel="noopener noreferrer" className="brand-logo" aria-label={`${b.name} website`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.light.src}
        alt={`${b.name} logo`}
        width={b.light.width}
        height={b.light.height}
        loading="lazy"
        decoding="async"
        className="brand-logo-img is-light"
        style={{ height: b.light.displayHeight } as CSSProperties}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={b.dark.src}
        alt={`${b.name} logo`}
        width={b.dark.width}
        height={b.dark.height}
        loading="lazy"
        decoding="async"
        className="brand-logo-img is-dark"
        style={{ height: b.dark.displayHeight } as CSSProperties}
      />
    </a>
  );
}
