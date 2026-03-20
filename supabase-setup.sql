-- ═══════════════════════════════════════════════
-- ScoreDeck — Supabase Database Setup
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- Waitlist table
create table if not exists waitlist (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  created_at timestamptz default now()
);

-- Backers table (lifetime $29 purchasers)
create table if not exists backers (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  payment_id text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table waitlist enable row level security;
alter table backers enable row level security;

-- Allow anon to read backer count (used by frontend)
create policy "Allow anon to count backers"
  on backers for select
  using (true);

-- Only service role can insert (API routes use service role key)
-- No anon insert policies = frontend can't write directly

-- Indexes
create index if not exists idx_waitlist_email on waitlist (email);
create index if not exists idx_backers_email on backers (email);
