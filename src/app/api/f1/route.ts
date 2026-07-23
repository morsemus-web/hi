import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const resultsUrl = "https://api.jolpi.ca/ergast/f1/current/last/results.json";
    const resResults = await fetch(resultsUrl, { cache: "no-store" });
    if (!resResults.ok) throw new Error("F1 Results API failed");
    const resultsData = await resResults.json();

    const standingsUrl = "https://api.jolpi.ca/ergast/f1/current/driverStandings.json";
    const resStandings = await fetch(standingsUrl, { cache: "no-store" });
    if (!resStandings.ok) throw new Error("F1 Standings API failed");
    const standingsData = await resStandings.json();

    const lastRace = resultsData.MRData.RaceTable.Races[0];
    const topResult = lastRace.Results[0];

    const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 5);
    const standingsText = standingsList.map((s: any) => 
      `${s.position}. ${s.Driver.code || s.Driver.familyName} - ${s.points} pts`
    );

    const matches = [{
      id: "f1-latest",
      title: `${lastRace.season} ${lastRace.raceName}`,
      team1: topResult.Driver.code || topResult.Driver.familyName.substring(0,3).toUpperCase(),
      team2: "WINNER",
      team1Full: `${topResult.Driver.givenName} ${topResult.Driver.familyName}`,
      team2Full: "",
      score: "P1",
      extra: lastRace.raceName,
      status: "post",
      isLive: false,
      analysis: standingsText
    }];

    return NextResponse.json({ status: "success", matches }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" }
    });

  } catch (err) {
    console.error("F1 API Error:", err);
    return NextResponse.json(
      { status: "error", error: err instanceof Error ? err.message : "Failed to fetch F1 scores", matches: [] },
      { status: 502 }
    );
  }
}
