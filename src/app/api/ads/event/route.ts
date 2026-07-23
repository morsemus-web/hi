import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(["impression", "click"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, type, sport, locale, country, tier, sessionId } = body ?? {};

    if (typeof campaignId !== "number" || !VALID_TYPES.has(type)) {
      return NextResponse.json(
        { status: "error", error: "campaignId (number) and type ('impression'|'click') are required" },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") ?? null;

    const { error } = await supabaseAdmin.from("ad_events").insert([
      {
        campaign_id: campaignId,
        event_type: type,
        sport: sport ?? null,
        locale: locale ?? null,
        country: country ?? null,
        tier: tier ?? null,
        session_id: sessionId ?? null,
        user_agent: userAgent,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("ads/event error:", err);
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Failed to log ad event" },
      { status: 500 }
    );
  }
}
