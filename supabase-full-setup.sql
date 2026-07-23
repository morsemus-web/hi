-- ScoreDeck full Supabase schema (one-shot).
-- Copy this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to re-run: everything is idempotent.

-- ============================================================
-- 1. Base tables (waitlist + backers) for the landing page
-- ============================================================

create table if not exists waitlist (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  created_at timestamptz default now()
);

create table if not exists backers (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  payment_id text,
  created_at timestamptz default now()
);

alter table waitlist enable row level security;
alter table backers  enable row level security;

drop policy if exists "Allow anon to count backers" on backers;
create policy "Allow anon to count backers"
  on backers for select using (true);

create index if not exists idx_waitlist_email on waitlist (email);
create index if not exists idx_backers_email  on backers  (email);

-- ============================================================
-- 2. Profiles table (one row per authenticated user)
--    Auto-created on signup with a 30-day mobile ad-free trial.
-- ============================================================

create table if not exists profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  ads_free_until        timestamptz,
  dodo_customer_id      text,
  dodo_subscription_id  text,
  tier                  text default 'free',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_profiles_email on profiles (email);

alter table profiles enable row level security;

drop policy if exists "Users read own profile" on profiles;
create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);

drop policy if exists "Users update own profile" on profiles;
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, ads_free_until, tier)
  values (
    new.id,
    new.email,
    now() + interval '30 days',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on profiles;
create trigger on_profiles_updated
  before update on profiles
  for each row execute procedure public.touch_profile_updated_at();

-- ============================================================
-- 3. Ad Manager (campaigns + events)
-- ============================================================

create table if not exists campaigns (
  id              bigint generated always as identity primary key,
  name            text not null,
  advertiser      text,
  variant         text not null default 'passive',
  creative_url    text not null,
  landing_url     text not null,
  sports          text[],
  locales         text[],
  countries       text[],
  tiers           text[] default array['free','pro'],
  weight          int not null default 100,
  starts_at       timestamptz default now(),
  ends_at         timestamptz,
  status          text not null default 'active',
  created_at      timestamptz default now()
);

create index if not exists idx_campaigns_status on campaigns (status);
create index if not exists idx_campaigns_dates  on campaigns (starts_at, ends_at);

create table if not exists ad_events (
  id              bigint generated always as identity primary key,
  campaign_id     bigint not null references campaigns(id) on delete cascade,
  event_type      text not null,
  sport           text,
  locale          text,
  country         text,
  tier            text,
  session_id      text,
  user_agent      text,
  created_at      timestamptz default now()
);

create index if not exists idx_ad_events_campaign on ad_events (campaign_id);
create index if not exists idx_ad_events_created  on ad_events (created_at);
create index if not exists idx_ad_events_type     on ad_events (event_type);

alter table campaigns enable row level security;
alter table ad_events enable row level security;

drop policy if exists "Allow anon to read active campaigns" on campaigns;
create policy "Allow anon to read active campaigns"
  on campaigns for select using (status = 'active');

drop policy if exists "Allow anon to log ad events" on ad_events;
create policy "Allow anon to log ad events"
  on ad_events for insert with check (true);

-- Seed one house campaign so /api/ads/next returns something on day one
insert into campaigns (name, advertiser, variant, creative_url, landing_url, weight)
select
  'House: ScoreDeck cross-promo',
  'ScoreDeck',
  'passive',
  'https://tryscoredeck.pro/ads/house-passive.png',
  'https://tryscoredeck.pro/download',
  10
where not exists (
  select 1 from campaigns where name = 'House: ScoreDeck cross-promo'
);

-- Verify with:
--   select table_name from information_schema.tables
--    where table_schema = 'public' order by table_name;
-- Expected: ad_events, backers, campaigns, profiles, waitlist
