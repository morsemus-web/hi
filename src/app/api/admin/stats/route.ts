import { NextResponse } from "next/server";
import { requireAdmin, serviceClient } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "•••";
  if (local.length <= 2) return `••@${domain}`;
  return `${local[0]}${"•".repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

// Every number returned here is a direct count from Supabase. Nothing is
// estimated, offset or randomised — if a query fails the field is null and
// the dashboard shows "—".
export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const db = serviceClient();
  const now = Date.now();
  const since7 = new Date(now - 7 * DAY).toISOString();
  const since30 = new Date(now - 30 * DAY).toISOString();
  const nowIso = new Date(now).toISOString();

  const count = async (table: string, apply?: (q: any) => any): Promise<number | null> => {
    let q = db.from(table).select("*", { count: "exact", head: true });
    if (apply) q = apply(q);
    const { count: c, error } = await q;
    return error ? null : c ?? 0;
  };

  const [
    accounts, accounts7, accounts30, paid, adsFree,
    waitlist, waitlist7, backers,
    impressions7, clicks7, activeCampaigns,
  ] = await Promise.all([
    count("profiles"),
    count("profiles", (q) => q.gte("created_at", since7)),
    count("profiles", (q) => q.gte("created_at", since30)),
    count("profiles", (q) => q.neq("tier", "free")),
    count("profiles", (q) => q.gt("ads_free_until", nowIso)),
    count("waitlist"),
    count("waitlist", (q) => q.gte("created_at", since7)),
    count("backers"),
    count("ad_events", (q) => q.eq("event_type", "impression").gte("created_at", since7)),
    count("ad_events", (q) => q.eq("event_type", "click").gte("created_at", since7)),
    count("campaigns", (q) => q.eq("status", "active")),
  ]);

  const { data: tierRows } = await db.from("profiles").select("tier").neq("tier", "free");
  const tiers: Record<string, number> = {};
  for (const r of tierRows ?? []) tiers[r.tier] = (tiers[r.tier] ?? 0) + 1;

  const { data: recent } = await db
    .from("profiles")
    .select("email, tier, created_at")
    .order("created_at", { ascending: false })
    .limit(25);

  return NextResponse.json(
    {
      generatedAt: nowIso,
      accounts: { total: accounts, last7d: accounts7, last30d: accounts30, paid, adsFree, tiers },
      waitlist: { total: waitlist, last7d: waitlist7 },
      backers: { total: backers },
      ads: { impressions7d: impressions7, clicks7d: clicks7, activeCampaigns },
      recentSignups: (recent ?? []).map((r) => ({
        email: maskEmail(r.email),
        tier: r.tier,
        createdAt: r.created_at,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
