import { after, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as legacy from "./legacy";

/*
 * Plug-and-play sports data.
 *
 * Every public score endpoint (/api/soccer, /api/cricket/details, …) is a
 * "feed". Each feed is served by one provider, chosen per sport with an
 * environment variable:
 *
 *   DATA_PROVIDER_SOCCER=legacy
 *   DATA_PROVIDER_CRICKET=legacy
 *   DATA_PROVIDER_BASKETBALL=legacy
 *   DATA_PROVIDER_F1=legacy
 *
 * To add a provider (Sportmonks, Sportradar, …): write a module whose feed
 * handlers return the same JSON as the legacy ones, add it to PROVIDERS, and
 * flip the env var. Web, desktop and mobile clients need no change.
 * Feeds a provider does not implement fall back to legacy.
 * See docs/DATA_PROVIDERS.md.
 */

export type Sport = "soccer" | "cricket" | "basketball" | "f1";

export type Feed =
  | "soccer" | "soccer.details"
  | "cricket" | "cricket.details"
  | "basketball" | "basketball.details"
  | "f1" | "f1.details" | "f1.laps";

export type FeedHandler = (req: NextRequest) => Promise<Response>;
export type Provider = { id: string; feeds: Partial<Record<Feed, FeedHandler>> };

const PROVIDERS: Record<string, Provider> = {
  legacy: legacy.provider,
  // sportmonks: sportmonks.provider,
  // sportradar: sportradar.provider,
};

const DEFAULT_PROVIDER = "legacy";

function sportOf(feed: Feed): Sport {
  return feed.split(".")[0] as Sport;
}

export function providerFor(feed: Feed): Provider {
  const envKey = `DATA_PROVIDER_${sportOf(feed).toUpperCase()}`;
  const id = (process.env[envKey] ?? DEFAULT_PROVIDER).trim().toLowerCase();
  const chosen = PROVIDERS[id];
  if (!chosen) {
    console.error(`[providers] ${envKey}="${id}" is not a registered provider; using ${DEFAULT_PROVIDER}`);
    return PROVIDERS[DEFAULT_PROVIDER];
  }
  if (!chosen.feeds[feed]) {
    console.warn(`[providers] "${id}" does not implement ${feed}; using ${DEFAULT_PROVIDER}`);
    return PROVIDERS[DEFAULT_PROVIDER];
  }
  return chosen;
}

// Records one row per feed request that reaches the server, for the
// system-health report. Runs after the response is sent; failures are ignored.
function logHealth(feed: Feed, provider: string, status: number, durationMs: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  after(async () => {
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await db
      .from("api_health")
      .insert({ feed, provider, status, duration_ms: Math.round(durationMs) });
    if (error) console.warn("[providers] health log failed:", error.message);
  });
}

/** Route files call this: `export const GET = serveFeed("soccer");` */
export function serveFeed(feed: Feed): FeedHandler {
  return async (req) => {
    const provider = providerFor(feed);
    const started = performance.now();
    let res: Response;
    try {
      res = await provider.feeds[feed]!(req);
    } catch (err) {
      logHealth(feed, provider.id, 500, performance.now() - started);
      throw err;
    }
    logHealth(feed, provider.id, res.status, performance.now() - started);
    try {
      res.headers.set("X-Data-Provider", provider.id);
    } catch {
      // Some Response objects have immutable headers; the tag is optional.
    }
    return res;
  };
}
