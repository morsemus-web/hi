import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, ads_free_until, tier")
    .eq("id", userData.user.id)
    .maybeSingle();

  const adsFreeUntil = profile?.ads_free_until ?? null;
  const adsFree = !!adsFreeUntil && new Date(adsFreeUntil).getTime() > Date.now();

  return NextResponse.json({
    id: userData.user.id,
    email: profile?.email ?? userData.user.email,
    tier: profile?.tier ?? "free",
    adsFree,
    adsFreeUntil,
  });
}
