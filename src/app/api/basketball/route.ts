import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const url = "http://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      throw new Error(`ESPN API returned ${res.status}`);
    }

    const data = await res.json();
    const matches: any[] = [];

    if (data.events && Array.isArray(data.events)) {
      data.events.forEach((event: any) => {
        const comp = event.competitions[0];
        if (!comp) return;
        
        const home = comp.competitors.find((c: any) => c.homeAway === "home");
        const away = comp.competitors.find((c: any) => c.homeAway === "away");
        
        if (!home || !away) return;

        const isLive = event.status.type.state === "in";
        const isCompleted = event.status.type.state === "post";
        
        // Construct standard score format "LAL 102 - 98 BOS"
        let score = "0-0";
        if (isLive || isCompleted) {
           score = `${away.score}-${home.score}`;
        } else {
           score = "Upcoming";
        }

        let extra = event.status.type.detail || "";
        
        // Try to construct a simple string for the widget
        matches.push({
          id: event.id,
          title: event.name,
          team1: away.team.abbreviation,
          team2: home.team.abbreviation,
          team1Full: away.team.displayName,
          team2Full: home.team.displayName,
          score,
          extra,
          status: event.status.type.state,
          isLive,
        });
      });
    }

    // No matches found, return empty array (handled by frontend)

    return NextResponse.json({ status: "success", matches }, {
      headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" }
    });
  } catch (err) {
    console.error("Basketball API Error:", err);
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Failed to fetch basketball scores", matches: [] },
      { status: 502 }
    );
  }
}
