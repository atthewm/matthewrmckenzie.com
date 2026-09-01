-- ===========================================================================
-- Notion -> Site sync cache
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- ===========================================================================

create table if not exists public.notion_cache (
  id           text primary key,            -- "<dataset>:<notion_page_id>"
  dataset      text not null,               -- nutrition | films | tv | audiobooks | favorite-foods
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
