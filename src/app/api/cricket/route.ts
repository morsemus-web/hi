import { NextResponse } from "next/server";

const API_URL =
  "https://live-cricket-score-api-production.up.railway.app/all_matches";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const fallbackMatches = {
    matches: [
      { id: "cm-1", title: "India vs Australia, 1st Test", status_text: "LIVE", score: "IND 245/4 (62.3) | AUS 310" },
      { id: "cm-2", title: "England vs South Africa, T20", status_text: "LIVE", score: "ENG 182/6 (20.0) | RSA 45/1 (5.2)" },
      { id: "cm-3", title: "Pakistan vs New Zealand, ODI", status_text: "IN PROGRESS", score: "PAK 120/2 (24.0)" }
    ]
  };

  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`Upstream API failed (${res.status}), using fallback mock data.`);
      return NextResponse.json(fallbackMatches, {
        headers: { "Cache-Control": "public, s-maxage=4, stale-while-revalidate=10" },
      });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=4, stale-while-revalidate=10" },
    });
  } catch (err) {
    console.warn("Upstream API unreachable, using fallback mock data.", err);
    return NextResponse.json(fallbackMatches, {
      headers: { "Cache-Control": "public, s-maxage=4, stale-while-revalidate=10" },
    });
  }
}
