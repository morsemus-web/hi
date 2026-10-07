# Sports data providers (plug-and-play)

All score data reaches users through nine **feeds**. Each sport's feeds are served by one **provider**, chosen with an environment variable. Switching a sport from the current sources to Sportmonks or Sportradar means writing an adapter and changing one variable. The website, desktop and mobile apps do not change.

## How it works

```
/api/soccer/route.ts           export const GET = serveFeed("soccer");
        │
        ▼
src/lib/providers/index.ts     reads DATA_PROVIDER_SOCCER → picks a provider
        │                      falls back to "legacy" if the provider is unknown
        ▼                      or does not implement that feed
src/lib/providers/<id>/        the provider's handler for "soccer"
```

Every response carries an `X-Data-Provider` header naming the provider that served it, so you can confirm a switch with `curl -I https://tryscoredeck.pro/api/soccer`.

## Choosing providers

Set these on Vercel (Production and Preview), then redeploy:

```
DATA_PROVIDER_SOCCER=legacy
DATA_PROVIDER_CRICKET=legacy
DATA_PROVIDER_BASKETBALL=legacy
DATA_PROVIDER_F1=legacy
```

If a variable is unset, `legacy` is used.

## Current provider: `legacy`

`src/lib/providers/legacy/` holds the original feed code:

| Sport | Source | Licensing status |
|---|---|---|
| Soccer | BBC Sport pages (scraped) | Unlicensed. Replace before commercial launch. |
| Cricket | Cricbuzz (scraped) | Unlicensed. Replace before commercial launch. |
| Basketball | ESPN internal API, balldontlie | ESPN is unlicensed. balldontlie needs a paid plan for commercial use. |
| Formula 1 | Jolpica, ESPN | Jolpica requires a data licence for commercial use. |

The **JSON output of `legacy` is the contract**: any new provider must return the same shapes.

## Feeds and their contracts

Every list feed returns `{ "status": "success", ... }` on success. Errors return `{ "status": "error", "error": "..." }` with a 4xx or 5xx status. Field types below are from live responses. For fields shown as empty arrays, read the matching `legacy/*.ts` file for the item shape.

| Feed | Endpoint | Query | Main fields |
|---|---|---|---|
| `soccer` | `/api/soccer` | `date` (optional) | `leagues[] { league, matches[] { home_team, away_team, home_score, away_score, status, time, detail_path, home_badge, away_badge } }` |
| `soccer.details` | `/api/soccer/details` | `path` = a match's `detail_path` | `events`, `lineups`, `stats`, `h2h`, `ranks`, `forms`, `standings[]`, `tournament_name` |
| `cricket` | `/api/cricket` | `date` (optional) | `matches[] { id, title, status_text, score, current_batsmen[], current_bowler }` |
| `cricket.details` | `/api/cricket/details` | `id` | `title, statusText, startDate, locationName, playerOfTheMatch, timeline[], innings[] { team, score, batters[], bowlers[], extras, total, yetToBat[] }, teams, pointsTable[], probability` |
| `basketball` | `/api/basketball` | `date` (optional) | `matches[] { id, title, team1/2, team1/2Full, team1/2Logo, team1/2Score, team1/2Record, venue, broadcasts[], score, extra, status, isLive, startTime, league }` |
| `basketball.details` | `/api/basketball/details` | `id` | `teams { home, away }, linescoreLabels, teamStats[], boxscore[], leaders[], plays[], standings[], injuries[]` |
| `f1` | `/api/f1` | — | `season, lastRace { results[] }, standings[], constructorStandings[], matches[] { id "season-round", title, circuit, sessions[], isLive, ... }` |
| `f1.details` | `/api/f1/details` | `id` = `season-round`, `session` (optional) | `sessions[], session, sessionState, results[], hasSprint, liveWeekend, ...` |
| `f1.laps` | `/api/f1/laps` | `id` = `season-round` | `laps[], drivers[], totalLaps, note` |

Status values clients rely on:
- Soccer `status`: `"Live"`, `"Upcoming"`, `"Finished"`. `time` holds the minute (`"67'"`), `"HT"`, `"FT"` or kickoff time.
- Basketball and F1: `isLive: true` marks in-progress events.
- Cricket: clients read `status_text` ("won", "starts at", …) to tell live from finished or upcoming.

## Adding a provider (example: Sportmonks for soccer)

1. **Put the key on the server**: add `SPORTMONKS_API_KEY` to Vercel and to `.env.local.example`. Never expose it in client code.
2. **Create the adapter** at `src/lib/providers/sportmonks/`:
   ```ts
   // src/lib/providers/sportmonks/index.ts
   import type { Provider } from "..";
   import * as soccer from "./soccer";

   export const provider: Provider = {
     id: "sportmonks",
     feeds: {
       soccer: soccer.handler,
       // add feeds as you build them; the rest fall back to legacy
     },
   };
   ```
   ```ts
   // src/lib/providers/sportmonks/soccer.ts
   import { NextResponse } from "next/server";

   export async function handler(req: Request) {
     // 1. fetch from Sportmonks with process.env.SPORTMONKS_API_KEY
     // 2. map to the soccer contract above: { status, date, leagues: [...] }
     // 3. keep the edge-cache header so the provider isn't hit per user:
     return NextResponse.json(body, {
       headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" },
     });
   }
   ```
3. **Register it** in `src/lib/providers/index.ts`:
   ```ts
   import * as sportmonks from "./sportmonks";
   const PROVIDERS = { legacy: legacy.provider, sportmonks: sportmonks.provider };
   ```
4. **Compare before switching**: run both side by side locally and check the new output has every field the legacy output has, for live, upcoming and finished matches.
5. **Switch**: set `DATA_PROVIDER_SOCCER=sportmonks` on a Vercel **Preview** deployment first. Check the website, the desktop widget and the mobile app against it, then set it on Production.
6. **Roll back** at any time by setting the variable back to `legacy` and redeploying.

## Provider obligations to respect

- **Caching**: keep `s-maxage` on every response. Provider usage should not grow with user count.
- **Attribution**: if the contract requires a "Data by X" credit, add it to the sport pages and apps.
- **No redistribution**: `/api/*` currently sends `Access-Control-Allow-Origin: *`. Before connecting a licensed provider, restrict CORS to your own domains so the API is not a free public mirror of licensed data.
- **Images**: team logos, league marks and driver photos are usually **not** covered by data licences. Use the provider's image feed only if the plan includes it.
- **Territory**: licences are usually per region (e.g. UAE/GCC, India). Serve only where you are licensed.
