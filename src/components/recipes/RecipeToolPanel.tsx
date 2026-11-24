"use client";

import { useEffect, useRef } from "react";
import { CalendarClock, Columns2 } from "lucide-react";
import { BakePlanner } from "./BakePlanner";
import { BrownieComparison } from "./BrownieComparison";
import { toolForRecipe } from "./kitchenTools";
import css from "./KitchenTools.module.css";

export function RecipeToolPanel({ slug }: { slug: string }) {
  const tool = toolForRecipe(slug);
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    function openFromLink() {
      if (tool && window.location.hash === `#${tool.id}` && details.current) details.current.open = true;
    }
    openFromLink();
    window.addEventListener("hashchange", openFromLink);
    return () => window.removeEventListener("hashchange", openFromLink);
  }, [tool]);
  if (!tool) return null;

  const isPlanner = tool.id === "bake-by-sunday";
  const Icon = isPlanner ? CalendarClock : Columns2;
  return (
    <details ref={details} id={tool.id} className={css.disclosure}>
      <summary>
        <Icon size={18} aria-hidden="true" />
        <span>{tool.title}</span>
        <span className={css.plus} aria-hidden="true" />
      </summary>
      <div className={css.panelBody}>{isPlanner ? <BakePlanner embedded /> : <BrownieComparison embedded />}</div>
    </details>
  );
}
