import Stripe from "stripe";
import { serviceClient } from "@/lib/adminAuth";

// Server-only Stripe helpers. See docs/PAYMENTS.md.

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key);
  }
  return client;
}

/** Plans sold on the website, mapped to Stripe Price IDs from env. */
export const PLANS = {
  quarterly: "STRIPE_PRICE_QUARTERLY",
  annual: "STRIPE_PRICE_ANNUAL",
} as const;
export type Plan = keyof typeof PLANS;

export const isPlan = (v: unknown): v is Plan => typeof v === "string" && v in PLANS;

export function priceFor(plan: Plan): string | null {
  return process.env[PLANS[plan]] || null;
}

export function planForPrice(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  return (Object.keys(PLANS) as Plan[]).find((p) => priceFor(p) === priceId) ?? null;
}

/** Resolves the signed-in Supabase user from an Authorization: Bearer header. */
export async function userFromRequest(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const { data, error } = await serviceClient().auth.getUser(token);
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email };
}
