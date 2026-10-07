# ScoreDeck — Website & API

ScoreDeck is a live sports score overlay for desktop and Android, built and operated by **Orbytech IT Solutions L.L.C** (Dubai, UAE).

This repository (`morsemus-web/hi`) is the **website and the backend API** at [tryscoredeck.pro](https://tryscoredeck.pro). The desktop and mobile apps live in [`morsemus-web/scoredeck-desktop`](https://github.com/morsemus-web/scoredeck-desktop) and read all their scores from this API.

| Sport | Pages | API |
|---|---|---|
| Soccer | `/soccer`, `/live-soccer-now` | `/api/soccer`, `/api/soccer/details` |
| Cricket | `/cricket`, `/live-cricket-now` | `/api/cricket`, `/api/cricket/details` |
| Basketball | `/basketball` | `/api/basketball`, `/api/basketball/details` |
| Formula 1 | `/f1` | `/api/f1`, `/api/f1/details`, `/api/f1/laps` |

## Quick start

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev                         # http://localhost:3000
```

`npm run build` must pass before anything is deployed. It needs every server key in `.env.local`, including `RESEND_API_KEY`.

## Documentation

| Doc | What it covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the website, API, desktop and mobile apps fit together |
| [docs/DATA_PROVIDERS.md](docs/DATA_PROVIDERS.md) | The plug-and-play sports data layer, and how to add Sportmonks, Sportradar or others |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Environment variables, database setup, Vercel deployment, release checklist |
| [docs/ADMIN.md](docs/ADMIN.md) | Admin dashboard access and what it shows |
| [docs/REPORTING.md](docs/REPORTING.md) | Reports tab: business, usage, retention, ads and system-health reports, and how the data is collected |
| [docs/PAYMENTS.md](docs/PAYMENTS.md) | Stripe (and legacy Dodo) subscriptions, webhooks, tax, founding backers |
| [docs/ADS.md](docs/ADS.md) | Ad slots: direct sponsors first, then AdSense or AdMob, then house ads |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Data inventory, consent rules per platform, Google Play data-safety answers |
| [docs/API.md](docs/API.md) | Every API endpoint, its auth and parameters |

## Tech stack

Next.js 15 (App Router) · React 19 · Tailwind CSS 4 · next-intl (en, ar, hi, es, de) · Supabase (Postgres + auth) · Stripe (Dodo Payments for legacy subscribers) · Google AdSense / AdMob · Resend (email) · Vercel hosting.

© Orbytech IT Solutions L.L.C. All rights reserved.
