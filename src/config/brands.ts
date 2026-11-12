// Official brand logos live in public/brands/. Replace the files there with the
// marks downloaded from each brand's own design or press page. If a logo comes
// as PNG instead of SVG, change the path here and nothing else.
export const brands = {
  whoop: { name: "WHOOP", logo: "/brands/whoop.svg", href: "https://www.whoop.com/" },
  eightSleep: { name: "Eight Sleep", logo: "/brands/eight-sleep.svg", href: "https://www.eightsleep.com/" },
} as const;

export type BrandKey = keyof typeof brands;
