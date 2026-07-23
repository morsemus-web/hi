-- ═══════════════════════════════════════════════
-- ScoreDeck Ad Manager — Supabase schema
-- Run in the Supabase SQL Editor after supabase-setup.sql
-- ═══════════════════════════════════════════════

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

create policy "Allow anon to read active campaigns"
  on campaigns for select using (status = 'active');

create policy "Allow anon to log ad events"
  on ad_events for insert with check (true);

insert into campaigns (name, advertiser, variant, creative_url, landing_url, weight)
values (
  'House: ScoreDeck cross-promo',
  'ScoreDeck',
  'passive',
  'https://tryscoredeck.pro/ads/house-passive.png',
  'https://tryscoredeck.pro/download',
  10
)
on conflict do nothing;
