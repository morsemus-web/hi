import { NextResponse } from "next/server";

// Public read-only endpoint that hands mobile + desktop clients the same
// Dodo product IDs the website's Pricing.tsx uses. Keeps the mobile app
// automatically in sync when the ID changes — no rebuild required.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    monthly: process.env.NEXT_PUBLIC_DODO_MONTHLY_ID ?? null,
    annual:  process.env.NEXT_PUBLIC_DODO_ANNUAL_ID  ?? null,
    // The mobile ad-free tier reuses the annual product by design ($20/yr).
    mobile:  process.env.NEXT_PUBLIC_DODO_ANNUAL_ID  ?? null,
  });
}
