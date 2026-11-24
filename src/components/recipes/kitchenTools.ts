export const CITY_LOAF = "city-loaf-master-recipe";
export const BROWNIE_V3 = "brownies-v3-cocoa-honey-browned-butter";
export const BROWNIE_V4 = "brownies-v4";

export const kitchenTools = [
  { id: "bake-by-sunday", title: "Bake by Sunday", slug: CITY_LOAF },
  { id: "compare-brownies", title: "Compare Brownies", slug: BROWNIE_V4 },
] as const;

export function toolForRecipe(slug: string) {
  return kitchenTools.find((tool) => tool.slug === (slug === BROWNIE_V3 ? BROWNIE_V4 : slug));
}
