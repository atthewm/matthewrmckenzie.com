"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Star, ExternalLink, RefreshCw, Film, Tv, Headphones } from "lucide-react";
import type { FSItem } from "@/data/fs";
import type { MediaItem, NotionDatasetKey } from "@/data/notion/types";

// ============================================================================
// MEDIA SHELF — Films / TV / Audiobooks from the Notion Media Library
// ============================================================================
// PUBLIC app. One component serves all three shelves; the dataset is chosen by
// the desktop item's id. Sensitive notes never reach this component (they live
// behind the private gate in `private_data`).
// ============================================================================

const SHELVES: Record<
  string,
  { dataset: NotionDatasetKey; label: string; icon: React.ReactNode }
> = {
  "media-movies": { dataset: "films", label: "Movies", icon: <Film className="h-4 w-4" /> },
  "media-tv": { dataset: "tv", label: "TV Shows", icon: <Tv className="h-4 w-4" /> },
  "media-audiobooks": {
    dataset: "audiobooks",
    label: "Audiobooks",
    icon: <Headphones className="h-4 w-4" />,
  },
};

type Tab = "recent" | "favorites" | "queue" | "all";

const QUEUE_STATUSES = ["Watchlist", "To Read", "Watching", "Reading"];

export default function MediaShelfApp({ fsItem }: { fsItem?: FSItem }) {
  const shelf = (fsItem && SHELVES[fsItem.id]) || SHELVES["media-movies"];
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>("recent");

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/notion/data?dataset=${shelf.dataset}`);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      setItems((json.items ?? []) as MediaItem[]);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [shelf.dataset]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = useMemo(() => {
    if (tab === "favorites") return items.filter((i) => i.favorite);
    if (tab === "queue")
      return items.filter((i) => i.status && QUEUE_STATUSES.includes(i.status));
    if (tab === "recent") return items.filter((i) => i.watchedDate).slice(0, 60);
    return items;
  }, [items, tab]);

  return (
    <div className="flex h-full flex-col bg-desktop-bg text-desktop-text">
      <header className="flex items-center justify-between border-b border-desktop-border px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {shelf.icon}
          {shelf.label}
        </div>
        <div className="flex gap-1">
          {(["recent", "favorites", "queue", "all"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "rounded px-2 py-0.5 text-[11px] capitalize " +
                (tab === t
                  ? "bg-desktop-accent text-white"
                  : "text-desktop-text-secondary hover:bg-desktop-surface")
              }
            >
              {t === "queue" ? "Up Next" : t}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm text-desktop-text-secondary">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading {shelf.label}…
          </div>
        ) : failed || items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium">
              {failed ? "Couldn’t load this shelf" : "Nothing synced yet"}
            </p>
            <p className="max-w-[280px] text-xs text-desktop-text-secondary">
              {failed
                ? "The media feed is unavailable right now."
                : "Add NOTION_TOKEN + run the sync to populate from your Media Library."}
            </p>
            <button
              onClick={load}
              className="mt-1 rounded border border-desktop-border px-3 py-1 text-xs hover:bg-desktop-surface"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-3">
            {shown.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ item }: { item: MediaItem }) {
  const link = item.whereToWatch || item.externalUrl || item.trailerUrl;
  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-desktop-border bg-desktop-surface">
      <div className="relative aspect-[2/3] w-full bg-desktop-bg">
        {item.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-2 text-center text-[11px] font-medium text-desktop-text-secondary">
            {item.title}
          </div>
        )}
        {item.favorite && (
          <span className="absolute right-1 top-1 rounded-full bg-black/60 p-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 p-2">
        <div className="line-clamp-2 text-[11px] font-semibold leading-tight">
          {item.title}
        </div>
        <div className="text-[10px] text-desktop-text-secondary">
          {[item.year, item.creators[0]].filter(Boolean).join(" · ") || " "}
        </div>
        {item.ratingStars && (
          <div className="text-[10px] text-yellow-500">{item.ratingStars}</div>
        )}
        {(item.network || link) && (
          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="truncate text-[9px] text-desktop-text-secondary">
              {item.network ?? ""}
            </span>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-desktop-text-secondary opacity-0 transition group-hover:opacity-100"
                title="Open"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
