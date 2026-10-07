import { NextResponse } from "next/server";
import { consentRequired } from "@/lib/region";

export const dynamic = "force-dynamic";

// Tells web, desktop and android whether this visitor's country requires
// consent before anonymous usage stats are collected. Country comes from
// Vercel's geo header; nothing is stored.
export async function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country");
  return NextResponse.json(
    { country: country ?? null, consentRequired: consentRequired(country) },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
