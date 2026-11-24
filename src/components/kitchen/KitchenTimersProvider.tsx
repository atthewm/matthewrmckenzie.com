"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export const stages = [
  { id: "preheat", label: "Preheat oven", minutes: 60 },
  { id: "covered", label: "Bake covered", minutes: 20 },
  { id: "uncovered", label: "Bake uncovered", minutes: 20 },
] as const;

type StageId = typeof stages[number]["id"];
type Run = { end: number } | { left: number } | { done: true; acknowledged: boolean };
type Runs = Partial<Record<StageId, Run>>;
const prefix = "mmck-city-loaf-timer-";

function loadRuns(): Runs {
  const result: Runs = {};
  for (const stage of stages) {
    try {
      const raw = localStorage.getItem(prefix + stage.id);
      if (!raw) continue;
      const run = JSON.parse(raw);
      if (!run || typeof run !== "object") continue;
      if (Number.isFinite(run.end) && run.end > 0) result[stage.id] = { end: run.end };
      else if (Number.isFinite(run.left) && run.left > 0 && run.left <= stage.minutes * 60000) result[stage.id] = { left: run.left };
      else if (run.done === true) result[stage.id] = { done: true, acknowledged: run.acknowledged === true };
    } catch { /* Use in-memory timers when storage is unavailable. */ }
  }
  return result;
}

interface KitchenClock {
  runs: Runs;
  ring: boolean;
  toggleRing: () => void;
  setRun: (id: StageId, run?: Run) => void;
}
const Clock = createContext<KitchenClock | null>(null);

export function useKitchenTimers() {
  const clock = useContext(Clock);
  if (!clock) throw new Error("Kitchen timers need the desktop clock.");
  return clock;
}

export default function KitchenTimersProvider({ children }: { children: ReactNode }) {
  const [runs, setRuns] = useState<Runs>(loadRuns);
  const [ring, setRing] = useState(false);
  const sound = useRef<AudioContext | null>(null);

  const toggleRing = () => {
    if (ring) {
      setRing(false);
      return;
    }
    try {
      // Unlock audio during the visitor's gesture so a timer can ring later.
      const context = sound.current ?? new AudioContext();
      sound.current = context;
      void context.resume().then(() => setRing(context.state === "running")).catch(() => setRing(false));
    } catch { setRing(false); }
  };
  useEffect(() => () => { void sound.current?.close().catch(() => {}); }, []);
  const setRun = useCallback((id: StageId, run?: Run) => {
    try {
      if (run) localStorage.setItem(prefix + id, JSON.stringify(run));
      else localStorage.removeItem(prefix + id);
    } catch { /* The clock still runs in this tab. */ }
    setRuns((current) => ({ ...current, [id]: run }));
  }, []);

  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith(prefix)) setRuns(loadRuns());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    const running = stages.flatMap(({ id }) => {
      const run = runs[id];
      return run && "end" in run ? [{ id, end: run.end }] : [];
    });
    if (!running.length) return;
    let alarm: number;
    const check = () => {
      window.clearTimeout(alarm);
      const now = Date.now();
      let next = Infinity;
      let finished = false;
      for (const { id, end } of running) {
        if (end <= now) {
          setRun(id, { done: true, acknowledged: false });
          finished = true;
        } else next = Math.min(next, end);
      }
      if (finished && ring && sound.current?.state === "running") {
        const context = sound.current;
        for (const delay of [0, 0.38]) {
          const start = context.currentTime + delay;
          const bell = context.createOscillator();
          const volume = context.createGain();
          bell.frequency.value = 880;
          volume.gain.setValueAtTime(0.0001, start);
          volume.gain.exponentialRampToValueAtTime(0.08, start + 0.012);
          volume.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
          bell.connect(volume).connect(context.destination);
          bell.start(start);
          bell.stop(start + 0.52);
        }
      }
      if (Number.isFinite(next)) alarm = window.setTimeout(check, Math.min(next - now, 2147483647));
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(alarm);
      document.removeEventListener("visibilitychange", check);
    };
  }, [runs, setRun, ring]);

  const ready = stages.filter(({ id }) => {
    const run = runs[id];
    return run && "done" in run && !run.acknowledged;
  });

  return (
    <Clock.Provider value={{ runs, setRun, ring, toggleRing }}>
      {children}
      {ready.length > 0 && (
        <div className="fixed inset-x-3 bottom-20 z-boot mx-auto flex max-w-sm items-center gap-4 rounded-lg border border-desktop-border bg-desktop-surface px-4 text-desktop-text shadow-lg">
          <p role="status" className="flex-1 py-3 text-sm">Timer finished. {ready.map((stage) => stage.label).join(", ")}.</p>
          <button type="button" className="min-h-11 text-sm text-desktop-accent underline" onClick={() => {
            for (const stage of ready) setRun(stage.id, { done: true, acknowledged: true });
          }}>Dismiss</button>
        </div>
      )}
    </Clock.Provider>
  );
}
