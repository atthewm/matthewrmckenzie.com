// ============================================================================
// RECIPE INDEX
// ============================================================================
// Canonical list of all recipes with metadata extracted from frontmatter.
// ============================================================================

export interface RecipeMeta {
  slug: string;
  title: string;
  subtitle: string;
  yield: string;
  totalTime: string;
  tags: string[];
  filePath: string;
}

export const recipes: RecipeMeta[] = [
  {
    slug: "rye-starter",
    title: "Rye Starter",
    subtitle: "6-day rye starter build plus a low-waste daily maintenance plan",
    yield: "Makes about 175 g starter",
    totalTime: "6 days",
    tags: ["bread", "sourdough", "starter", "rye"],
    filePath: "recipes/rye-starter.md",
  },
  {
    slug: "city-loaf-master-recipe",
    title: "City Loaf Master Recipe",
    subtitle: "Two 950 g loaves baked in a Dutch oven",
    yield: "Makes two 950 g loaves",
    totalTime: "Day 1 + Day 2 (with optional overnight cold retard)",
    tags: ["bread", "sourdough", "city loaf", "dutch oven"],
    filePath: "recipes/city-loaf-master-recipe.md",
  },
  {
    slug: "strawberry-jam-honey",
    title: "Strawberry Jam with Honey",
    subtitle: "No refined sugar, thickened naturally (optional chia)",
    yield: "About 2 cups (estimated)",
    totalTime: "About 30 to 45 minutes",
    tags: ["jam", "fruit", "honey", "no refined sugar"],
    filePath: "recipes/strawberry-jam-honey.md",
  },
  {
    slug: "cinnamon-protein-overnight-oats",
    title: "Cinnamon Protein Overnight Oats",
    subtitle: "1 serving, thicker texture, revised liquid ratio",
    yield: "1 serving",
    totalTime: "6 to 12 hours (overnight)",
    tags: ["breakfast", "oats", "high protein", "meal prep"],
    filePath: "recipes/cinnamon-protein-overnight-oats.md",
  },
  {
    slug: "brownies-9x13",
    title: "Brownies (9x13)",
    subtitle: "Recipe card version, English walnuts",
    yield: "1 pan (9x13)",
    totalTime: "TBD",
    tags: ["dessert", "brownies", "baking"],
    filePath: "recipes/brownies-9x13.md",
  },
  {
    slug: "high-protein-heirloom-blue-corn-tortillas",
    title: "High-Protein Heirloom Blue Corn Tortillas",
    subtitle: "High-protein tortillas using blue corn masa, wheat flour, and vital wheat gluten",
    yield: "19 tortillas (42 to 45 g each)",
    totalTime: "TBD",
    tags: ["tortillas", "high protein", "meal prep"],
    filePath: "recipes/high-protein-heirloom-blue-corn-tortillas.md",
  },
  {
    slug: "mamas-healthy-meatballs",
    title: "Mama's Healthy Meatballs",
    subtitle: "Lean, high-protein meatballs with beef, lamb, and venison",
    yield: "~12 large meatballs",
    totalTime: "TBD",
    tags: ["meatballs", "high protein", "dinner"],
    filePath: "recipes/mamas-healthy-meatballs.md",
  },
  {
    slug: "parmesan-crusted-baked-chicken-tenders",
    title: "Parmesan Crusted Baked Chicken Tenders",
    subtitle: "Higher-protein baked tenders with Parmesan crust",
    yield: "~20 tenders (from 2 lb)",
    totalTime: "TBD",
    tags: ["chicken", "high protein", "dinner"],
    filePath: "recipes/parmesan-crusted-baked-chicken-tenders.md",
  },
];

export function getRecipeBySlug(slug: string): RecipeMeta | undefined {
  return recipes.find((r) => r.slug === slug);
}
