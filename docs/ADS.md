# Ads

Free users see ads; users with an active ad-free subscription (`ads_free_until` in the future) see none.

## How a slot is filled

Every ad slot tries these in order:

| # | Source | Website | Android | Desktop |
|---|---|---|---|---|
| 1 | **Direct sponsor** from `campaigns` via `/api/ads/next` | yes | yes | yes |
| 2 | **Google network** | AdSense | AdMob | not allowed (see below) |
| 3 | **ScoreDeck house ad** | yes | yes | yes |

Direct sponsors come first because they usually pay far more than network ads. Impressions and clicks are logged to `ad_events` **only for direct sponsors**, so the Reports tab and advertiser invoices count real campaigns only. House ads and Google ads are not logged there; Google reports its own numbers in AdSense and AdMob.

| Platform | Component |
|---|---|
| Website | `src/components/SlotAd.tsx` (falls back to the existing AdSense `AdUnit`) |
| Android | `mobile/src/components/AdBanner.tsx` |
| Desktop | `src/AdSlot.tsx` (sponsors and house ads only) |

## Direct sponsors

Add a row to `campaigns` in Supabase:

| Column | Meaning |
|---|---|
| `name`, `advertiser` | Shown in reports |
| `creative_url`, `landing_url` | Image to show and where a click goes |
| `variant` | Slot type (`passive`, `interstitial`, `inline`) |
| `sports`, `locales`, `countries`, `tiers` | Targeting (null = everywhere) |
| `weight` | Share of voice when several campaigns match |
| `starts_at`, `ends_at`, `status` | Scheduling; only `status = 'active'` runs |

The **Reports → Ad performance** CSV (impressions, clicks, CTR per campaign) is the basis for invoicing sponsors.

## Google AdSense (website)

AdSense is already set up on the site: publisher `ca-pub-7182949672912731`, loaded in `src/app/[locale]/layout.tsx`, with `public/ads.txt`. The news pages use fixed AdSense units (`src/components/ArticleAds.tsx`, `NewsList.tsx`).

To let AdSense fill sponsor slots on the score pages, create a display ad unit in AdSense and set:

```
NEXT_PUBLIC_ADSENSE_SLOT_INLINE=<slot id>
```

If it's empty, those slots show house ads instead.

## Google AdMob (Android)

1. Create an AdMob account for Titan Orbyt, add the Android app, and create an **adaptive banner** unit.
2. In `mobile/app.json`:
   - Plugin `react-native-google-mobile-ads` → `androidAppId`: replace Google's **test** ID (`ca-app-pub-3940256099942544~3347511713`) with your real app ID.
   - `extra.admobBannerId`: your banner unit ID.
3. Build a new version with EAS. AdMob is a native module, so it doesn't work in Expo Go.
4. AdMob only serves fully once the app is **listed on Google Play** and linked in AdMob. APKs installed from the website get limited ads.
5. `public/app-ads.txt` on tryscoredeck.pro must match the AdMob publisher ID. It currently holds the AdSense publisher line; update it if AdMob shows a different ID. The Play listing's website must be `https://tryscoredeck.pro`.

In development builds, Google's test banner is used when `admobBannerId` is empty. In release builds with no ID, AdMob is skipped and house ads show.

## Desktop

Google's policies do not allow AdSense or AdMob inside desktop software. The desktop widget shows direct sponsors and house ads only.

## Consent

- **Website:** in AdSense → Privacy & messaging, publish a **GDPR message** (Google's certified consent tool) for the EEA, UK and Switzerland. Google requires it for serving ads there. The same popup also controls our own analytics; see [PRIVACY.md](PRIVACY.md).
- **Android:** the app runs Google's consent form (UMP) before requesting AdMob ads. In AdMob → Privacy & messaging, publish a GDPR message for the app. If Google says ads can't be requested, the app falls back to house ads.

## Blocking categories

In both AdSense and AdMob → Blocking controls, block **gambling and betting**, at least for the UAE, plus any other categories you don't want next to your content. Sports apps attract betting advertisers, and gambling ads are heavily restricted in the UAE.
