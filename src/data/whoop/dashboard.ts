// WHOOP DASHBOARD DATA
export interface WhoopStat {
  label: string;
  value: string;
  unit?: string;
  group: string;
  iconKey: string;
}

export interface WhoopScreenshot {
  id: string;
  label: string;
  path: string;
}

export const whoopReferral = {
  joinUrl: "https://join.whoop.com/D800AE2E",
  communityCode: "COMM-C60682",
};

export const whoopScreenshots: WhoopScreenshot[] = [
  { id: "profile", label: "Profile", path: "/health/whoop/raw/profile.jpg" },
  { id: "data-highlights", label: "Data Highlights", path: "/health/whoop/raw/data-highlights.jpg" },
  { id: "activity-summary", label: "Activity Summary", path: "/health/whoop/raw/activity-summary.jpg" },
  { id: "whoop-age", label: "WHOOP Age", path: "/health/whoop/raw/whoop-age.jpg" },
  { id: "volume-load", label: "Volume Load", path: "/health/whoop/raw/volume-load.jpg" },
];

export const whoopStats: WhoopStat[] = [
  { label: "Level", value: "14", group: "profile", iconKey: "Award" },
  { label: "Recoveries", value: "230", group: "profile", iconKey: "RefreshCw" },
  { label: "WHOOP Age", value: "27.5", group: "profile", iconKey: "Timer" },
  { label: "Years Younger", value: "10.1", group: "profile", iconKey: "TrendingDown" },
  { label: "Day Streak", value: "232", unit: "days", group: "profile", iconKey: "Flame" },
  { label: "Member Since", value: "June 2025", group: "profile", iconKey: "Calendar" },
  { label: "Best Sleep", value: "100", unit: "%", group: "highlights", iconKey: "Moon" },
  { label: "Peak Recovery", value: "99", unit: "%", group: "highlights", iconKey: "Heart" },
  { label: "Max Strain", value: "20.2", group: "highlights", iconKey: "Zap" },
  { label: "70%+ Sleep", value: "90", unit: "days", group: "streaks", iconKey: "Moon" },
  { label: "Green Recovery", value: "7", unit: "days", group: "streaks", iconKey: "Heart" },
  { label: "10+ Strain", value: "66", unit: "days", group: "streaks", iconKey: "Zap" },
  { label: "Lowest RHR", value: "38", unit: "bpm", group: "notable", iconKey: "HeartPulse" },
  { label: "Highest RHR", value: "53", unit: "bpm", group: "notable", iconKey: "HeartPulse" },
  { label: "Lowest HRV", value: "32", unit: "ms", group: "notable", iconKey: "Activity" },
  { label: "Highest HRV", value: "73", unit: "ms", group: "notable", iconKey: "Activity" },
  { label: "Max Heart Rate", value: "183", unit: "bpm", group: "notable", iconKey: "Heart" },
  { label: "Longest Sleep", value: "9:37", unit: "hr", group: "notable", iconKey: "Moon" },
  { label: "Lowest Recovery", value: "29", unit: "%", group: "notable", iconKey: "AlertTriangle" },
  { label: "Total Activities", value: "545", group: "activity", iconKey: "BarChart3" },
  { label: "Walking", value: "115x", unit: "avg 5.2", group: "activity", iconKey: "Footprints" },
  { label: "Weightlifting", value: "92x", unit: "avg 5.2", group: "activity", iconKey: "Dumbbell" },
  { label: "Strength Trainer", value: "90x", unit: "avg 11.7", group: "activity", iconKey: "Dumbbell" },
  { label: "Avg Volume Load", value: "24,560", unit: "lb", group: "strength", iconKey: "TrendingUp" },
  { label: "vs Prior Month", value: "+13", unit: "%", group: "strength", iconKey: "ArrowUp" },
  { label: "Pace of Aging", value: "0.3x", unit: "Slow", group: "aging", iconKey: "Clock" },
];

export const statGroups = [
  { key: "profile", label: "Profile" },
  { key: "highlights", label: "Data Highlights" },
  { key: "streaks", label: "Streaks" },
  { key: "notable", label: "Notable Stats" },
  { key: "activity", label: "Activity Summary" },
  { key: "strength", label: "Strength Training" },
  { key: "aging", label: "Pace of Aging" },
];
