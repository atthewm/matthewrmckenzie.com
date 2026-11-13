import { DAY_RESULT_LABEL, type DayResult } from "@/lib/nutrition";

const PILL: Record<DayResult, string> = {
  hit: "bg-[#22a06b]/15 text-[#15784e] dark:text-[#5fd39b]",
  missed: "bg-[#e8743b]/15 text-[#a64a1c] dark:text-[#f2a37c]",
  "in-progress": "bg-desktop-accent/10 text-desktop-text-secondary",
  "no-data": "bg-desktop-border/40 text-desktop-text-secondary",
};

export default function ResultPill({ result }: { result: DayResult }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium ${PILL[result]}`} data-allow-small>
      {DAY_RESULT_LABEL[result]}
    </span>
  );
}
