-- Listing desk: marketplace saturation cache + per-user listing queue.
-- Run after schema.sql. Both tables are additive; nothing here touches the radar.

-- Etsy saturation for a given product term, refreshed by a batch scraper job
-- (Firecrawl/Apify searching Etsy and counting results). We cache because the
-- source is rate-limited and slow — the desk reads the cache, never scrapes
-- inline. `listing_count` is NULL when we have not measured it, which the UI
-- renders as a dash rather than inventing a number.
create table if not exists saturation_cache (
  id uuid primary key default gen_random_uuid(),
  term text not null,                    -- normalized product term (product_en / product_term)
  marketplace text not null default 'etsy',
  listing_count integer,                 -- null = not measured
  top10_avg_reviews numeric,             -- null = not measured
  measured_at timestamptz,               -- when the scrape ran; null if never
  unique (term, marketplace)
);
create index if not exists saturation_cache_term_idx on saturation_cache (term);

-- The post queue: drafts a user has pushed from the studio, awaiting their click.
-- One row per (user, signal). The draft payload is a snapshot so edits in the
-- studio don't silently change something already queued.
create table if not exists listing_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  signal_id uuid not null references signals(id) on delete cascade,
  draft jsonb not null,                  -- ListingDraft snapshot
  status text not null default 'queued' check (status in ('queued','posted','dismissed')),
  created_at timestamptz not null default now(),
  posted_at timestamptz,
  unique (user_id, signal_id)
);
create index if not exists listing_queue_user_idx on listing_queue (user_id, status);

-- OAuth tokens for connected sales channels. One row per (user, provider).
-- Access + refresh tokens live here; the integrations page reads connection state
-- from this table server-side, never from a cookie. Disconnect deletes the row.
create table if not exists integration_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  provider text not null,                -- 'etsy' | 'tiktok' | 'shopify'
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  account_label text,                    -- e.g. the Etsy shop name
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);
