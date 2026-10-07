# Reporting

`/admin` → **Reports** tab. Pick any date range (or a preset: last 7/30/90 days, this month, last month) and the page builds five reports. Download them as **CSV** (all sections in one file, opens in Excel or Google Sheets) or **JSON**, or use **Print / PDF** for a document to send.

Dates are inclusive calendar days in **Dubai time**. Everything is computed from recorded data. No figure is estimated, extrapolated or offset.

## The five reports

### Business
| Metric | Source |
|---|---|
| New accounts, accounts at end of range | `profiles.created_at` |
| Paid accounts (now) | `profiles.tier <> 'free'`, the current value, not historical |
| Payments and revenue per provider and currency | `payments` ledger, `payment.succeeded` events only (Stripe `invoice.paid` is stored under that name) |
| New backers, waitlist joins | `backers`, `waitlist` |

Revenue is recorded from the moment `reporting-setup.sql` is applied and the updated webhook is deployed. Earlier payments are not in the ledger; add them by hand from the Dodo dashboard if you need history.

### App usage
Anonymous events from the website, desktop app and Android app (`usage_events`):

| Event | When |
|---|---|
| `app_open` | Website: each page load. Desktop: app start. Android: each time the app comes to the foreground. |
| `heartbeat` | Every 5 minutes while in use (web: only while the tab is visible) |
| `match_view` | A user opens a match. Web: soccer, cricket, F1 detail. Desktop: widget expanded. Android: match screen. |

| Metric | Meaning |
|---|---|
| Unique users | Distinct install IDs in the range. A person on web and desktop counts twice; clearing browser storage creates a new ID. |
| Avg daily users | Mean of daily unique users across every day in the range, including zero days |
| Sessions | `app_open` count |
| Active time | Heartbeats × 5 minutes. An approximation, accurate to about 5 minutes per session. |
| By sport, top leagues | From `match_view` |
| By country | From Vercel's IP-geolocation header. The IP itself is not stored. |
| App versions | Useful for seeing who hasn't updated |

Tracking starts once each app version with tracking is released. Older desktop and Android installs send nothing until they update.

**Consent affects the counts.** Visitors in the EU/EEA, UK and Switzerland are only counted after they consent (website), or when they turn the setting on (desktop and Android). Treat usage numbers as "consenting users", so audiences from those regions are under-counted. See [PRIVACY.md](PRIVACY.md).

### Retention
New users (install IDs whose **first-ever** event falls in the range) are grouped by the week they first appeared (weeks start Monday, Dubai time). For each weekly cohort the report shows the share active again 1, 2, 4 and 8 weeks later. A week that hasn't happened yet shows "—".

Read it as: "of the people who started in the week of 4 Aug, 40% came back the following week." Advertisers and investors look for this number.

### Ad performance
From `ad_events` and `campaigns`: impressions, clicks and CTR for **direct sponsor campaigns**, per campaign and per day. Use the per-campaign CSV when invoicing advertisers. House ads aren't logged, and Google AdSense/AdMob earnings are reported in Google's dashboards, not here.

### System health
From `api_health`: one row per score-feed request that reached the server, with status and duration, per feed and provider.
- CDN cache hits are served by Vercel without reaching the server, so request counts are **origin fetches**, not user requests.
- **5xx** = our feed failed (usually the upstream source broke or blocked us). **4xx** = bad requests from clients (e.g. a missing match id).
- **p95 ms** = 95% of requests finished within this time.

## Setup

1. Run `reporting-setup.sql` in the Supabase SQL Editor (after `supabase-full-setup.sql` and `security-fixes.sql`).
2. Deploy the website. That adds `/api/track`, feed health logging and the payment ledger.
3. Release new desktop and Android versions. That turns on their usage tracking.
4. Make sure `DODO_WEBHOOK_SECRET` is set on Vercel. Without it the webhook now rejects every call, by design.

## How it's built

```
Apps ──POST /api/track──► usage_events ┐
Score feeds (serveFeed) ─► api_health   ├─► admin_report(from, to)  ◄── /api/admin/report ◄── Reports tab
Dodo webhook ────────────► payments     │     (one Postgres function)       (admin only)
profiles, waitlist, backers, ad_events ─┘
```

- `admin_report(p_from, p_to, p_tz)` in `reporting-setup.sql` computes everything in one database call and returns JSON. Only the service role can execute it.
- All three new tables have row-level security on and no policies, so the public anon key cannot read or write them.
- Row volume: heartbeats are the largest (about 12 rows per active user-hour). The SQL file includes an optional Supabase Cron job that deletes usage and health rows older than 13 months.

## Adding a metric

1. Record the data: a new `event` type in `usage_events` (update the `check` constraint and `/api/track`), or a new table.
2. Add it to `admin_report` in `reporting-setup.sql` and re-run the file in Supabase.
3. Show it in `src/components/admin/ReportsView.tsx` and add it to `reportCsv()` so it downloads too.
4. Update the privacy policy if the new data is about users.
