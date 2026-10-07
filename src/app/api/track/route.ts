import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Anonymous usage events from web, desktop and android. Each event carries a
// random per-device install ID — no account, email or IP is stored. Country
// comes from Vercel's geo header. Accepts one event or a batch of up to 20.

const PLATFORMS = new Set(["web", "desktop", "android"]);
const EVENTS = new Set(["app_open", "heartbeat", "match_view"]);
const MAX_BATCH = 20;

const str = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = (Array.isArray(body) ? body : [body]).slice(0, MAX_BATCH);
  const country = str(req.headers.get("x-vercel-ip-country"), 2);

  const rows = [];
  for (const it of items as Record<string, unknown>[]) {
    const installId = str(it?.installId, 64);
    const platform = str(it?.platform, 16);
    const event = str(it?.event, 16);
    if (!installId || !platform || !event || !PLATFORMS.has(platform) || !EVENTS.has(event)) {
      return NextResponse.json({ error: "installId, platform and event are required" }, { status: 400 });
    }
    rows.push({
      install_id: installId,
      platform,
      event,
      app_version: str(it.appVersion, 32),
      sport: str(it.sport, 32),
      league: str(it.league, 80),
      country,
    });
  }
  if (rows.length === 0) return new NextResponse(null, { status: 204 });

  const { error } = await serviceClient().from("usage_events").insert(rows);
  if (error) {
    console.error("track insert failed:", error.message);
    return NextResponse.json({ error: "Not recorded" }, { status: 500 });
  }
  return new NextResponse(null, { status: 204 });
}
