"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, LocateFixed, Timer, TriangleAlert } from "lucide-react";
import { dailySurvey, formatTime, loadBest, MINE_COUNT, SIDE, START_CELL, todayUTC, uncover } from "./daily/survey";
import styles from "./daily/Survey.module.css";

type Phase = "ready" | "playing" | "lost" | "won";
const labels = "ABCDEFG";

export default function DailyMinesweeperApp() {
  const [day, setDay] = useState(todayUTC);
  useEffect(() => {
    function checkDay() { setDay(todayUTC()); }
    const nextDay = Date.parse(day + "T00:00:00Z") + 86400000;
    const timeout = window.setTimeout(checkDay, Math.max(10, nextDay - Date.now() + 20));
    document.addEventListener("visibilitychange", checkDay);
    return () => { clearTimeout(timeout); document.removeEventListener("visibilitychange", checkDay); };
  }, [day]);
  return <SurveyDay key={day} day={day} />;
}

function SurveyDay({ day }: { day: string }) {
  const board = useMemo(() => dailySurvey(day), [day]);
  const [seen, setSeen] = useState(new Set<number>());
  const [flags, setFlags] = useState(new Set<number>());
  const [phase, setPhase] = useState<Phase>("ready");
  const [marking, setMarking] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [best, setBest] = useState(() => loadBest(day));
  const [unsaved, setUnsaved] = useState(false);
  const started = useRef(0);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (phase !== "playing") return;
    const tick = window.setInterval(() => setSeconds(Math.floor((performance.now() - started.current) / 1000)), 250);
    return () => clearInterval(tick);
  }, [phase]);
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (!event.key || event.key === "mmck-daily-survey-" + day) setBest(loadBest(day)); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [day]);

  function start() {
    const initial = new Set<number>();
    uncover(board, initial, new Set(), START_CELL);
    setSeen(initial);
    setFlags(new Set());
    setMarking(false);
    setPhase("playing");
    setSeconds(0);
    setUnsaved(false);
    started.current = performance.now();
  }

  function act(cell: number, flag: boolean) {
    if (phase !== "playing" || seen.has(cell)) return;
    if (flag) {
      const next = new Set(flags);
      if (next.has(cell)) next.delete(cell);
      else next.add(cell);
      setFlags(next);
      return;
    }
    if (flags.has(cell)) return;
    if (board.mines.has(cell)) { setPhase("lost"); return; }
    const next = new Set(seen);
    uncover(board, next, flags, cell);
    setSeen(next);
    if (next.size !== SIDE * SIDE - MINE_COUNT) return;
    const elapsed = Math.max(1, Math.ceil((performance.now() - started.current) / 1000));
    const record = Math.min(elapsed, loadBest(day) ?? Infinity, best ?? Infinity);
    setSeconds(elapsed);
    setPhase("won");
    setBest(record);
    try { localStorage.setItem("mmck-daily-survey-" + day, String(record)); }
    catch { setUnsaved(true); }
  }

  const date = new Date(day + "T12:00:00Z").toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" });
  return (
    <section className={styles.survey} aria-label="Daily Minesweeper">
      <header><p>{date} UTC</p><h2>Daily Survey</h2></header>
      <p className={styles.summary}>Find the safe squares. Each number counts the mines touching it.</p>
      <div className={styles.stats}>
        <span><TriangleAlert size={14} />{MINE_COUNT} mines</span>
        <span><Timer size={14} />{formatTime(seconds)}</span>
        <span>Best {best === null ? "none" : formatTime(best)}</span>
      </div>
      <div className={styles.sheet} ref={grid} aria-label="Survey squares">
        <span />
        {[...labels].map(letter => <span className={styles.axis} key={letter}>{letter}</span>)}
        {Array.from({ length: SIDE }, (_, row) => (
          <div className={styles.row} key={row}>
            <span className={styles.axis}>{row + 1}</span>
            {Array.from({ length: SIDE }, (_, col) => {
              const cell = row * SIDE + col;
              const marked = flags.has(cell);
              const mine = phase === "lost" && board.mines.has(cell);
              const open = seen.has(cell);
              const state = mine ? "mine" : marked ? "marked" : open ? "clear" : "covered";
              const detail = open ? board.clues[cell] + " nearby" : state;
              return <button key={col} type="button" data-cell={cell} data-state={state}
                aria-label={labels[col] + (row + 1) + ", " + detail}
                disabled={phase !== "playing"} onClick={() => act(cell, marking)}
                onContextMenu={e => { e.preventDefault(); act(cell, true); }}
                onKeyDown={e => {
                  if (e.key.toLowerCase() === "f") { e.preventDefault(); act(cell, true); }
                  const move: Record<string, number> = { ArrowUp: -SIDE, ArrowDown: SIDE, ArrowLeft: -1, ArrowRight: 1 };
                  if (e.key in move) { e.preventDefault(); grid.current?.querySelector<HTMLButtonElement>('[data-cell="' + Math.max(0, Math.min(SIDE * SIDE - 1, cell + move[e.key])) + '"]')?.focus(); }
                }}>
                {mine ? <TriangleAlert size={15} /> : marked ? <Flag size={14} /> : open ? board.clues[cell] || "·" : cell === START_CELL && phase === "ready" ? <LocateFixed size={17} /> : null}
              </button>;
            })}
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        {phase === "playing" ? <button type="button" aria-pressed={marking} onClick={() => setMarking(!marking)}><Flag size={15} />Mark mines</button> :
          <button type="button" onClick={start}>{phase === "ready" ? "Start survey" : "Play again"}</button>}
        <span role="status">{phase === "ready" ? "Start at D4." : phase === "lost" ? "Mine found. Try again." : phase === "won" ? (unsaved ? "Solved. Storage unavailable." : "Survey complete.") : marking ? "Tap a square to place or lift a flag." : "Tap a square to uncover it."}</span>
      </div>
    </section>
  );
}
