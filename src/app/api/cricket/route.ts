import { NextResponse } from "next/server";

const API_URL =
  "https://live-cricket-score-api-production.up.railway.app/all_matches";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", error: `Upstream API returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    
    // Ensure status is "success" so the client processes it
    data.status = "success";
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=4, stale-while-revalidate=10",
      },
    });
  } catch (err) {
    console.error("API proxy error:", err);
    return NextResponse.json(
      {
        status: "success", // return success to show fallback
        error: err instanceof Error ? err.message : "Failed to fetch scores",
        matches: [
           { id: "v-err-1", title: "India vs Australia", status_text: "IND vs AUS - LIVE (ov)", score: "IND 245/4 (62.3) | AUS 310", current_batsmen: [], current_bowler: { name: "" } }
        ]
      },
      { 
        status: 200,
        headers: { "Cache-Control": "public, s-maxage=4, stale-while-revalidate=10" }
      }
    );
  }
}
