# Privacy & data collection

What ScoreDeck collects, where it goes, and how consent works. The public policy is `src/app/[locale]/privacy/page.tsx`. Keep it in sync with this file.

Operator (data controller): **Orbytech IT Solutions L.L.C**, Dubai, UAE.

## Data inventory

| Data | From | Stored in | Linked to a person? | Purpose |
|---|---|---|---|---|
| Email, sign-in | Account sign-up (magic link) | Supabase `auth.users`, `profiles` | Yes | Account, ad-free status |
| Plan, ad-free expiry, Stripe/Dodo customer IDs | Payment webhooks | `profiles` | Yes | Access control |
| Payment amount, currency, provider, email | Payment webhooks | `payments` | Yes | Revenue reporting, support |
| Waitlist / backer email | Waitlist form, payment webhooks | `waitlist`, `backers` | Yes | Launch emails, founding count |
| Anonymous usage events | Web, desktop and Android apps | `usage_events` | **No**: random device ID only | Reports (users, sessions, sports, retention) |
| Country | Vercel geo header on usage and ad events | `usage_events`, `ad_events` | No | Reports; the IP is not stored |
| Ad impressions and clicks (direct sponsors) | Ad slots | `ad_events` | No | Sponsor reporting and billing |
| Feed request status and timing | Server | `api_health` | No | System health |
| Cookies / advertising ID | Google Analytics, AdSense, AdMob | Google | Google's profiles | Analytics and ads; governed by Google |

Our anonymous device IDs are never sent to Google, and the Android advertising ID is never stored by us.

## Consent logic

`GET /api/region` returns `consentRequired: true` for EU/EEA countries, the UK, Switzerland, and when the country is unknown (fail-safe).

| Platform | Outside consent countries | Inside consent countries |
|---|---|---|
| **Website** | Anonymous stats on (off with Do Not Track) | On only if the visitor accepts TCF purposes 1 (store info on device) and 8 (measure content) in Google's consent popup. No popup means no tracking. |
| **Desktop** | "Share anonymous usage statistics" pre-ticked in Setup | Unticked until the user ticks it |
| **Android** | Switch in Account → Privacy, on by default | Off by default |
| **Google ads** | Served normally | Google's own consent form (AdSense GDPR message; AdMob UMP) |

Users can change the desktop and Android setting at any time; the choice is saved on the device.

Implementation: `src/lib/consent.ts` and `src/lib/usage.ts` (web), `src/usage.ts` (desktop), `mobile/src/lib/usage.ts` and `mobile/src/lib/admob.ts` (Android).

## Google Play data-safety form

Suggested answers for the current Android app. Check them again whenever the app starts collecting something new.

| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| Email address | Yes | No | Yes (sign-in is optional) | Account management |
| User IDs (account ID) | Yes | No | Yes | Account management |
| App interactions (opens, screens, matches viewed) | Yes | No | Yes (user can turn it off) | Analytics |
| Approximate location (country) | Yes | No | Yes | Analytics |
| Device or other IDs (advertising ID) | Yes | **Yes, with Google (AdMob)** | No while ads are shown | Advertising |
| Purchase history | No (purchases happen on the website) | — | — | — |

- Data is encrypted in transit: **Yes**.
- Users can request deletion: **Yes**, via hello@tryscoredeck.pro. Provide a deletion URL in the listing.

## Retention

- Usage and API-health rows: 13 months (optional Supabase Cron job in `reporting-setup.sql`).
- Account and payment data: kept while the account exists, and as long as tax law requires for payment records.

## Legal notes

- **UAE PDPL:** anonymous data that can't identify a person is generally outside its scope; account and payment data is in scope. Have a lawyer confirm.
- **EU/UK:** the ePrivacy rules require consent before storing even an anonymous ID on a device, which is why tracking is off until consent in those regions.
- **Payments:** with Stripe, Orbytech is the seller of record and handles VAT and sales tax (Stripe Tax helps). Dodo was the merchant of record.
