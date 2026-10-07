-- ═══════════════════════════════════════════════
-- ScoreDeck security fixes — run once in the Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Users could update their own profile row, including `tier` and
--    `ads_free_until`, which let anyone grant themselves a paid plan.
--    No client code writes to profiles (only the Dodo webhook does, with
--    the service role), so the policy is removed.
drop policy if exists "Users update own profile" on profiles;

-- 2. Anyone holding the public anon key could insert rows straight into
--    ad_events, faking impressions and clicks. Only /api/ads/event (service
--    role) writes there, so direct anon inserts are removed.
drop policy if exists "Allow anon to log ad events" on ad_events;
