"use client";

import WhoopDashboardApp from "@/components/apps/whoop/WhoopDashboardApp";
import NutritionApp from "@/components/apps/NutritionApp";
import TopFoodsApp from "@/components/apps/TopFoodsApp";

// ============================================================================
// HEALTH PANELS (/health)
// ============================================================================
// The desktop dashboards, each in an inset Aqua panel with a fixed height so
// the page never jumps while a feed loads. Each app draws its own skeleton
// and error state.
// ============================================================================

const panels = [
  { id: "training", title: "Training and recovery", height: 640, App: WhoopDashboardApp },
  { id: "nutrition", title: "Nutrition", height: 640, App: NutritionApp },
  { id: "top-foods", title: "Top foods", height: 600, App: TopFoodsApp },
];

export default function HealthPanels() {
  return (
    <div className="mt-10 grid gap-8" style={{ gridTemplateColumns: "minmax(0, 1fr)" }}>
      {panels.map(({ id, title, height, App }) => (
        <section key={id} aria-labelledby={`panel-${id}`}>
          <h2 id={`panel-${id}`} className="site-section-title">{title}</h2>
          <div className="aqua-panel mt-3" style={{ height }}>
            <App />
          </div>
        </section>
      ))}
    </div>
  );
}
