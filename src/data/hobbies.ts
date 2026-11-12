// ============================================================================
// HOBBIES DATA
// ============================================================================
// Specs come from the tennis racket spec log in Notion (measured 2026-08-20).
// Shared by the desktop Hobbies app and the /hobbies reading page.
// ============================================================================

export interface SpecRow {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
}

export const frameSpecs: readonly SpecRow[] = [
  { label: "Head size", value: "100 in²", note: "645 cm²" },
  { label: "Stock weight", value: "315 g", note: "printed on the frame" },
  { label: "Playing weight", value: "344 g", note: "strung, weighted, with dampener" },
  { label: "Added weight", value: "About 29 g", note: "over stock, lead plus strings" },
  { label: "Balance", value: "310 mm" },
  { label: "Pattern", value: "16 × 20" },
  { label: "Length", value: "27 in", note: "685 mm" },
];

export const stringSetup: readonly SpecRow[] = [
  { label: "String", value: "Babolat VS Team BT7", note: "natural gut" },
  { label: "Gauge", value: "17", note: "1.25 mm" },
  { label: "Configuration", value: "Full bed", note: "gut mains and crosses" },
  { label: "Mains tension", value: "56 lbs" },
  { label: "Crosses tension", value: "54 lbs" },
  { label: "Manufacturer range", value: "48 to 57 lbs" },
  { label: "Overgrip", value: "Wilson Pro", note: "comfort" },
];
