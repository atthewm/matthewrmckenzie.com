// WHOOP SPLITS DATA
export interface WhoopSplit {
  slug: string;
  displayName: string;
  sillyFileName: string;
  shareUrl: string;
  description: string;
  sortOrder: number;
}

export const whoopSplits: WhoopSplit[] = [
  {
    slug: "arms-abs",
    displayName: "Arms & Abs",
    sillyFileName: "GunsAndGuts.whoop",
    shareUrl: "https://share.whoop.com/workout/share?sharedWorkoutId=613a0e1b-c9f7-4396-872b-8e04caf88677",
    description: "Curls for the girls, crunches for the brunches.",
    sortOrder: 1,
  },
  {
    slug: "back",
    displayName: "Back",
    sillyFileName: "BatCaveBack.whoop",
    shareUrl: "https://share.whoop.com/workout/share?sharedWorkoutId=53b2973a-cb92-43d7-8da2-23383f8374f4",
    description: "Building wings one row at a time.",
    sortOrder: 2,
  },
  {
    slug: "chest",
    displayName: "Chest",
    sillyFileName: "ChestDayLikeIts2009.whoop",
    shareUrl: "https://share.whoop.com/workout/share?sharedWorkoutId=b52c685d-fe7b-4b76-b755-5de68866c5cf",
    description: "Bench press and bad decisions since '09.",
    sortOrder: 3,
  },
  {
    slug: "legs",
    displayName: "Legs",
    sillyFileName: "LegsOfRegret.whoop",
    shareUrl: "https://share.whoop.com/workout/share?sharedWorkoutId=4e806f5d-e653-41ff-979e-8f9b41781726",
    description: "Tomorrow's stairs are today's problem.",
    sortOrder: 4,
  },
  {
    slug: "shoulders",
    displayName: "Shoulders",
    sillyFileName: "BoulderProtocol.whoop",
    shareUrl: "https://share.whoop.com/workout/share?sharedWorkoutId=d89643f5-0712-4b89-be38-045024134fb2",
    description: "Carrying the world, one OHP at a time.",
    sortOrder: 5,
  },
];

export function findSplitBySlug(slug: string): WhoopSplit | undefined {
  return whoopSplits.find((s) => s.slug === slug);
}

export function findSplitByFsId(fsId: string): WhoopSplit | undefined {
  const slug = fsId.replace("whoop-split-", "");
  return findSplitBySlug(slug);
}
