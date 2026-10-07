import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { serviceClient } from "@/lib/adminAuth";
import { planForPrice, stripe } from "@/lib/stripe";
import { recordBacker } from "@/lib/backers";

export const dynamic = "force-dynamic";

/*
 * Stripe webhook. Subscribe these events in the Stripe dashboard:
 *   checkout.session.completed, invoice.paid, customer.subscription.deleted
 *
 * invoice.paid is the source of truth for access: every paid invoice extends
 * ads_free_until to the end of the billed period and is written to the
 * payments ledger. Handlers are idempotent, so Stripe's retries are safe.
 */

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; rejecting webhook");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, req.headers.get("stripe-signature") ?? "", WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object);
        break;
      case "invoice.paid":
        await onInvoicePaid(event.data.object);
        break;
      case "customer.subscription.deleted":
        await onSubscriptionDeleted(event.data.object);
        break;
      default:
        return NextResponse.json({ received: true, ignored: event.type });
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    // A 500 makes Stripe retry the event later.
    console.error(`Stripe webhook ${event.type} failed:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return;
  const { error } = await serviceClient()
    .from("profiles")
    .update({
      stripe_customer_id: idOf(session.customer),
      stripe_subscription_id: idOf(session.subscription),
    })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

async function onInvoicePaid(invoice: Stripe.Invoice) {
  const db = serviceClient();
  const details = invoice.parent?.subscription_details;
  const subscriptionId = idOf(details?.subscription);
  const customerId = idOf(invoice.customer);
  const lines = invoice.lines?.data ?? [];
  const periodEnd = Math.max(0, ...lines.map((l) => l.period?.end ?? 0));
  const priceId = lines[0]?.pricing?.price_details?.price;
  const plan = planForPrice(typeof priceId === "string" ? priceId : idOf(priceId));

  // Ledger first: revenue is recorded even if the account can't be matched.
  const { error: ledgerErr } = await db.from("payments").upsert(
    {
      provider: "stripe",
      event_type: "payment.succeeded",
      provider_payment_id: invoice.id,
      email: invoice.customer_email,
      product_id: typeof priceId === "string" ? priceId : idOf(priceId),
      amount_minor: invoice.amount_paid,
      currency: invoice.currency?.toUpperCase() ?? null,
    },
    { onConflict: "provider,event_type,provider_payment_id", ignoreDuplicates: true }
  );
  if (ledgerErr) throw new Error(ledgerErr.message);

  // Find the account: by Stripe customer, else by the user_id we put in the
  // subscription metadata at checkout (covers invoice.paid arriving first).
  let profile: { id: string; email: string; ads_free_until: string | null } | null = null;
  if (customerId) {
    const { data } = await db.from("profiles").select("id, email, ads_free_until").eq("stripe_customer_id", customerId).maybeSingle();
    profile = data;
  }
  const metaUser = details?.metadata?.user_id;
  if (!profile && metaUser) {
    const { data } = await db.from("profiles").select("id, email, ads_free_until").eq("id", metaUser).maybeSingle();
    profile = data;
  }
  if (!profile) {
    console.warn(`invoice.paid ${invoice.id}: no matching profile (customer ${customerId})`);
    return;
  }

  const current = profile.ads_free_until ? new Date(profile.ads_free_until).getTime() : 0;
  const until = Math.max(current, periodEnd * 1000);
  const { error } = await db
    .from("profiles")
    .update({
      tier: plan ?? "pro",
      ads_free_until: until ? new Date(until).toISOString() : null,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq("id", profile.id);
  if (error) throw new Error(error.message);

  // First payment of a subscription makes them a founding backer.
  if (invoice.billing_reason === "subscription_create") {
    await recordBacker(profile.email, invoice.id);
  }
}

async function onSubscriptionDeleted(sub: Stripe.Subscription) {
  // Access continues until ads_free_until (the end of the paid period).
  const { error } = await serviceClient()
    .from("profiles")
    .update({ tier: "free" })
    .eq("stripe_subscription_id", sub.id);
  if (error) throw new Error(error.message);
}
