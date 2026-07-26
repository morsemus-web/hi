import { NextResponse } from "next/server";
import { teamMeta, flagFor, countryFlag } from "../teams";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const JOLPICA = "https://api.jolpi.ca/ergast/f1";
const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";
const ESPN_CORE = "https://sports.core.api.espn.com/v2/sports/racing/leagues/f1";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Practice sessions have no results anywhere in Ergast/Jolpica — they only
// cover qualifying, sprint and race. ESPN's core API does carry them, keyed by
// competition id, which is why the two upstreams are stitched together here.
const SESSION_ABBR = ["FP1", "FP2", "FP3", "Sprint", "SprintQual", "Qual", "Race"] as const;
type SessionKey = (typeof SESSION_ABBR)[number];

interface Row {
  pos: string;
  driver: string;
  code: string;
  number: string;
  team: string;
  teamColor: string;
  flag: string;
  laps: string;
  gap: string;
  time: string;
  q1: string;
  q2: string;
  q3: string;
  grid: string;
  points: string;
  status: string;
}

function emptyRow(): Row {
  return {
    pos: "", driver: "", code: "", number: "", team: "", teamColor: "#8a9099",
    flag: "", laps: "", gap: "", time: "", q1: "", q2: "", q3: "",
    grid: "", points: "", status: "",
  };
}

async function getJson(url: string, timeoutMs = 9000): Promise<any | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    const res = await fetch(url, {
      cache: "no-store",
      signal: ctl.signal,
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function statMap(stats: any): Record<string, string> {
  const out: Record<string, string> = {};
  (stats?.splits?.categories ?? []).forEach((cat: any) => {
    (cat.stats ?? []).forEach((s: any) => {
      out[s.name] = s.displayValue ?? String(s.value ?? "");
    });
  });
  return out;
}

/**
 * Results for one session of the live race weekend, from ESPN.
 * One request per driver, fired in parallel — ESPN exposes no bulk form.
 */
async function espnSession(
  eventId: string,
  competition: any,
  constructors: Record<string, string>,
): Promise<Row[]> {
  const competitors = competition.competitors ?? [];
  if (competitors.length === 0) return [];

  const rows = await Promise.all(
    competitors.map(async (c: any): Promise<Row | null> => {
      const athlete = c.athlete ?? {};
      const name: string = athlete.displayName ?? "";
      const stats = statMap(
        await getJson(
          `${ESPN_CORE}/events/${eventId}/competitions/${competition.id}/competitors/${c.id}/statistics`,
        ),
      );
      if (Object.keys(stats).length === 0 && !c.order) return null;

      const surname = name.split(/\s+/).pop()?.toLowerCase() ?? "";
      const constructor = constructors[surname] ?? "";
      const meta = teamMeta(constructor);

      // ESPN zero-fills the qualifying columns on non-qualifying sessions.
      const q = (k: string) => {
        const v = stats[k] ?? "";
        return v && v !== "0.000" ? v : "";
      };

      return {
        ...emptyRow(),
        pos: stats.place ?? String(c.order ?? ""),
        driver: name,
        code: athlete.shortName ?? "",
        team: meta.name || constructor,
        teamColor: meta.color,
        flag: athlete.flag?.href ?? "",
        laps: stats.lapsCompleted ?? "",
        gap: stats.behindTime ?? "",
        time: stats.totalTime ?? "",
        q1: q("qual1TimeMS"),
        q2: q("qual2TimeMS"),
        q3: q("qual3TimeMS"),
        points: stats.championshipPts && stats.championshipPts !== "0" ? stats.championshipPts : "",
      };
    }),
  );

  return rows
    .filter((r): r is Row => r !== null)
    .sort((a, b) => (parseInt(a.pos, 10) || 99) - (parseInt(b.pos, 10) || 99));
}

function jolpicaRaceRows(results: any[]): Row[] {
  return results.map((r: any): Row => {
    const meta = teamMeta(r.Constructor?.name ?? "");
    return {
      ...emptyRow(),
      pos: r.positionText ?? r.position,
      driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
      code: r.Driver.code ?? "",
      number: r.number ?? r.Driver.permanentNumber ?? "",
      team: meta.name || (r.Constructor?.name ?? ""),
      teamColor: meta.color,
      flag: flagFor(r.Driver.nationality ?? ""),
      laps: r.laps ?? "",
      gap: r.Time?.time ?? "",
      time: r.Time?.time ?? r.status ?? "",
      grid: r.grid ?? "",
      points: r.points ?? "",
      status: r.status ?? "",
    };
  });
}

function jolpicaQualiRows(results: any[]): Row[] {
  return results.map((q: any): Row => {
    const meta = teamMeta(q.Constructor?.name ?? "");
    return {
      ...emptyRow(),
      pos: q.position,
      driver: `${q.Driver.givenName} ${q.Driver.familyName}`,
      code: q.Driver.code ?? "",
      number: q.number ?? q.Driver.permanentNumber ?? "",
      team: meta.name || (q.Constructor?.name ?? ""),
      teamColor: meta.color,
      flag: flagFor(q.Driver.nationality ?? ""),
      q1: q.Q1 ?? "",
      q2: q.Q2 ?? "",
      q3: q.Q3 ?? "",
      time: q.Q3 || q.Q2 || q.Q1 || "",
    };
  });
}

// Before lights out there is no classification, but there IS a grid — which is
// what the Race tab should show rather than an empty table.
function gridRows(quali: Row[]): Row[] {
  return quali.map((q) => ({ ...q, grid: q.pos, pos: "-", time: "", q1: "", q2: "", q3: "" }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const wanted = (searchParams.get("session") ?? "") as SessionKey | "";

  if (!id) {
    return NextResponse.json({ error: "Race id is required" }, { status: 400 });
  }

  const [season, round] = id.split("-");
  if (!season || !round) {
    return NextResponse.json({ error: "Race id must be season-round" }, { status: 400 });
  }

  try {
    const [raceInfo, results, qualifying, sprint, standings, scoreboard] = await Promise.all([
      getJson(`${JOLPICA}/${season}/${round}.json`),
      getJson(`${JOLPICA}/${season}/${round}/results.json`),
      getJson(`${JOLPICA}/${season}/${round}/qualifying.json`),
      getJson(`${JOLPICA}/${season}/${round}/sprint.json`),
      getJson(`${JOLPICA}/${season}/driverStandings.json`),
      getJson(ESPN_SCOREBOARD),
    ]);

    const race =
      raceInfo?.MRData?.RaceTable?.Races?.[0] ??
      results?.MRData?.RaceTable?.Races?.[0] ??
      null;

    if (!race) {
      return NextResponse.json({ status: "error", error: "Race not found" }, { status: 404 });
    }

    // surname -> constructor, so ESPN rows (which carry no team) can be coloured
    const constructors: Record<string, string> = {};
    const numbers: Record<string, string> = {};
    (standings?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []).forEach(
      (s: any) => {
        const key = s.Driver.familyName?.toLowerCase();
        if (key) {
          constructors[key] = s.Constructors?.[0]?.name ?? "";
          numbers[key] = s.Driver.permanentNumber ?? "";
        }
      },
    );

    const espnEvent = scoreboard?.events?.[0] ?? null;
    const isThisWeekend =
      !!espnEvent?.name &&
      espnEvent.name
        .toLowerCase()
        .includes(race.raceName.toLowerCase().replace(/^aws\s+/i, ""));

    const espnComps: Record<string, any> = {};
    if (isThisWeekend) {
      (espnEvent.competitions ?? []).forEach((c: any) => {
        const abbr = c.type?.abbreviation;
        if (abbr) espnComps[abbr] = c;
      });
    }

    const scheduled = (name: string, block: any) =>
      block ? { name, date: `${block.date}T${block.time ?? "00:00:00Z"}`, state: "pre", detail: "" } : null;

    const sessions = SESSION_ABBR.map((abbr) => {
      const comp = espnComps[abbr];
      if (comp) {
        return {
          name: abbr,
          date: comp.date ?? "",
          state: comp.status?.type?.state ?? "pre",
          detail: comp.status?.type?.detail ?? "",
          available: true,
        };
      }
      const fromCalendar =
        abbr === "FP1" ? scheduled(abbr, race.FirstPractice)
        : abbr === "FP2" ? scheduled(abbr, race.SecondPractice)
        : abbr === "FP3" ? scheduled(abbr, race.ThirdPractice)
        : abbr === "Sprint" ? scheduled(abbr, race.Sprint)
        : abbr === "Qual" ? scheduled(abbr, race.Qualifying)
        : abbr === "Race"
          ? { name: abbr, date: `${race.date}T${race.time ?? "00:00:00Z"}`, state: "pre", detail: "" }
          : null;
      if (!fromCalendar) return null;
      // Practice classifications only exist while ESPN is covering the weekend.
      const available =
        abbr === "Qual"
          ? (qualifying?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults ?? []).length > 0
          : abbr === "Race"
            ? (results?.MRData?.RaceTable?.Races?.[0]?.Results ?? []).length > 0
            : abbr === "Sprint"
              ? (sprint?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? []).length > 0
              : false;
      return { ...fromCalendar, available };
    }).filter(Boolean) as {
      name: string; date: string; state: string; detail: string; available: boolean;
    }[];

    // A specific session was asked for — return just its classification.
    let rows: Row[] = [];
    let sessionMeta: (typeof sessions)[number] | null = null;

    if (wanted) {
      sessionMeta = sessions.find((s) => s.name === wanted) ?? null;
      const comp = espnComps[wanted];

      if (comp && comp.status?.type?.state !== "pre") {
        rows = await espnSession(String(espnEvent.id), comp, constructors);
      }

      // ESPN unavailable (a past round) — Jolpica covers everything but practice.
      if (rows.length === 0) {
        if (wanted === "Race") {
          const r = results?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
          rows = r.length
            ? jolpicaRaceRows(r)
            : gridRows(jolpicaQualiRows(qualifying?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults ?? []));
        } else if (wanted === "Qual") {
          rows = jolpicaQualiRows(
            qualifying?.MRData?.RaceTable?.Races?.[0]?.QualifyingResults ?? [],
          );
        } else if (wanted === "Sprint") {
          rows = jolpicaRaceRows(sprint?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? []);
        }
      }

      // Fill in permanent numbers, which ESPN's stats blob omits.
      rows = rows.map((r) => ({
        ...r,
        number: r.number || numbers[r.driver.split(/\s+/).pop()?.toLowerCase() ?? ""] || "",
      }));
    }

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
        flag: countryFlag(race.Circuit?.Location?.country ?? ""),
        startDate: `${race.date}T${race.time ?? "00:00:00Z"}`,
        wikipedia: race.url ?? "",
        hasSprint: !!race.Sprint,
        liveWeekend: isThisWeekend,
        sessions,
        session: wanted || null,
        sessionState: sessionMeta?.state ?? null,
        sessionDate: sessionMeta?.date ?? null,
        results: rows,
      },
      { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" } },
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
