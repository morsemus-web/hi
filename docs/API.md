# API reference

Base URL: `https://tryscoredeck.pro`. All endpoints return JSON unless noted.

**Auth column:**
- **Bearer**: `Authorization: Bearer <Supabase access token>` from a signed-in user.
- **Admin**: Bearer, and the user's email must be in `ADMIN_EMAILS`.
- **Signed**: verified with the payment provider's webhook signature.

## Scores (public, edge-cached)

Served through the plug-and-play provider layer; each response has an `X-Data-Provider` header. Response shapes are in [DATA_PROVIDERS.md](DATA_PROVIDERS.md#feeds-and-their-contracts).

| Method | Path | Query | CDN cache (`s-maxage`) |
|---|---|---|---|
| GET | `/api/soccer` | `date?` | 5 s |
| GET | `/api/soccer/details` | `path` | 5 s |
| GET | `/api/cricket` | `date?` | 4 s |
| GET | `/api/cricket/details` | `id` | 3 s |
| GET | `/api/basketball` | `date?` | 15 s |
| GET | `/api/basketball/details` | `id` | 10 s |
| GET | `/api/f1` | — | 30 s |
| GET | `/api/f1/details` | `id` (`season-round`), `session?` | 20 s |
| GET | `/api/f1/laps` | `id` (`season-round`) | 60–300 s |

## Accounts & payments

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/me` | Bearer | Current user's `tier`, `adsFree`, `adsFreeUntil` |
| POST | `/api/checkout` | Bearer (Stripe) / none (Dodo) | Start checkout. Stripe: `{ plan: "quarterly" \| "annual" }`. Dodo: `{ productId, email? }`. Returns `{ checkout_url }`. |
| POST | `/api/stripe/portal` | Bearer | Returns `{ url }` for the Stripe billing portal |
| POST | `/api/stripe/webhook` | Signed (Stripe) | Stripe events; see [PAYMENTS.md](PAYMENTS.md) |
| POST | `/api/dodo/webhook` | Signed (Standard Webhooks) | Dodo events |
| GET | `/api/config/products` | — | Dodo product IDs (legacy) |
| GET | `/auth/callback` | — | Magic-link landing; forwards to `next` |

## Growth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/waitlist` | — | `{ count }`, the real waitlist size |
| POST | `/api/waitlist` | — | `{ email }`: join the waitlist and send a welcome email |
| GET | `/api/backers` | — | `{ count, max, remaining }` founding backers. There is no POST; webhooks add backers. |

## Ads

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/ads/next` | — | Next ad for a slot. Query: `variant`, `sport?`, `locale?`, `country?`, `tier?`. `house: true` means no sponsor matched. |
| POST | `/api/ads/event` | — | `{ campaignId, type: "impression" \| "click", sport?, … }` for direct sponsor campaigns |
| GET | `/ads.txt`, `/app-ads.txt` | — | Authorised sellers (static files in `public/`) |

## Usage & privacy

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/track` | — | Anonymous usage event or batch (≤ 20): `{ installId, platform: web\|desktop\|android, event: app_open\|heartbeat\|match_view, appVersion?, sport?, league? }`. Returns 204. |
| GET | `/api/region` | — | `{ country, consentRequired }` |

## Admin

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/admin/stats` | Admin | Overview tab counts |
| GET | `/api/admin/report` | Admin | `?from=YYYY-MM-DD&to=YYYY-MM-DD`: full report JSON; see [REPORTING.md](REPORTING.md) |

## News

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/news` | `NEWS_PASSCODE` in body | Publish an article |
| POST | `/api/news/upload` | `NEWS_PASSCODE` in form | Upload an article image |
| POST | `/api/news/verify` | — | Check a passcode |
| GET | `/news-sitemap.xml` | — | Google News sitemap (XML) |

## CORS

`/api/*` currently allows any origin (`Access-Control-Allow-Origin: *`) so the desktop app, served over `file://`, can call it. Restrict it before licensed sports data goes live; see [DATA_PROVIDERS.md](DATA_PROVIDERS.md#provider-obligations-to-respect).
