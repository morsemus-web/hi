-- ═══════════════════════════════════════════════
-- ScoreDeck reporting — run once in the Supabase SQL Editor,
-- after supabase-full-setup.sql and security-fixes.sql. Safe to re-run.
--
-- Adds three tables that feed the admin Reports page, and one function,
-- admin_report(from, to), that computes every report for a date range.
-- All tables are written and read only by the server (service role);
-- RLS is on with no policies, so the public anon key cannot touch them.
-- ═══════════════════════════════════════════════

-- 1. Anonymous app usage (web, desktop, android).
--    install_id is a random ID generated on the device — no name, email or IP.
create table if not exists usage_events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  install_id  text not null,
  platform    text not null check (platform in ('web', 'desktop', 'android')),
  app_version text,
  event       text not null check (event in ('app_open', 'heartbeat', 'match_view')),
  sport       text,
  league      text,
  country     text
);
create index if not exists idx_usage_events_created on usage_events (created_at);
create index if not exists idx_usage_events_event_created on usage_events (event, created_at);
alter table usage_events enable row level security;

-- 2. One row per score-feed request that reached the server (CDN cache
--    hits never reach it). Used for the system-health report.
create table if not exists api_health (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  feed        text not null,
  provider    text not null,
  status      int  not null,
  duration_ms int  not null
);
create index if not exists idx_api_health_created on api_health (created_at);
alter table api_health enable row level security;

-- 3. Payment ledger, written by the Dodo and Stripe webhooks. Revenue is
--    counted from 'payment.succeeded' events only (Stripe's invoice.paid is
--    stored under that name), so subscription lifecycle events that
--    accompany a payment are not double-counted.
create table if not exists payments (
  id                  bigint generated always as identity primary key,
  created_at          timestamptz not null default now(),
  provider            text not null default 'dodo',
  event_type          text not null,
  provider_payment_id text,
  email               text,
  product_id          text,
  amount_minor        bigint,
  currency            text
);
alter table payments add column if not exists provider text not null default 'dodo';
drop index if exists idx_payments_event_payment;
create unique index if not exists idx_payments_provider_event_payment
  on payments (provider, event_type, provider_payment_id);

-- Stripe identifiers on the account (Dodo's live in dodo_* columns).
alter table profiles add column if not exists stripe_customer_id text;
alter table profiles add column if not exists stripe_subscription_id text;
create index if not exists idx_profiles_stripe_customer on profiles (stripe_customer_id);
create index if not exists idx_payments_created on payments (created_at);
alter table payments enable row level security;

-- 4. The report. Dates are inclusive calendar days in p_tz.
create or replace function admin_report(p_from date, p_to date, p_tz text default 'Asia/Dubai')
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  t0 timestamptz;
  t1 timestamptz;
  result jsonb;
begin
  if p_to < p_from then
    raise exception 'p_to (%) is before p_from (%)', p_to, p_from;
  end if;
  if p_to - p_from > 366 then
    raise exception 'date range is limited to 367 days';
  end if;

  t0 := p_from::timestamp at time zone p_tz;
  t1 := (p_to + 1)::timestamp at time zone p_tz;

  with days as (
    select d::date as day from generate_series(p_from, p_to, interval '1 day') as d
  ),
  acc as (
    select (created_at at time zone p_tz)::date as day, count(*) as n
    from profiles where created_at >= t0 and created_at < t1 group by 1
  ),
  wl as (
    select (created_at at time zone p_tz)::date as day, count(*) as n
    from waitlist where created_at >= t0 and created_at < t1 group by 1
  ),
  bk as (
    select (created_at at time zone p_tz)::date as day, count(*) as n
    from backers where created_at >= t0 and created_at < t1 group by 1
  ),
  pay as (
    select (created_at at time zone p_tz)::date as day, count(*) as n
    from payments
    where event_type = 'payment.succeeded' and created_at >= t0 and created_at < t1
    group by 1
  ),
  ue as (
    select * from usage_events where created_at >= t0 and created_at < t1
  ),
  use_daily as (
    select (created_at at time zone p_tz)::date as day,
           count(distinct install_id) as users,
           count(*) filter (where event = 'app_open') as sessions,
           count(*) filter (where event = 'heartbeat') * 5 as active_minutes
    from ue group by 1
  ),
  ae as (
    select * from ad_events where created_at >= t0 and created_at < t1
  ),
  ad_daily as (
    select (created_at at time zone p_tz)::date as day,
           count(*) filter (where event_type = 'impression') as impressions,
           count(*) filter (where event_type = 'click') as clicks
    from ae group by 1
  ),
  ah as (
    select * from api_health where created_at >= t0 and created_at < t1
  ),
  -- Retention: installs whose first-ever event falls in the range, grouped
  -- into weekly cohorts (weeks start Monday, p_tz), and whether each was
  -- active again N weeks later. Weeks that haven't happened yet are null.
  first_seen as (
    select install_id, min(created_at) as first_at from usage_events group by install_id
  ),
  cohort as (
    select install_id, date_trunc('week', first_at at time zone p_tz)::date as wk
    from first_seen where first_at >= t0 and first_at < t1
  ),
  cohort_activity as (
    select distinct e.install_id, date_trunc('week', e.created_at at time zone p_tz)::date as wk
    from usage_events e join cohort c using (install_id)
  ),
  this_week as (
    select date_trunc('week', now() at time zone p_tz)::date as wk
  ),
  health_daily as (
    select (created_at at time zone p_tz)::date as day,
           count(*) as requests,
           count(*) filter (where status >= 500) as errors
    from ah group by 1
  )
  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', p_to, 'timezone', p_tz),

    'business', jsonb_build_object(
      'totals', jsonb_build_object(
        'newAccounts',     (select coalesce(sum(n), 0) from acc),
        'waitlistJoins',   (select coalesce(sum(n), 0) from wl),
        'newBackers',      (select coalesce(sum(n), 0) from bk),
        'payments',        (select coalesce(sum(n), 0) from pay),
        'accountsAtEnd',   (select count(*) from profiles where created_at < t1),
        'paidAccountsNow', (select count(*) from profiles where tier <> 'free')
      ),
      'revenue', coalesce((
        select jsonb_agg(jsonb_build_object('provider', provider, 'currency', currency, 'amountMinor', amt, 'payments', n) order by currency, provider)
        from (
          select provider, upper(coalesce(currency, 'unknown')) as currency, sum(coalesce(amount_minor, 0)) as amt, count(*) as n
          from payments
          where event_type = 'payment.succeeded' and created_at >= t0 and created_at < t1
          group by 1, 2
        ) r
      ), '[]'::jsonb),
      'daily', (
        select jsonb_agg(jsonb_build_object(
          'day', days.day,
          'newAccounts', coalesce(acc.n, 0),
          'waitlistJoins', coalesce(wl.n, 0),
          'newBackers', coalesce(bk.n, 0),
          'payments', coalesce(pay.n, 0)
        ) order by days.day)
        from days
        left join acc on acc.day = days.day
        left join wl  on wl.day  = days.day
        left join bk  on bk.day  = days.day
        left join pay on pay.day = days.day
      )
    ),

    'usage', jsonb_build_object(
      'totals', jsonb_build_object(
        'uniqueUsers',   (select count(distinct install_id) from ue),
        'sessions',      (select count(*) from ue where event = 'app_open'),
        'matchViews',    (select count(*) from ue where event = 'match_view'),
        'activeMinutes', (select count(*) * 5 from ue where event = 'heartbeat'),
        'avgDailyUsers', (select coalesce(round(avg(coalesce(u.users, 0)), 1), 0)
                          from days left join use_daily u on u.day = days.day)
      ),
      'daily', (
        select jsonb_agg(jsonb_build_object(
          'day', days.day,
          'users', coalesce(u.users, 0),
          'sessions', coalesce(u.sessions, 0),
          'activeMinutes', coalesce(u.active_minutes, 0)
        ) order by days.day)
        from days left join use_daily u on u.day = days.day
      ),
      'byPlatform', coalesce((
        select jsonb_agg(jsonb_build_object('platform', platform, 'users', users, 'sessions', sessions) order by users desc)
        from (
          select platform, count(distinct install_id) as users, count(*) filter (where event = 'app_open') as sessions
          from ue group by platform
        ) p
      ), '[]'::jsonb),
      'bySport', coalesce((
        select jsonb_agg(jsonb_build_object('sport', sport, 'views', views, 'users', users) order by views desc)
        from (
          select sport, count(*) as views, count(distinct install_id) as users
          from ue where event = 'match_view' and sport is not null group by sport
        ) s
      ), '[]'::jsonb),
      'topLeagues', coalesce((
        select jsonb_agg(jsonb_build_object('sport', sport, 'league', league, 'views', views, 'users', users) order by views desc)
        from (
          select sport, league, count(*) as views, count(distinct install_id) as users
          from ue where event = 'match_view' and league is not null
          group by sport, league order by views desc limit 15
        ) l
      ), '[]'::jsonb),
      'byCountry', coalesce((
        select jsonb_agg(jsonb_build_object('country', country, 'users', users) order by users desc)
        from (
          select coalesce(country, 'unknown') as country, count(distinct install_id) as users
          from ue group by 1 order by users desc limit 15
        ) c
      ), '[]'::jsonb),
      'byVersion', coalesce((
        select jsonb_agg(jsonb_build_object('platform', platform, 'version', app_version, 'users', users) order by platform, users desc)
        from (
          select platform, coalesce(app_version, 'unknown') as app_version, count(distinct install_id) as users
          from ue group by 1, 2
        ) v
      ), '[]'::jsonb)
    ),

    'retention', jsonb_build_object(
      'cohorts', coalesce((
        select jsonb_agg(jsonb_build_object(
          'cohortWeek', r.wk, 'size', r.size,
          'week1', r.w1, 'week2', r.w2, 'week4', r.w4, 'week8', r.w8
        ) order by r.wk)
        from (
          select c.wk, count(*) as size,
            case when c.wk + 7  <= (select wk from this_week) then count(*) filter (where exists (select 1 from cohort_activity a where a.install_id = c.install_id and a.wk = c.wk + 7))  end as w1,
            case when c.wk + 14 <= (select wk from this_week) then count(*) filter (where exists (select 1 from cohort_activity a where a.install_id = c.install_id and a.wk = c.wk + 14)) end as w2,
            case when c.wk + 28 <= (select wk from this_week) then count(*) filter (where exists (select 1 from cohort_activity a where a.install_id = c.install_id and a.wk = c.wk + 28)) end as w4,
            case when c.wk + 56 <= (select wk from this_week) then count(*) filter (where exists (select 1 from cohort_activity a where a.install_id = c.install_id and a.wk = c.wk + 56)) end as w8
          from cohort c group by c.wk
        ) r
      ), '[]'::jsonb)
    ),

    'ads', jsonb_build_object(
      'totals', jsonb_build_object(
        'impressions', (select count(*) from ae where event_type = 'impression'),
        'clicks',      (select count(*) from ae where event_type = 'click')
      ),
      'byCampaign', coalesce((
        select jsonb_agg(jsonb_build_object(
          'campaignId', x.campaign_id, 'name', c.name, 'advertiser', c.advertiser,
          'impressions', x.impressions, 'clicks', x.clicks
        ) order by x.impressions desc)
        from (
          select campaign_id,
                 count(*) filter (where event_type = 'impression') as impressions,
                 count(*) filter (where event_type = 'click') as clicks
          from ae group by campaign_id
        ) x
        left join campaigns c on c.id = x.campaign_id
      ), '[]'::jsonb),
      'daily', (
        select jsonb_agg(jsonb_build_object(
          'day', days.day,
          'impressions', coalesce(a.impressions, 0),
          'clicks', coalesce(a.clicks, 0)
        ) order by days.day)
        from days left join ad_daily a on a.day = days.day
      )
    ),

    'health', jsonb_build_object(
      'totals', jsonb_build_object(
        'requests', (select count(*) from ah),
        'errors',   (select count(*) from ah where status >= 500)
      ),
      'byFeed', coalesce((
        select jsonb_agg(jsonb_build_object(
          'feed', feed, 'provider', provider, 'requests', requests, 'errors', errors,
          'clientErrors', client_errors, 'avgMs', avg_ms, 'p95Ms', p95_ms
        ) order by feed, provider)
        from (
          select feed, provider,
                 count(*) as requests,
                 count(*) filter (where status >= 500) as errors,
                 count(*) filter (where status between 400 and 499) as client_errors,
                 round(avg(duration_ms))::int as avg_ms,
                 round(percentile_cont(0.95) within group (order by duration_ms))::int as p95_ms
          from ah group by feed, provider
        ) f
      ), '[]'::jsonb),
      'daily', (
        select jsonb_agg(jsonb_build_object(
          'day', days.day,
          'requests', coalesce(h.requests, 0),
          'errors', coalesce(h.errors, 0)
        ) order by days.day)
        from days left join health_daily h on h.day = days.day
      )
    )
  ) into result;

  return result;
end;
$$;

-- Supabase exposes public functions over its API; keep this one server-only.
revoke all on function admin_report(date, date, text) from public;
revoke all on function admin_report(date, date, text) from anon, authenticated;
grant execute on function admin_report(date, date, text) to service_role;

-- 5. Retention: usage and health rows are high-volume. Keep 13 months.
--    Run manually, or schedule with Supabase Cron:
--    select cron.schedule('prune-reporting', '0 3 * * *', $$
--      delete from usage_events where created_at < now() - interval '13 months';
--      delete from api_health  where created_at < now() - interval '13 months';
--    $$);
