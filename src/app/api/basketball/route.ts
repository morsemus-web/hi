import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_KEY = "a2f7acf4-1a64-46c3-a77d-c0726df92e35";

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Fetch today's games
    let res = await fetch(`https://api.balldontlie.io/v1/games?dates[]=${today}`, {
      headers: { "Authorization": API_KEY },
      cache: "no-store"
    });
    
    if (!res.ok) throw new Error("Balldontlie API failed");
    
    let data = await res.json();
    let events = data.data || [];

    // 2. If no games today, fetch recent or upcoming (we'll just drop dates constraint)
    if (events.length === 0) {
      res = await fetch(`https://api.balldontlie.io/v1/games?per_page=10`, {
        headers: { "Authorization": API_KEY },
        cache: "no-store"
      });
      data = await res.json();
      events = data.data || [];
    }

    const matches: any[] = [];

    events.forEach((event: any) => {
      const home = event.home_team;
      const away = event.visitor_team;

      // Status logic
      const isLive = event.period > 0 && event.status !== "Final" && !event.status.includes("Final") && !event.status.includes("Half");
      const statusState = event.status === "Final" || event.status.includes("Final") ? "post" : (event.period > 0 ? "in" : "pre");
      
      const score = statusState === "pre" 
        ? "Upcoming" 
        : `${away.abbreviation} ${event.visitor_team_score} - ${event.home_team_score} ${home.abbreviation}`;

      let extra = event.status; // e.g. "Final", "1st Qtr", "8:30 PM ET"

      const homeLogo = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(home.full_name + " nba logo transparent")}&w=100&h=100&c=7&rs=1&p=0`;
      const awayLogo = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(away.full_name + " nba logo transparent")}&w=100&h=100&c=7&rs=1&p=0`;
      const venue = home.city ? `${home.city} Arena` : "Unknown Venue"; // Balldontlie doesn't supply venue, so we make a best effort
      const broadcasts: string[] = []; // Balldontlie doesn't supply broadcasts

      matches.push({
        id: event.id.toString(),
        title: `${away.name} at ${home.name}`,
        team1: away.abbreviation,
        team2: home.abbreviation,
        team1Full: away.full_name,
        team2Full: home.full_name,
        team1Logo: awayLogo,
        team2Logo: homeLogo,
        venue,
        broadcasts,
        score,
        extra,
        status: statusState,
        isLive,
      });
    });

    return NextResponse.json({ status: "success", matches }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" }
    });

  } catch (err) {
    console.error("NBA API Error:", err);
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Failed to fetch NBA scores", matches: [] },
      { status: 502 }
    );
  }
}
