import { BakePlanner } from "@/components/recipes/BakePlanner";
import { BrownieComparison } from "@/components/recipes/BrownieComparison";

export function BakePlannerApp() {
  return <div className="p-4 sm:p-5"><BakePlanner /></div>;
}

export function BrownieComparisonApp() {
  return <div className="p-4 sm:p-5"><BrownieComparison /></div>;
}
