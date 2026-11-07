"use client";

import { useState } from "react";
import { brands, type BrandKey } from "@/config/brands";

// Shows a brand's official logo, or its name in text if the file is missing.
export default function BrandLogo({ brand, height = 24 }: { brand: BrandKey; height?: number }) {
  const b = brands[brand];
  const [failed, setFailed] = useState(false);

  return (
    <a
      href={b.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center rounded border border-desktop-border bg-white px-3 py-2"
      aria-label={b.name}
    >
      {failed ? (
        <span className="text-xs font-semibold text-neutral-900">{b.name}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={b.logo}
          alt={b.name}
          style={{ height, width: "auto" }}
          onError={() => setFailed(true)}
        />
      )}
    </a>
  );
}
