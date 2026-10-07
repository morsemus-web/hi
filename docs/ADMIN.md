# Admin dashboard

URL: `https://tryscoredeck.pro/admin` (any locale, e.g. `/en/admin`).

## Access

Access is decided **on the server**. There is no admin password.

1. Add the admin's email to the `ADMIN_EMAILS` environment variable on Vercel (comma-separated), then redeploy:
   ```
   ADMIN_EMAILS=founder@tryscoredeck.pro,ops@tryscoredeck.pro
   ```
2. That person must already have a ScoreDeck account (they have signed in on the site at least once).
3. At `/admin` they enter their email, click the magic link, and land on the dashboard.

Anyone else can open the page, but `/api/admin/stats` returns `401` or `403` and the dashboard receives no data. To remove someone's access, take their email out of `ADMIN_EMAILS` and redeploy.

Also add `https://tryscoredeck.pro/auth/callback` to Supabase → Authentication → URL Configuration → Redirect URLs if it is not already there.

## Tabs

- **Overview**: live snapshot (below).
- **Reports**: any date range, downloadable as CSV, JSON or PDF. See [REPORTING.md](REPORTING.md).

## What the Overview shows

Every figure is a direct count from Supabase, fetched by `src/app/api/admin/stats/route.ts`. Nothing is estimated, offset or simulated. If a query fails, the dashboard shows `—` rather than a number.

| Card | Source |
|---|---|
| Accounts (+7d, +30d) | `profiles` rows by `created_at` |
| Paid accounts, by tier | `profiles` where `tier <> 'free'` |
| Currently ads-free | `profiles` where `ads_free_until` is in the future |
| Founding backers | `backers` rows |
| Waitlist (+7d) | `waitlist` rows |
| Ads, last 7 days | `ad_events` impressions and clicks, plus active `campaigns` |
| Recent signups | Latest 25 `profiles`, emails masked |
| Live matches | The public `/api/soccer` and `/api/cricket` feeds |

App usage (users, sessions, sports, countries) is in the **Reports** tab, from anonymous tracking in the apps. Do not add estimated or random figures to either tab.

## Rules for changing this page

- Numbers shown to the team, investors or advertisers must come from a real data source.
- Add new metrics to `/api/admin/stats` (server side, behind `requireAdmin`), never by querying Supabase from the browser with the service key.
