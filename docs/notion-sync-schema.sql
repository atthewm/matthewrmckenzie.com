-- ===========================================================================
-- Notion -> Site sync cache
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ===========================================================================

create table if not exists public.notion_cache (
  id           text primary key,            -- "<dataset>:<notion_page_id>"
  dataset      text not null,               -- nutrition | films | tv | audiobooks | favorite-foods | top-foods
  notion_id    text not null,
  title        text,
  sort_key     text,                        -- ISO date or year; API sorts desc
  data         jsonb,                       -- public-safe payload
  private_data jsonb,                       -- admin-only payload (notes, reviews)
  synced_at    timestamptz not null default now()
);

create index if not exists notion_cache_dataset_idx
  on public.notion_cache (dataset, sort_key desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Reads/writes go through the server using the SERVICE ROLE key, which bypasses
-- RLS. We enable RLS with NO public policies so the anon key cannot read the
-- cache directly (the gated /api/notion/data route is the only public surface,
-- and it strips private_data for non-admins).
-- ---------------------------------------------------------------------------
alter table public.notion_cache enable row level security;
-- (Intentionally no policies for anon/auth roles.)

-- ===========================================================================
-- Sync run log
-- ===========================================================================
-- One row per dataset per sync run. The cache alone cannot tell you whether the
-- cron is healthy: a broken sync looks identical to a quiet week, because the
-- previous rows keep being served. This table makes a failing schedule visible
-- (GET /api/notion/sync?status=1).
-- ===========================================================================

create table if not exists public.notion_sync_runs (
  id          bigserial primary key,
  -- A dataset key, or '_config' for a run that never reached a dataset because
  -- the deployment was missing NOTION_TOKEN.
  dataset     text not null,
  ok          boolean not null,
  row_count   integer not null default 0,
  duration_ms integer,
  error       text,
  ran_at      timestamptz not null default now()
);

create index if not exists notion_sync_runs_ran_at_idx
  on public.notion_sync_runs (ran_at desc);

create index if not exists notion_sync_runs_dataset_idx
  on public.notion_sync_runs (dataset, ran_at desc);

alter table public.notion_sync_runs enable row level security;
-- (Intentionally no policies for anon/auth roles; service role only.)

-- Housekeeping: the hourly cron writes ~6 rows an hour. Trim occasionally.
--   delete from public.notion_sync_runs where ran_at < now() - interval '30 days';
