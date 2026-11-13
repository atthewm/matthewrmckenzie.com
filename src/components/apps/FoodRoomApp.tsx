"use client";

import FoodRoom from "@/components/food-room/FoodRoom";
import "@/styles/food-room.css";

// ============================================================================
// FOOD ROOM (desktop and phone window)
// ============================================================================
// The same room as /food-room. Diet data only: nothing from WHOOP, Eight Sleep
// or Apple Health is shown here.
// ============================================================================

export default function FoodRoomApp() {
  return (
    <div className="site site-embedded h-full overflow-auto px-4 py-4">
      <p className="text-[14px] mb-3 text-desktop-text-secondary">
        The foods I eat most, from my Notion meal log. Tap a food for its stats, drag one onto
        another to make a plate, and open the board for the charts.
      </p>
      <FoodRoom />
    </div>
  );
}
