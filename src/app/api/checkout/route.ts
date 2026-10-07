import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { serviceClient } from "@/lib/adminAuth";
import { isPlan, priceFor, stripe, userFromRequest } from "@/lib/stripe";

// One checkout endpoint for both payment providers. NEXT_PUBLIC_CHECKOUT_PROVIDER
// picks which one new purchases go through ("stripe" or "dodo", default dodo).
// Existing Dodo customers keep being handled by /api/dodo/webhook either way.

const PROVIDER = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER === "stripe" ? "stripe" : "dodo";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  return PROVIDER === "stripe" ? stripeCheckout(req, body) : dodoCheckout(body);
}

// Stripe: the buyer must be signed in, so the subscription is always linked
// to their account (client_reference_id + subscription metadata).
async function stripeCheckout(req: Request, body: Record<string, unknown>) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });

  if (!isPlan(body.plan)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  const price = priceFor(body.plan);
  if (!price) return NextResponse.json({ error: `Price for '${body.plan}' is not configured` }, { status: 500 });

  const { data: profile } = await serviceClient()
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  const customer = profile?.stripe_customer_id ?? undefined;
  const origin = new URL(req.url).origin;
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === "true";

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan: body.plan },
      subscription_data: { metadata: { user_id: user.id, plan: body.plan } },
      ...(customer
        ? { customer, ...(automaticTax ? { customer_update: { address: "auto" as const } } : {}) }
        : { customer_email: user.email }),
      automatic_tax: { enabled: automaticTax },
      allow_promotion_codes: true,
      success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
    });
    return NextResponse.json({ checkout_url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}

async function dodoCheckout(body: Record<string, unknown>) {
  const productId = typeof body.productId === "string" ? body.productId : "";
  const email = typeof body.email === "string" ? body.email : undefined;
  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
      environment: process.env.NEXT_PUBLIC_DODO_MODE === "live" ? "live_mode" : "test_mode",
    });
    const session = await client.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: email ? { email } : undefined,
    });
    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (error) {
    console.error("Dodo Payments API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
