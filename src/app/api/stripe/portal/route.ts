import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";
import { stripe, userFromRequest } from "@/lib/stripe";

// POST → a Stripe Billing Portal link where the signed-in user can update
// their card, download invoices or cancel.
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { data: profile } = await serviceClient()
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe subscription on this account" }, { status: 404 });
  }

  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${new URL(req.url).origin}/account`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe portal error:", err);
    return NextResponse.json({ error: "Could not open billing portal" }, { status: 500 });
  }
}
