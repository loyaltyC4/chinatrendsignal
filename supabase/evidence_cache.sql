-- Amazon US catalog evidence cache (Phase 2).
-- One row per (signal, source). A missing row means "not measured yet" — the UI
-- shows a dash, never a carry-forward of stale numbers.

create table if not exists evidence_cache (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references signals(id) on delete cascade,
  source text not null,
  search_term text not null,
  result_count integer not null,
  top_prices_usd numeric[] ,
  top_asins text[],
  retrieved_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (signal_id, source)
);

create index if not exists evidence_cache_signal_idx on evidence_cache (signal_id);
