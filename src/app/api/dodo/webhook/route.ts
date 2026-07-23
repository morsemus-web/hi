import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const WEBHOOK_SECRET = process.env.DODO_WEBHOOK_SECRET || "";
const MOBILE_PRODUCT_ID = process.env.DODO_MOBILE_PRODUCT_ID || "";

function newExpiry(existing: string | null): string {
  const base = existing ? new Date(existing).getTime() : 0;
  const from = Math.max(base, Date.now());
  return new Date(from + 365 * 24 * 60 * 60 * 1000).toISOString();
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!WEBHOOK_SECRET) return true;
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const sig = req.headers.get("webhook-signature") || req.headers.get("x-dodo-signature");
    if (!verifySignature(raw, sig)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(raw);
    const type: string = event?.type ?? event?.event ?? "";
    const data = event?.data ?? event;

    const productId: string | undefined =
      data?.product_id ?? data?.product?.id ?? data?.product_cart?.[0]?.product_id;
    if (MOBILE_PRODUCT_ID && productId && productId !== MOBILE_PRODUCT_ID) {
      return NextResponse.json({ status: "ignored", reason: "wrong product" });
    }

    const email: string | undefined =
      data?.customer?.email ?? data?.customer_email ?? data?.email;
    if (!email) {
      return NextResponse.json({ status: "ignored", reason: "no email" });
    }

    if (
      type === "payment.succeeded" ||
      type === "subscription.active" ||
      type === "subscription.created" ||
      type === "subscription.renewed"
    ) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, ads_free_until")
        .eq("email", email)
        .maybeSingle();

      if (!profile) {
        return NextResponse.json({ status: "queued", reason: "no profile yet" });
      }

      const next = newExpiry(profile.ads_free_until);
      await supabaseAdmin
        .from("profiles")
        .update({
          ads_free_until: next,
          dodo_customer_id: data?.customer?.id ?? null,
          dodo_subscription_id: data?.subscription_id ?? data?.id ?? null,
        })
        .eq("id", profile.id);

      return NextResponse.json({ status: "ok", ads_free_until: next });
    }

    return NextResponse.json({ status: "ignored", reason: `unhandled type ${type}` });
  } catch (err) {
    console.error("dodo webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook failure" },
      { status: 500 }
    );
  }
}
