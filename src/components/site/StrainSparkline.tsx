"use client";

import { useEffect, useState } from "react";
import { whoopStats } from "@/data/whoop/dashboard";
import { buildSparkline } from "@/lib/sparkline";

// ============================================================================
// STRAIN SPARKLINE (Client Component)
// ============================================================================
// A small line of WHOOP day strain for the last two weeks, read from the same
// public endpoint the Health dashboard uses (/api/whoop/data). WHOOP is the
// only source. If the live series is not available, the line is left out and
// the figures below (also WHOOP, from the Health page) still show.
// ============================================================================

interface StrainPoint {
  date: string;
  strain: number;
}

type LoadState =
  | { status: "loading" }
  | { status: "ready"; series: StrainPoint[] }
  | { status: "unavailable" };

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 96;
const VIEW_PADDING = 6;
const FIGURE_LABELS = ["Total Activities", "Day Streak", "Max Strain"] as const;

function parseSeries(payload: unknown): StrainPoint[] {
  if (typeof payload !== "object" || payload === null) return [];
  const raw = (payload as { strainSeries?: unknown }).strainSeries;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (p): p is StrainPoint =>
      typeof p === "object" &&
      p !== null &&
      typeof (p as StrainPoint).date === "string" &&
      Number.isFinite((p as StrainPoint).strain),
  );
}

function formatDay(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const figures = FIGURE_LABELS.map((label) => whoopStats.find((s) => s.label === label)).filter(
  (s): s is (typeof whoopStats)[number] => Boolean(s),
);

export default function StrainSparkline() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/whoop/data", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`WHOOP data responded ${res.status}`))))
      .then((payload: unknown) => setState({ status: "ready", series: parseSeries(payload) }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "unavailable" });
      });
    return () => controller.abort();
  }, []);

  const series = state.status === "ready" ? state.series : [];
  const spark = buildSparkline(
    series.map((p) => p.strain),
    VIEW_WIDTH,
    VIEW_HEIGHT,
    VIEW_PADDING,
  );
  const last = spark ? spark.points[spark.points.length - 1] : null;
  const latest = series.length > 0 ? series[series.length - 1] : null;

  let caption = "Loading day strain from WHOOP.";
  if (spark && latest) {
    caption = `Day strain, ${formatDay(series[0].date)} to ${formatDay(latest.date)}. Low ${spark.min.toFixed(1)}, high ${spark.max.toFixed(1)}, latest ${latest.strain.toFixed(1)}.`;
  } else if (state.status !== "loading") {
    caption = "The live strain line is not available right now. The figures below are from my WHOOP profile.";
  }

  return (
    <figure className="spark" data-spark>
      <div className={state.status === "loading" || spark ? "spark-plot" : "spark-plot is-empty"} data-spark-plot>
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          preserveAspectRatio="none"
          role="img"
          aria-label={spark ? caption : "WHOOP day strain sparkline"}
        >
          <line className="spark-base" x1="0" y1={VIEW_HEIGHT - 1} x2={VIEW_WIDTH} y2={VIEW_HEIGHT - 1} />
          {spark ? <path className="spark-line" d={spark.path} /> : null}
        </svg>
        {last ? (
          <span
            className="spark-dot"
            aria-hidden="true"
            style={{ left: `${(last.x / VIEW_WIDTH) * 100}%`, top: `${(last.y / VIEW_HEIGHT) * 100}%` }}
          />
        ) : null}
      </div>
      <figcaption className="spark-caption" aria-live="polite">
        {caption}
      </figcaption>
      <dl className="spark-figures">
        {figures.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd className="site-num">
              {stat.value}
              {stat.unit ? <small> {stat.unit}</small> : null}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}
