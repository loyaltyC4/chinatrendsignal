-- China Trend Signal: accounts, subscriptions, immutable credit ledger, and AI jobs.
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  plan text not null default 'scout' check (plan in ('scout','hunter','operator','agency')),
  created_at timestamptz not null default now()
);

create table if not exists credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  delta integer not null,
  action text not null,
  reference text unique,
  created_at timestamptz not null default now()
);

create index if not exists credit_ledger_user_created_idx on credit_ledger(user_id, created_at desc);

create or replace function credit_balance(p_user_id uuid)
returns integer language sql stable as $$
  select coalesce(sum(delta), 0)::integer from credit_ledger where user_id = p_user_id;
$$;

-- Atomic debit: fails if balance would go negative. Credits never expire because no expiry column exists.
create or replace function debit_credits(p_user_id uuid, p_delta integer, p_action text, p_reference text default null)
returns integer language plpgsql security definer as $$
declare new_balance integer;
begin
  if credit_balance(p_user_id) < p_delta then raise exception 'insufficient credits'; end if;
  insert into credit_ledger(user_id, delta, action, reference) values (p_user_id, -p_delta, p_action, p_reference);
  select credit_balance(p_user_id) into new_balance;
  return new_balance;
end;
$$;

create table if not exists ai_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  input jsonb not null,
  output jsonb,
  credits_charged integer not null default 0,
  status text not null default 'queued' check (status in ('queued','running','complete','failed')),
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table profiles enable row level security;
alter table credit_ledger enable row level security;
alter table ai_jobs enable row level security;
create policy "profiles own row" on profiles for select using (auth.uid() = id);
create policy "users see own ledger" on credit_ledger for select using (auth.uid() = user_id);
create policy "users see own jobs" on ai_jobs for select using (auth.uid() = user_id);
