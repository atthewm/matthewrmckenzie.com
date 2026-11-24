"use client";

import { useEffect, useState } from "react";
import { cityLoafSchedule, nextSunday } from "./bakeSchedule";
import css from "./KitchenTools.module.css";

const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export function BakePlanner({ embedded = false }: { embedded?: boolean }) {
  const [finish, setFinish] = useState("");
  const [coldHours, setColdHours] = useState(10);
  const [extraBulk, setExtraBulk] = useState(0);
  useEffect(() => { setFinish(nextSunday(new Date())); }, []);

  const steps = cityLoafSchedule(finish, coldHours, extraBulk);
  const byDay = new Map<string, typeof steps>();
  for (const step of steps) {
    const day = dayFormat.format(step.time);
    const group = byDay.get(day) ?? [];
    group.push(step);
    byDay.set(day, group);
  }

  return (
    <section className={css.tool} aria-label="City Loaf bake planner">
      {!embedded && <h2 className={css.title}>Bake by Sunday</h2>}
      <p className={css.intro}>Choose when your second City Loaf should come out of the oven. All times are local.</p>
      <div className={css.fields}>
        <label className={css.deadline}>Second loaf out of the oven
          <input type="datetime-local" value={finish} onChange={(event) => setFinish(event.target.value)} />
        </label>
        <label>First loaf in the fridge
          <select value={coldHours} onChange={(event) => setColdHours(Number(event.target.value))}>
            <option value={0}>Skip overnight chill</option>
            {[8, 10, 12].map((hours) => <option key={hours} value={hours}>{hours} hours</option>)}
          </select>
        </label>
        <label>Bulk fermentation
          <select value={extraBulk} onChange={(event) => setExtraBulk(Number(event.target.value))}>
            <option value={0}>4 hours</option><option value={30}>4 hours 30 minutes</option><option value={60}>5 hours</option>
          </select>
        </label>
      </div>
      {steps.length ? (
        <>
          <p className={css.planCaption} role="status">
            Start {dayFormat.format(steps[0].time)} at {timeFormat.format(steps[0].time)}.
          </p>
          {[...byDay].map(([day, entries]) => (
            <div key={day} className={css.day}>
              <h3>{day}</h3>
              <ol>{entries.map((entry) => (
                <li key={entry.title}>
                  <time dateTime={entry.time.toISOString()}>{timeFormat.format(entry.time)}</time>
                  <div><strong>{entry.title}</strong><p>{entry.note}</p></div>
                </li>
              ))}</ol>
            </div>
          ))}
          <p className={css.footnote}>Allow about eight hours for the first day, including handling and any extra proof. The recipe recommends up to 12 hours in the fridge, with a 15-hour maximum. Watch the dough as well as the clock.</p>
        </>
      ) : <p className={css.planCaption} role="status">Choose a valid local date and time to see your schedule.</p>}
    </section>
  );
}
