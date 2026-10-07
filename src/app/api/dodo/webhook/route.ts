import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";
import { recordBacker } from "@/lib/backers";

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

// Dodo signs webhooks with the Standard Webhooks scheme (webhook-id,
// webhook-timestamp, webhook-signature). Without a secret nothing is
// accepted, so an unconfigured deployment cannot be used to grant ad-free.
function verifySignature(rawBody: string, req: Request): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("DODO_WEBHOOK_SECRET is not set; rejecting webhook");
    return false;
  }
  try {
    new Webhook(WEBHOOK_SECRET).verify(rawBody, {
      "webhook-id": req.headers.get("webhook-id") ?? "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": req.headers.get("webhook-signature") ?? "",
    });
    return true;
  } catch {
    return false;
  }
}

// Every handled event goes into the payments ledger for revenue reporting.
// The unique (provider, event_type, provider_payment_id) index makes retries harmless.
async function recordPayment(type: string, data: any, email: string | undefined, productId: string | undefined) {
  const { error } = await supabaseAdmin.from("payments").upsert(
    {
      provider: "dodo",
      event_type: type,
      provider_payment_id: data?.payment_id ?? data?.subscription_id ?? data?.id ?? null,
      email: email ?? null,
      product_id: productId ?? null,
      amount_minor: typeof data?.total_amount === "number" ? data.total_amount : null,
      currency: data?.currency ?? null,
    },
    { onConflict: "provider,event_type,provider_payment_id", ignoreDuplicates: true }
  );
  if (error) console.error("payments ledger insert failed:", error.message);
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    if (!verifySignature(raw, req)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(raw);
    const type: string = event?.type ?? event?.event ?? "";
    const data = event?.data ?? event;

    const productId: string | undefined =
      data?.product_id ?? data?.product?.id ?? data?.product_cart?.[0]?.product_id;
    const email: string | undefined =
      data?.customer?.email ?? data?.customer_email ?? data?.email;

    // Record revenue for every product (web and mobile subscriptions)
    // before the mobile-only ad-free handling below.
    const handled =
      type === "payment.succeeded" ||
      type === "subscription.active" ||
      type === "subscription.created" ||
      type === "subscription.renewed";
    if (handled) await recordPayment(type, data, email, productId);
    if (type === "payment.succeeded" && email) {
      await recordBacker(email, data?.payment_id ?? null).catch((err) =>
        console.error("recordBacker failed:", err)
      );
    }

    if (MOBILE_PRODUCT_ID && productId && productId !== MOBILE_PRODUCT_ID) {
      return NextResponse.json({ status: "ignored", reason: "wrong product" });
    }

    if (!email) {
      return NextResponse.json({ status: "ignored", reason: "no email" });
    }

    if (handled) {
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
