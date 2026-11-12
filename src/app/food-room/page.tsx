import type { Metadata } from "next";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import PageHead from "@/components/site/PageHead";
import FoodRoom from "@/components/food-room/FoodRoom";
import "@/styles/food-room.css";

// Public, but kept out of search engines (noindex) and out of the sitemap.
// Diet only: nothing from WHOOP, Eight Sleep or Apple Health belongs here.
export const metadata: Metadata = {
  title: "Food Room",
  description: "The foods Matthew McKenzie eats most, as characters on a table, with a board of charts on favorites, protein per calorie and where to improve.",
  alternates: { canonical: "https://matthewrmckenzie.com/food-room" },
  robots: { index: false, follow: false },
};

export default function FoodRoomPage() {
  return (
    <StaticPageLayout>
      <PageHead
        eyebrow="From my Notion food log"
        title="Food Room"
        lede="The foods I eat most, from my Notion meal log. Walk around the room, tap a food for its stats, drag one onto another to make a plate, and open the board for the charts."
      />
      <FoodRoom />
    </StaticPageLayout>
  );
}
