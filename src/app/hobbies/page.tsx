import type { Metadata } from "next";
import StaticPageLayout from "@/components/ui/StaticPageLayout";
import HobbiesApp from "@/components/apps/HobbiesApp";

export const metadata: Metadata = {
  title: "Hobbies",
  description: "Training, tennis, cooking and baking, DJing, photography and Rematch, a tool I built to fix my iTunes library.",
  alternates: { canonical: "https://matthewrmckenzie.com/hobbies" },
};

export default function HobbiesPage() {
  return (
    <StaticPageLayout>
      <div className="-m-5">
        <HobbiesApp />
      </div>
    </StaticPageLayout>
  );
}
