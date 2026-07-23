import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const urls = [
      "https://api.jolpi.ca/ergast/f1/current/last/results.json",
      "https://api.jolpi.ca/ergast/f1/current/driverStandings.json",
      "https://api.jolpi.ca/ergast/f1/current/next.json",
      "https://api.jolpi.ca/ergast/f1/current/results/1.json"
    ];

    const [resResults, resStandings, resNext, resWinners] = await Promise.all(
      urls.map(url => fetch(url, { cache: "no-store" }))
    );

    if (!resResults.ok || !resStandings.ok || !resNext.ok || !resWinners.ok) {
       throw new Error("F1 API failed");
    }

    const resultsData = await resResults.json();
    const standingsData = await resStandings.json();
    const nextData = await resNext.json();
    const winnersData = await resWinners.json();

    const lastRace = resultsData.MRData.RaceTable.Races[0];
    const topResult = lastRace.Results[0];

    const standingsList = standingsData.MRData.StandingsTable.StandingsLists[0].DriverStandings.slice(0, 5);
    
    // For backwards compatibility with the desktop widget
    const standingsText = standingsList.map((s: any) => 
      `${s.position}. ${s.Driver.code || s.Driver.familyName} - ${s.points} pts`
    );

    // Detailed standings for the website
    const detailedStandings = standingsList.map((s: any) => {
      const driverName = `${s.Driver.givenName} ${s.Driver.familyName}`;
      const constructorName = s.Constructors[0]?.name || "Unknown";
      return {
        position: s.position,
        name: driverName,
        code: s.Driver.code || s.Driver.familyName.substring(0,3).toUpperCase(),
        points: s.points,
        constructor: constructorName,
        image: `https://tse2.mm.bing.net/th?q=${encodeURIComponent(driverName + " f1 driver face")}&w=100&h=100&c=7&rs=1&p=0`,
        logo: `https://tse2.mm.bing.net/th?q=${encodeURIComponent(constructorName + " f1 team logo transparent")}&w=100&h=100&c=7&rs=1&p=0`
      };
    });

    const nextRace = nextData.MRData.RaceTable.Races[0];
    const nextRaceInfo = nextRace ? `${nextRace.raceName} (${nextRace.date})` : "TBD";

    const winners = winnersData.MRData.RaceTable.Races.map((r: any) => {
      const driverName = `${r.Results[0].Driver.givenName} ${r.Results[0].Driver.familyName}`;
      const constructorName = r.Results[0].Constructor.name;
      return {
        race: r.raceName,
        winner: driverName,
        constructor: constructorName,
        image: `https://tse2.mm.bing.net/th?q=${encodeURIComponent(driverName + " f1 driver face")}&w=100&h=100&c=7&rs=1&p=0`
      };
    });

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
      analysis: standingsText,
      standings: detailedStandings,
      nextRace: nextRaceInfo,
      pastWinners: winners
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
