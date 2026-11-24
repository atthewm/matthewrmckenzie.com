const MINUTE = 60_000;

export function localDateTime(date: Date) {
  const two = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}T${two(date.getHours())}:${two(date.getMinutes())}`;
}

export function nextSunday(now: Date) {
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
  sunday.setHours(12, 0, 0, 0);
  if (sunday <= now) sunday.setDate(sunday.getDate() + 7);
  return localDateTime(sunday);
}

export function cityLoafSchedule(outOfOven: string, coldHours: number, extraBulkMinutes: number) {
  const finish = new Date(outOfOven);
  if (Number.isNaN(finish.getTime()) || localDateTime(finish) !== outOfOven) return [];
  const at = (offset: number) => new Date(finish.getTime() + offset * MINUTE);

  // One Dutch oven, two consecutive 40-minute bakes. Preheating overlaps the proof.
  const loadFirst = -80;
  const basket = loadFirst - coldHours * 60;
  const bench = basket - 15 - 60;
  const bulk = bench - 240 - extraBulkMinutes;
  const feed = bulk - 15 - 45;
  const preheat = loadFirst - 60;
  const steps = [
    { offset: feed, title: "Feed starter and start autolyse", note: "Give the starter 45 minutes. Rest flour and water for 20 to 45 minutes during that time." },
    { offset: bulk - 15, title: "Mix the dough", note: "Work in the starter, remaining water and salt. Allow 15 minutes for mixing." },
    { offset: bulk, title: "Start bulk fermentation", note: "Cover the dough and let it rest for 45 minutes." },
    { offset: bulk + 45, title: "First fold", note: "Fold 4 to 5 times until the dough tightens. Cover for another 45 minutes." },
    { offset: bulk + 90, title: "Second fold", note: "Finish the 2½-hour bulk rest. Give it another 30 to 60 minutes if it needs more fermentation." },
    { offset: bench, title: "Divide and preshape", note: "Rest the rounds uncovered for 45 to 60 minutes. This schedule uses 60." },
    { offset: basket - 15, title: "Shape both loaves", note: "Dust the baskets and shape the two loaves. Allow 15 minutes for handling." },
    { offset: basket, title: coldHours ? "Refrigerate both baskets" : "Check proof and prepare to load", note: coldHours ? `Chill the first loaf for ${coldHours} hours. Keep the second in the fridge for its extra 40 minutes.` : "Skip the overnight chill. Check the dough before baking and adjust the target time if it needs a longer proof." },
    { offset: preheat, title: "Preheat the Dutch oven", note: "Heat the covered pot to 500°F for at least one hour." },
    { offset: loadFirst, title: "Load the first loaf", note: "Score, cover and lower the oven to 450°F. Bake covered for 20 minutes." },
    { offset: -60, title: "Uncover the first loaf", note: "Bake uncovered for another 20 minutes." },
    { offset: -40, title: "Take out loaf one and load loaf two", note: "Cool the first loaf on a rack. Keep the pot hot and cover the second loaf for 20 minutes." },
    { offset: -20, title: "Uncover the second loaf", note: "Finish with 20 minutes uncovered." },
    { offset: 0, title: "Second loaf out of the oven", note: "Transfer it to a rack. Both loaves are now baked." },
    { offset: 60, title: "Slice the second loaf", note: "Allow at least one hour of cooling before slicing." },
  ];

  return steps.sort((a, b) => a.offset - b.offset).map(({offset, title, note}) => ({ time: at(offset), title, note }));
}
