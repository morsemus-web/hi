# Deployment

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables (Production and Preview). `.env.local.example` lists the same keys for local development.

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key. Safe in clients; protected by row-level security. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only. Full database access. Never expose. |
| `RESEND_API_KEY` | Yes | Transactional email. The build fails without it. |
| `ADMIN_EMAILS` | Yes | Comma-separated emails allowed into `/admin`. See [ADMIN.md](ADMIN.md). |
| `NEWS_PASSCODE` | Yes | Protects news publishing |
| `SUPABASE_S3_ENDPOINT`, `SUPABASE_S3_ACCESS_KEY_ID`, `SUPABASE_S3_SECRET_ACCESS_KEY` | For news images | Supabase Storage (S3 API) |
| `NEXT_PUBLIC_DODO_PRODUCT_ID`, `NEXT_PUBLIC_DODO_MODE`, `NEXT_PUBLIC_REDIRECT_URL` | For web checkout | `NEXT_PUBLIC_DODO_MODE` = `test` or `live` |
| `NEXT_PUBLIC_CHECKOUT_PROVIDER` | No (default `dodo`) | `stripe` or `dodo` for new purchases. Redeploy after changing. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | With Stripe | Test keys on Preview, live keys on Production |
| `STRIPE_PRICE_QUARTERLY`, `STRIPE_PRICE_ANNUAL` | With Stripe | Stripe Price IDs for the two plans |
| `STRIPE_AUTOMATIC_TAX` | No | `true` once Stripe Tax is set up |
| `NEXT_PUBLIC_DODO_MONTHLY_ID`, `NEXT_PUBLIC_DODO_ANNUAL_ID` | With Dodo | Dodo product IDs for the two plans |
| `DODO_PAYMENTS_API_KEY`, `DODO_MOBILE_PRODUCT_ID` | With Dodo | |
| `DODO_WEBHOOK_SECRET` | Yes | The `whsec_…` key from Dodo. Webhooks are verified with Standard Webhooks; **without it every webhook is rejected**. |
| `BALLDONTLIE_API_KEY` | For basketball | Paid plan needed for commercial use |
| `DATA_PROVIDER_SOCCER` / `_CRICKET` / `_BASKETBALL` / `_F1` | No (default `legacy`) | See [DATA_PROVIDERS.md](DATA_PROVIDERS.md) |
| `NEXT_PUBLIC_ADSENSE_SLOT_INLINE` | No | AdSense slot for sponsor slots; empty = house ads. See [ADS.md](ADS.md). |

## Database (Supabase)

Run in Supabase → SQL Editor, in this order:

1. `supabase-full-setup.sql`: all tables (waitlist, backers, profiles, campaigns, ad_events), triggers and policies. Safe to re-run.
2. `security-fixes.sql`: removes two unsafe policies (users editing their own paid tier; anonymous inserts into ad_events). **Run this on the existing production database now.**
3. `reporting-setup.sql`: usage, API-health and payment tables, Stripe columns on `profiles`, and the `admin_report` function behind the Reports tab. See [REPORTING.md](REPORTING.md). Re-run it after pulling changes to it; it is safe to re-run.

`supabase-setup.sql`, `auth-setup.sql` and `ad-manager-setup.sql` are older split versions of step 1. Don't run them on a new project.

Authentication → URL Configuration → Redirect URLs must include:
- `https://tryscoredeck.pro/auth/callback` (web sign-in and admin)
- `scoredeck://` (mobile app magic link)

## Deploying the website

Vercel deploys automatically on push to `main`. Before pushing:

```bash
npx tsc --noEmit
npm run build
```

Vercel's **Hobby plan does not allow commercial use**. The project must be on **Pro**. Set the Functions region to match the Supabase region (Mumbai: `bom1` with Supabase `ap-south-1`).

## Release checklist

- [ ] `npm run build` passes locally
- [ ] `security-fixes.sql` and `reporting-setup.sql` applied to production
- [ ] Send a Dodo test webhook and confirm it returns 200 and a row appears in `payments`
- [ ] Stripe: webhook endpoint added, test subscription completed, then `NEXT_PUBLIC_CHECKOUT_PROVIDER=stripe` (see [PAYMENTS.md](PAYMENTS.md))
- [ ] AdSense and AdMob: GDPR consent messages published, gambling categories blocked (see [ADS.md](ADS.md))
- [ ] Android: real AdMob IDs in `app.json`, Play data-safety form filled in (see [PRIVACY.md](PRIVACY.md))
- [ ] `ADMIN_EMAILS` set; admin sign-in tested
- [ ] Dodo in `live` mode, webhook secret set, one real test purchase refunded
- [ ] Data providers licensed for commercial use in your target regions (see [DATA_PROVIDERS.md](DATA_PROVIDERS.md))
- [ ] CORS restricted to your own domains before any licensed data goes live
- [ ] Terms and privacy pages reviewed by a lawyer (operator: Titan Orbyt Technologies LLC, Dubai)
- [ ] No invented or offset numbers anywhere on the site, the apps or the admin dashboard
