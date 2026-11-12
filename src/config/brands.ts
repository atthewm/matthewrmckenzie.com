// ============================================================================
// BRAND LOGOS
// ============================================================================
// Official logos only, saved in public/brands/ exactly as the brands publish
// them. Do not redraw, trace or recolor them.
//
// WHOOP: from the "Download Logo & Icon" kit on WHOOP's design guidelines page,
//   https://developer.whoop.com/docs/developing/design-guidelines/
//   whoop.svg / whoop-dark.svg are the wordmark (black / white).
//   whoop-circle.svg / whoop-circle-dark.svg are the circle mark, for square
//   icon slots on the desktop.
// Eight Sleep: from the "Logos" folder of the press kit linked from
//   https://www.eightsleep.com/press/ ("logo black lockup.png" and
//   "logo white lockup.png"). The press kit has PNG and EPS only. The PNGs are
//   6678px and 18265px wide, so the copies here are scaled down to 800px wide
//   and are otherwise unchanged.
//
// "light" is the logo for light backgrounds, "dark" the one for dark mode.
// displayHeight evens out the two Eight Sleep files: the black one has
// transparent padding around the logo and the white one does not.
// ============================================================================

interface BrandLogoFile {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Rendered height in px. */
  readonly displayHeight: number;
}

interface Brand {
  readonly name: string;
  readonly href: string;
  readonly light: BrandLogoFile;
  readonly dark: BrandLogoFile;
}

export const brands = {
  whoop: {
    name: "WHOOP",
    href: "https://www.whoop.com/",
    light: { src: "/brands/whoop.svg", width: 200, height: 32, displayHeight: 18 },
    dark: { src: "/brands/whoop-dark.svg", width: 200, height: 32, displayHeight: 18 },
  },
  eightSleep: {
    name: "Eight Sleep",
    href: "https://www.eightsleep.com/",
    light: { src: "/brands/eightsleep.png", width: 800, height: 377, displayHeight: 42 },
    dark: { src: "/brands/eightsleep-dark.png", width: 800, height: 317, displayHeight: 32 },
  },
} as const satisfies Record<string, Brand>;

export type BrandKey = keyof typeof brands;

/** Official WHOOP circle mark for square icon slots. */
export const whoopCircle = {
  light: "/brands/whoop-circle.svg",
  dark: "/brands/whoop-circle-dark.svg",
} as const;
