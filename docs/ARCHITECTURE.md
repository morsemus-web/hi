# Architecture

## The three products

| Product | Repository | Tech | Distributed as |
|---|---|---|---|
| **Website + API** | `morsemus-web/hi` (this repo) | Next.js on Vercel | tryscoredeck.pro |
| **Desktop widget** | `morsemus-web/scoredeck-desktop` (repo root) | Electron + React + Vite | Windows `.exe`, macOS `.dmg`, Linux AppImage/`.deb` |
| **Mobile app** | `morsemus-web/scoredeck-desktop` (`mobile/`) | Expo / React Native | Android `.apk` / Play Store `.aab` |

## How data flows

```
 Sports data providers                  tryscoredeck.pro (Vercel)                 Clients
 ─────────────────────                  ─────────────────────────                 ───────
 BBC / Cricbuzz / ESPN /     ──►  src/lib/providers  ──►  /api/<sport>  ──►  Website pages
 balldontlie / Jolpica            (plug-and-play layer)    edge-cached         Desktop widget
 (later: Sportmonks,                                        3–15 s             Mobile app
  Sportradar)
                                        │
                                        ▼
                                  Supabase (Postgres + auth)
                                  profiles, waitlist, backers,
                                  campaigns, ad_events
```

- **One API for every client.** Desktop and mobile never talk to a sports provider directly; they call `https://tryscoredeck.pro/api/...`. Changing provider is therefore a server-only change. See [DATA_PROVIDERS.md](DATA_PROVIDERS.md).
- **Caching keeps provider costs flat.** Score responses carry `Cache-Control: public, s-maxage=…, stale-while-revalidate=…`. Vercel's CDN serves repeat requests, so the provider sees roughly one request per endpoint per cache window, whatever the number of users.
- **Provider keys stay on the server.** They are Vercel environment variables and never ship in an app.

## Accounts, payments and ads

| Concern | How it works |
|---|---|
| Sign-in | Supabase magic link (web and mobile). The mobile app keeps its session in the OS keychain. |
| Profiles | `profiles` row created by a database trigger on signup. `tier` and `ads_free_until` drive ad-free status. |
| Payments | Stripe Checkout (website only), or Dodo for legacy subscribers, chosen by `NEXT_PUBLIC_CHECKOUT_PROVIDER`. Webhooks update `profiles` and the `payments` ledger with the service-role key. Clients cannot change their own tier (see `security-fixes.sql`). Details: [PAYMENTS.md](PAYMENTS.md). |
| Ad-free check | Apps call `GET /api/me` with the Supabase bearer token. |
| Ads | Each slot: direct sponsor (`campaigns`, via `/api/ads/next`, logged to `ad_events`) → AdSense (web) or AdMob (Android) → house ad. Ad-free subscribers see none. Details: [ADS.md](ADS.md). |
| Usage stats | Anonymous events to `/api/track`, subject to regional consent (`/api/region`). Details: [REPORTING.md](REPORTING.md), [PRIVACY.md](PRIVACY.md). |
| Email | Resend, from `hello@tryscoredeck.pro` (waitlist welcome, backer confirmation). |

## Repository layout (this repo)

```
src/
├── app/
│   ├── [locale]/          pages, all localised (en, ar, hi, es, de)
│   │   └── admin/         admin dashboard (see ADMIN.md)
│   └── api/
│       ├── soccer|cricket|basketball|f1/   thin routes → serveFeed(...)
│       ├── admin/         admin-only stats and reports
│       ├── checkout/      starts Stripe or Dodo checkout
│       ├── stripe/        Stripe webhook + billing portal
│       ├── track/         anonymous usage events
│       ├── region/        does this visitor need consent?
│       ├── ads/           ad serving and event logging
│       ├── dodo/webhook/  payment webhook
│       ├── me/            current user's tier and ad-free status
│       └── waitlist|backers/
├── components/            UI, including Live*Client.tsx per sport
├── lib/
│   ├── providers/         plug-and-play sports data layer
│   ├── adminAuth.ts       server-side admin check
│   ├── stripe.ts          Stripe client, plans, signed-in user lookup
│   ├── backers.ts         founding-backer recording (webhooks only)
│   ├── consent.ts, usage.ts, region.ts   analytics consent + tracking
│   └── supabase.ts        browser Supabase client
└── middleware.ts          locale routing + CORS preflight
messages/                  translations
*.sql                      Supabase schema and fixes (see DEPLOYMENT.md)
```

## Hosting

| Piece | Where | Notes |
|---|---|---|
| Website + API | Vercel (Pro plan required for commercial use) | Functions should run in the same region as the database |
| Database + auth | Supabase (Pro plan for backups, no auto-pause) | Mumbai (`ap-south-1`) is the closest region to UAE and India users |
| Installers + update feed | Currently `public/downloads` and `tryscoredeck.pro/releases/`, planned to move to object storage | electron-builder `publish` URL in the desktop `package.json` |
