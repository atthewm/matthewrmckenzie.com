"use client";

import Link from "next/link";
import { useState } from "react";
import { BROWNIE_V3, BROWNIE_V4 } from "./kitchenTools";
import css from "./KitchenTools.module.css";

const ingredients = [
  ["Granulated sugar", "180 g", "150 g"],
  ["All-purpose flour", "125 g", "65 g"],
  ["Rye flour", "None", "60 g"],
  ["Powdered sugar", "None", "About 15 g, dusted on after cooling"],
];
const shared = [
  ["Honey", "170 g", "170 g"],
  ["Dutch-process cocoa", "85 g", "85 g"],
  ["Unsalted butter", "85 g before browning", "85 g before browning"],
  ["Avocado oil", "72 g", "72 g"],
  ["Eggs", "200 g", "200 g"],
  ["Salt", "4.5 g", "4.5 g"],
  ["Vanilla", "8 g", "8 g"],
];
const method = [
  ["Mixing order", "Beat eggs and salt on low for 30 seconds, then add sugar and honey. Fold in cooled cocoa mixture and flour.", "Whisk sugar and honey into the warm cocoa mixture. Hand-whisk eggs in one at a time, then fold in the flour."],
  ["Bake at 300°F", "24 to 28 minutes", "22 to 26 minutes"],
  ["Finish", "Lift out immediately and cool 90 minutes.", "Lift out immediately, cool on a rack for 90 minutes, then dust with powdered sugar."],
];

export function BrownieComparison({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<"Ingredients" | "Method">("Ingredients");
  const [includeShared, setIncludeShared] = useState(false);
  const rows = view === "Method" ? method : includeShared ? [...ingredients, ...shared] : ingredients;
  return (
    <section className={css.tool} aria-label="Brownie version comparison">
      {!embedded && <h2 className={css.title}>Compare Brownies</h2>}
      <p className={css.intro}>Two versions from the kitchen notebook. Both make 24 brownies in a 9 × 13 inch pan.</p>
      <div className={css.filters} role="group" aria-label="Compare by">
        {(["Ingredients", "Method"] as const).map((choice) =>
          <button key={choice} type="button" aria-pressed={view === choice} onClick={() => setView(choice)}>{choice}</button>
        )}
      </div>
      {view === "Ingredients" && <label className={css.check}><input type="checkbox" checked={includeShared} onChange={(event) => setIncludeShared(event.target.checked)} />Show shared ingredients</label>}
      <table className={css.comparison}>
        <caption className="sr-only">{view} in brownies v3 and v4</caption>
        <thead><tr><th scope="col">{view === "Ingredients" ? "Ingredient" : "Step"}</th><th scope="col">v3 · Cocoa</th><th scope="col">v4 · Rye</th></tr></thead>
        <tbody>{rows.map(([label, oldVersion, newVersion]) =>
          <tr key={label}><th scope="row">{label}</th><td>{oldVersion}</td><td>{newVersion}</td></tr>
        )}</tbody>
      </table>
      <p className={css.footnote}>{view === "Ingredients" ? "Version 4 cuts cane sugar by 30 g and swaps in 60 g of rye. Total flour stays at 125 g." : "Version 4 moves the eggs later in the mix to limit aeration and starts checking the bake two minutes sooner."}</p>
      <nav className={css.sources} aria-label="Full brownie recipes">
        <Link href={`/recipes/${BROWNIE_V3}`}>Read the v3 recipe</Link>
        <Link href={`/recipes/${BROWNIE_V4}`}>Read the v4 recipe</Link>
      </nav>
    </section>
  );
}
