"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { stages, useKitchenTimers } from "@/components/kitchen/KitchenTimersProvider";
import styles from "./KitchenTimersApp.module.css";

function displayTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

export default function KitchenTimersApp() {
  const { runs, setRun, ring, toggleRing } = useKitchenTimers();
  const [now, setNow] = useState(Date.now);
  const ticking = Object.values(runs).some((run) => run && "end" in run);
  useEffect(() => {
    if (!ticking) return;
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [ticking]);

  return (
    <section className={styles.station} aria-label="City Loaf timers">
      <header className={styles.header}><p>City Loaf</p><h2>Kitchen timers</h2></header>
      {stages.map((stage) => {
        const run = runs[stage.id];
        const running = !!run && "end" in run;
        const done = !!run && "done" in run;
        const full = stage.minutes * 60000;
        const left = running ? Math.min(full, run.end - now) : run && "left" in run ? run.left : done ? 0 : full;
        const action = running ? "Pause" : done ? "Restart" : run ? "Resume" : "Start";
        return (
          <div className={styles.row} key={stage.id} role="group" aria-label={stage.label}>
            <div className={styles.reading}>
              <span className={styles.stage}>{stage.label}</span>
              <div role="timer" aria-label={stage.label + " remaining"} className={styles.digits}>{displayTime(left)}</div>
            </div>
            <button type="button" className={styles.toggle} onClick={() => {
              const current = Date.now();
              if (running) {
                const remaining = run.end - current;
                setRun(stage.id, remaining > 0 ? { left: remaining } : { done: true, acknowledged: false });
              } else {
                setNow(current);
                setRun(stage.id, { end: current + (run && "left" in run ? run.left : full) });
              }
            }}>{action}</button>
            <button type="button" className={styles.reset} aria-label={"Reset " + stage.label} disabled={!run} onClick={() => setRun(stage.id)}>
              <RotateCcw size={15} aria-hidden="true" />
            </button>
          </div>
        );
      })}
      <label className={styles.sound}><input type="checkbox" checked={ring} onChange={toggleRing} /> Ring when done</label>
    </section>
  );
}
