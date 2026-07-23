import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Campaign {
  id: number;
  name: string;
  advertiser: string | null;
  variant: string;
  creative_url: string;
  landing_url: string;
  sports: string[] | null;
  locales: string[] | null;
  countries: string[] | null;
  tiers: string[] | null;
  weight: number;
  starts_at: string;
  ends_at: string | null;
  status: string;
}

function matches(c: Campaign, ctx: {
  variant: string;
  sport?: string;
  locale?: string;
  country?: string;
  tier?: string;
}): boolean {
  if (c.variant !== ctx.variant) return false;
  if (c.status !== "active") return false;
  const now = Date.now();
  if (new Date(c.starts_at).getTime() > now) return false;
  if (c.ends_at && new Date(c.ends_at).getTime() < now) return false;
  if (ctx.sport && c.sports && c.sports.length && !c.sports.includes(ctx.sport)) return false;
  if (ctx.locale && c.locales && c.locales.length && !c.locales.includes(ctx.locale)) return false;
  if (ctx.country && c.countries && c.countries.length && !c.countries.includes(ctx.country)) return false;
  if (ctx.tier && c.tiers && c.tiers.length && !c.tiers.includes(ctx.tier)) return false;
  return true;
}

function weightedPick(pool: Campaign[]): Campaign | null {
  if (!pool.length) return null;
  const total = pool.reduce((s, c) => s + Math.max(0, c.weight), 0);
  if (total <= 0) return pool[0];
  let r = Math.random() * total;
  for (const c of pool) {
    r -= Math.max(0, c.weight);
    if (r <= 0) return c;
  }
  return pool[pool.length - 1];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variant = searchParams.get("variant") || "passive";
    const sport = searchParams.get("sport") || undefined;
    const locale = searchParams.get("locale") || undefined;
    const country = searchParams.get("country") || undefined;
    const tier = searchParams.get("tier") || undefined;

    const { data, error } = await supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("status", "active");

    if (error) throw error;

    const pool = (data as Campaign[]).filter((c) =>
      matches(c, { variant, sport, locale, country, tier })
    );
    const picked = weightedPick(pool);

    if (!picked) {
      return NextResponse.json({ status: "no_fill" }, { status: 200 });
    }

    return NextResponse.json(
      {
        status: "ok",
        campaignId: picked.id,
        creativeUrl: picked.creative_url,
        landingUrl: picked.landing_url,
        variant: picked.variant,
        ttl: 60,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("ads/next error:", err);
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Failed to pick ad" },
      { status: 500 }
    );
  }
}
