import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const JOLPICA = "https://api.jolpi.ca/ergast/f1";
const ESPN_F1 = "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function driverIdMap(event: any): Record<string, string> {
  const map: Record<string, string> = {};
  (event?.competitions ?? []).forEach((c: any) => {
    (c.competitors ?? []).forEach((comp: any) => {
      const name = comp.athlete?.displayName;
      if (name && comp.id) map[name.toLowerCase()] = String(comp.id);
    });
  });
  return map;
}

function headshot(name: string, ids: Record<string, string>): string {
  const id = ids[name.toLowerCase()];
  return id ? `https://a.espncdn.com/i/headshots/rpm/players/full/${id}.png` : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id"); // "2026-13"

  if (!id) {
    return NextResponse.json({ error: "Race id is required" }, { status: 400 });
  }

  const [season, round] = id.split("-");
  if (!season || !round) {
    return NextResponse.json({ error: "Race id must be season-round" }, { status: 400 });
  }

  try {
    const [raceInfo, results, qualifying, sprint, laps, pitstops, espn] = await Promise.all([
      getJson(`${JOLPICA}/${season}/${round}.json`),
      getJson(`${JOLPICA}/${season}/${round}/results.json`),
      getJson(`${JOLPICA}/${season}/${round}/qualifying.json`),
      getJson(`${JOLPICA}/${season}/${round}/sprint.json`),
      getJson(`${JOLPICA}/${season}/${round}/laps/1.json?limit=30`),
      getJson(`${JOLPICA}/${season}/${round}/pitstops.json?limit=60`),
      getJson(ESPN_F1),
    ]);

    const race =
      raceInfo?.MRData?.RaceTable?.Races?.[0] ??
      results?.MRData?.RaceTable?.Races?.[0] ??
      null;

    if (!race) {
      return NextResponse.json(
        { status: "error", error: "Race not found" },
        { status: 404 },
      );
    }

    const espnEvent = espn?.events?.[0] ?? null;
    const ids = driverIdMap(espnEvent);
    const isThisWeekend =
      !!espnEvent?.name &&
      espnEvent.name.toLowerCase().includes(race.raceName.toLowerCase().replace(/^aws\s+/i, ""));

    const sessions = isThisWeekend
      ? (espnEvent.competitions ?? []).map((c: any) => ({
          name: c.type?.abbreviation ?? "Session",
          date: c.date ?? "",
          state: c.status?.type?.state ?? "pre",
          detail: c.status?.type?.detail ?? "",
        }))
      : [
          race.FirstPractice && { name: "FP1", date: `${race.FirstPractice.date}T${race.FirstPractice.time ?? "00:00:00Z"}`, state: "pre", detail: "" },
          race.SecondPractice && { name: "FP2", date: `${race.SecondPractice.date}T${race.SecondPractice.time ?? "00:00:00Z"}`, state: "pre", detail: "" },
          race.ThirdPractice && { name: "FP3", date: `${race.ThirdPractice.date}T${race.ThirdPractice.time ?? "00:00:00Z"}`, state: "pre", detail: "" },
          race.Sprint && { name: "Sprint", date: `${race.Sprint.date}T${race.Sprint.time ?? "00:00:00Z"}`, state: "pre", detail: "" },
          race.Qualifying && { name: "Qual", date: `${race.Qualifying.date}T${race.Qualifying.time ?? "00:00:00Z"}`, state: "pre", detail: "" },
          { name: "Race", date: `${race.date}T${race.time ?? "00:00:00Z"}`, state: "pre", detail: "" },
        ].filter(Boolean);

    const raceResults = (results?.MRData?.RaceTable?.Races?.[0]?.Results ?? []).map(
      (r: any) => {
        const name = `${r.Driver.givenName} ${r.Driver.familyName}`;
        return {
          position: r.position,
          positionText: r.positionText,
          name,
          code: r.Driver.code ?? "",
          number: r.number,
          constructor: r.Constructor?.name ?? "",
          grid: r.grid,
          laps: r.laps,
          status: r.status,
          time: r.Time?.time ?? "",
          points: r.points,
          fastestLap: r.FastestLap?.Time?.time ?? "",
          fastestLapRank: r.FastestLap?.rank ?? "",
          avgSpeed: r.FastestLap?.AverageSpeed
            ? `${r.FastestLap.AverageSpeed.speed} ${r.FastestLap.AverageSpeed.units}`
            : "",
          image: headshot(name, ids),
        };
      },
    );

    const qualiResults = (
      qualifying?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults ?? []
    ).map((q: any) => {
      const name = `${q.Driver.givenName} ${q.Driver.familyName}`;
      return {
        position: q.position,
        name,
        code: q.Driver.code ?? "",
        constructor: q.Constructor?.name ?? "",
        q1: q.Q1 ?? "",
        q2: q.Q2 ?? "",
        q3: q.Q3 ?? "",
        image: headshot(name, ids),
      };
    });

    const sprintResults = (results
      ? sprint?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? []
      : []
    ).map((s: any) => ({
      position: s.position,
      name: `${s.Driver.givenName} ${s.Driver.familyName}`,
      code: s.Driver.code ?? "",
      constructor: s.Constructor?.name ?? "",
      laps: s.laps,
      status: s.status,
      time: s.Time?.time ?? "",
      points: s.points,
    }));

    const stops = (pitstops?.MRData?.RaceTable?.Races?.[0]?.PitStops ?? []).map((p: any) => ({
      driver: p.driverId,
      lap: p.lap,
      stop: p.stop,
      duration: p.duration,
      time: p.time,
    }));

    const gridStart = (laps?.MRData?.RaceTable?.Races?.[0]?.Laps?.[0]?.Timings ?? []).map(
      (t: any) => ({ driver: t.driverId, position: t.position, time: t.time }),
    );

    return NextResponse.json(
      {
        status: "success",
        id,
        season,
        round,
        title: race.raceName,
        circuit: race.Circuit?.circuitName ?? "",
        locality: race.Circuit?.Location?.locality ?? "",
        country: race.Circuit?.Location?.country ?? "",
        startDate: `${race.date}T${race.time ?? "00:00:00Z"}`,
        wikipedia: race.url ?? "",
        sessions,
        results: raceResults,
        qualifying: qualiResults,
        sprint: sprintResults,
        pitstops: stops,
        lapOneOrder: gridStart,
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
    );
  } catch (error) {
    console.error("F1 detail error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load race details",
      },
      { status: 502 },
    );
  }
}
