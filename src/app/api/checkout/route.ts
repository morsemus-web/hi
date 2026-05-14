import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";

const client = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY || "",
  environment: (process.env.NEXT_PUBLIC_DODO_MODE === "live" ? "live_mode" : "test_mode") as any,
});

export async function POST(req: Request) {
  try {
    const { productId, email } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Create a checkout session
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
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
