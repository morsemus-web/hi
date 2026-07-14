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
        { status: "error", error: `Upstream API returned status ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    
    // Ensure status is success so the client parses the matches list
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
        status: "error",
        error: err instanceof Error ? err.message : "Failed to fetch scores",
        matches: []
      },
      { status: 502 }
    );
  }
}
