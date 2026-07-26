import { NextResponse } from "next/server";
import { teamMeta } from "../teams";

export const dynamic = "force-dynamic";

const JOLPICA = "https://api.jolpi.ca/ergast/f1";
const PAGE = 100; // Jolpica caps the limit at 100 regardless of what you ask for

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

/**
 * Position of every driver on every lap, for the race-flow chart.
 *
 * A full grand prix is ~1,400 lap timings and Jolpica pages at 100, so the
 * first call is used to learn the total and the rest are fetched in parallel.
 * Finished races never change, hence the long cache.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Race id is required" }, { status: 400 });

  const [season, round] = id.split("-");
  if (!season || !round) {
    return NextResponse.json({ error: "Race id must be season-round" }, { status: 400 });
  }

  try {
    const base = `${JOLPICA}/${season}/${round}/laps.json`;
    const first = await getJson(`${base}?limit=${PAGE}`);
    const total: number = parseInt(first?.MRData?.total ?? "0", 10);

    if (!total) {
      return NextResponse.json(
        { status: "success", id, laps: [], drivers: [], totalLaps: 0, note: "no_lap_data" },
        { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
      );
    }

    const pages = Math.ceil(total / PAGE);
    const rest = await Promise.all(
      Array.from({ length: Math.max(0, pages - 1) }, (_, i) =>
        getJson(`${base}?limit=${PAGE}&offset=${(i + 1) * PAGE}`),
      ),
    );

    // Pages split mid-lap, so merge timings back together by lap number.
    const byLap = new Map<number, { driverId: string; position: number }[]>();
    [first, ...rest].forEach((page) => {
      (page?.MRData?.RaceTable?.Races?.[0]?.Laps ?? []).forEach((lap: any) => {
        const n = parseInt(lap.number, 10);
        const bucket = byLap.get(n) ?? [];
        (lap.Timings ?? []).forEach((t: any) => {
          bucket.push({ driverId: t.driverId, position: parseInt(t.position, 10) });
        });
        byLap.set(n, bucket);
      });
    });

    const laps = [...byLap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([number, positions]) => ({ number, positions }));

    // Grid slot is lap 0 on the chart, and the results give us identity.
    const results = await getJson(`${JOLPICA}/${season}/${round}/results.json`);
    const drivers = (results?.MRData?.RaceTable?.Races?.[0]?.Results ?? []).map((r: any) => {
      const meta = teamMeta(r.Constructor?.name ?? "");
      return {
        driverId: r.Driver.driverId,
        code: r.Driver.code ?? r.Driver.familyName.slice(0, 3).toUpperCase(),
        name: `${r.Driver.givenName} ${r.Driver.familyName}`,
        number: r.number ?? r.Driver.permanentNumber ?? "",
        team: meta.name || (r.Constructor?.name ?? ""),
        teamColor: meta.color,
        grid: parseInt(r.grid ?? "0", 10),
        finish: parseInt(r.position ?? "0", 10),
      };
    });

    return NextResponse.json(
      {
        status: "success",
        id,
        totalLaps: laps.length,
        drivers,
        laps,
      },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error("F1 laps error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load lap data",
      },
      { status: 502 },
    );
  }
}
