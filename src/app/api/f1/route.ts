import { NextResponse } from "next/server";
import { teamMeta, flagFor, countryFlag } from "./teams";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Two upstreams, each for what it's actually good at:
//   ESPN     -> the live race weekend (per-session status, so "Race — Lap 32/70"
//               shows up while it's happening). Jolpica has no live data at all.
//   Jolpica  -> the structured season: full calendar, standings, results.
// The old route used only Jolpica's "last race", so the board showed exactly one
// finished event and never went live.
const ESPN_F1 = "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard";
const JOLPICA = "https://api.jolpi.ca/ergast/f1";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface Session {
  name: string;
  date: string;
  state: "pre" | "in" | "post";
  detail: string;
}

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

const SESSION_NAMES: Record<string, string> = {
  FP1: "Practice 1",
  FP2: "Practice 2",
  FP3: "Practice 3",
  Qual: "Qualifying",
  Sprint: "Sprint",
  SprintQual: "Sprint Qualifying",
  Race: "Race",
};

function espnSessions(event: any): Session[] {
  return (event?.competitions ?? []).map((c: any) => {
    const abbr = c.type?.abbreviation ?? "";
    return {
      name: SESSION_NAMES[abbr] ?? abbr ?? "Session",
      date: c.date ?? "",
      state: (c.status?.type?.state ?? "pre") as "pre" | "in" | "post",
      detail: c.status?.type?.detail ?? c.status?.type?.shortDetail ?? "",
    };
  });
}

// ESPN headshots are keyed by athlete id, which only the scoreboard gives us.
// Build a name -> id map so standings rows can show real faces instead of the
// image-search URLs the old route guessed at.
// Index by full name AND by surname: ESPN and Jolpica disagree on given names
// ("Kimi Antonelli" vs "Andrea Kimi Antonelli"), which silently blanked every
// headshot when only exact matches were tried.
function driverIdMap(event: any): Record<string, string> {
  const map: Record<string, string> = {};
  (event?.competitions ?? []).forEach((c: any) => {
    (c.competitors ?? []).forEach((comp: any) => {
      const name: string | undefined = comp.athlete?.displayName;
      if (!name || !comp.id) return;
      const id = String(comp.id);
      map[name.toLowerCase()] = id;
      const surname = name.split(/\s+/).pop();
      // Don't let a surname collision (two Schumachers) pick the wrong face.
      if (surname) {
        const key = `~${surname.toLowerCase()}`;
        map[key] = map[key] && map[key] !== id ? "" : id;
      }
    });
  });
  return map;
}

const STATIC_F1_DRIVER_IDS: Record<string, string> = {
  "verstappen": "4665",
  "hamilton": "868",
  "leclerc": "4763",
  "norris": "4795",
  "piastri": "4836",
  "russell": "4794",
  "sainz": "4764",
  "alonso": "870",
  "perez": "4463",
  "tsunoda": "4828",
  "albon": "4796",
  "gasly": "4765",
  "ocon": "4766",
  "stroll": "4767",
  "hulkenberg": "872",
  "magnussen": "4553",
  "bottas": "4666",
  "zhou": "4837",
  "ricciardo": "4552",
  "lawson": "4838",
  "bearman": "4840",
  "antonelli": "4841",
  "doohan": "4842",
  "colapinto": "4843",
  "hadjar": "4844",
  "bortoleto": "4845"
};

function headshot(name: string, ids: Record<string, string>): string {
  const surname = name.split(/\s+/).pop()?.toLowerCase() || "";
  const id = ids[name.toLowerCase()] || (surname ? ids[`~${surname}`] : "") || STATIC_F1_DRIVER_IDS[surname] || STATIC_F1_DRIVER_IDS[name.toLowerCase()];
  return id ? `https://a.espncdn.com/i/headshots/rpm/players/full/${id}.png` : "https://a.espncdn.com/i/headshots/nophoto.png";
}

export async function GET() {
  try {
    const [
      espn,
      schedule,
      driverStandings,
      constructorStandings,
      lastResults,
      winners,
      seconds,
      thirds,
      poles,
    ] = await Promise.all([
      getJson(ESPN_F1),
      getJson(`${JOLPICA}/current.json?limit=30`),
      getJson(`${JOLPICA}/current/driverStandings.json`),
      getJson(`${JOLPICA}/current/constructorStandings.json`),
      getJson(`${JOLPICA}/current/last/results.json`),
      getJson(`${JOLPICA}/current/results/1.json?limit=100`),
      // P2 and P3 finishes give podium counts; grid-slot-1 qualifying gives
      // poles. Ergast exposes no aggregate for either, so count them here.
      getJson(`${JOLPICA}/current/results/2.json?limit=100`),
      getJson(`${JOLPICA}/current/results/3.json?limit=100`),
      getJson(`${JOLPICA}/current/qualifying/1.json?limit=100`),
    ]);

    const espnEvent = espn?.events?.[0] ?? null;
    const ids = driverIdMap(espnEvent);
    const sessions = espnSessions(espnEvent);

    const races: any[] = schedule?.MRData?.RaceTable?.Races ?? [];
    const season = schedule?.MRData?.RaceTable?.season ?? new Date().getFullYear().toString();

    const standingsList =
      driverStandings?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const constructorList =
      constructorStandings?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ??
      [];

    // driverId -> how many times they finished there / started on pole
    const tally = (payload: any): Record<string, number> => {
      const out: Record<string, number> = {};
      (payload?.MRData?.RaceTable?.Races ?? []).forEach((r: any) => {
        const entry = r.Results?.[0] ?? r.QualifyingResults?.[0];
        const dId = entry?.Driver?.driverId;
        if (dId) out[dId] = (out[dId] ?? 0) + 1;
      });
      return out;
    };
    const p1 = tally(winners);
    const p2 = tally(seconds);
    const p3 = tally(thirds);
    const polesBy = tally(poles);

    const detailedStandings = standingsList.slice(0, 24).map((s: any) => {
      const name = `${s.Driver.givenName} ${s.Driver.familyName}`;
      const dId = s.Driver.driverId;
      const constructor = s.Constructors?.[0]?.name ?? "";
      const meta = teamMeta(constructor);
      return {
        position: s.position,
        driverId: dId,
        name,
        code: s.Driver.code || s.Driver.familyName.substring(0, 3).toUpperCase(),
        number: s.Driver.permanentNumber ?? "",
        points: s.points,
        wins: s.wins,
        poles: String(polesBy[dId] ?? 0),
        podiums: String((p1[dId] ?? 0) + (p2[dId] ?? 0) + (p3[dId] ?? 0)),
        nationality: s.Driver.nationality,
        flag: flagFor(s.Driver.nationality ?? ""),
        constructor: meta.name || constructor,
        teamColor: meta.color,
        image: headshot(name, ids),
      };
    });

    // Team totals aggregate their two drivers — Ergast gives constructor wins
    // but no constructor poles or podiums.
    const byConstructor = (key: "poles" | "podiums", teamName: string): number =>
      detailedStandings
        .filter((d: any) => d.constructor === teamName)
        .reduce((sum: number, d: any) => sum + parseInt(d[key], 10), 0);

    const teamStandings = constructorList.map((c: any) => {
      const meta = teamMeta(c.Constructor?.name ?? "");
      const name = meta.name || (c.Constructor?.name ?? "");
      return {
        position: c.position,
        name,
        nationality: c.Constructor?.nationality ?? "",
        teamColor: meta.color,
        points: c.points,
        wins: c.wins,
        poles: String(byConstructor("poles", name)),
        podiums: String(byConstructor("podiums", name)),
      };
    });

    // Legacy: the desktop widget reads matches[0].analysis as plain text lines.
    const standingsText = detailedStandings
      .slice(0, 5)
      .map((s: any) => `${s.position}. ${s.code} - ${s.points} pts`);

    const pastWinners = (winners?.MRData?.RaceTable?.Races ?? []).map((r: any) => {
      const name = `${r.Results[0].Driver.givenName} ${r.Results[0].Driver.familyName}`;
      return {
        round: r.round,
        race: r.raceName,
        date: r.date,
        winner: name,
        constructor: r.Results[0].Constructor.name,
        image: headshot(name, ids),
      };
    });

    const lastRace = lastResults?.MRData?.RaceTable?.Races?.[0] ?? null;

    // Which calendar round is the live/next one? Prefer ESPN's opinion, since it
    // knows a session is running right now; otherwise fall back to the date.
    const now = Date.now();
    const liveSession = sessions.find((s) => s.state === "in");
    const espnRaceName: string = espnEvent?.name ?? "";

    const matches = races.map((r: any, idx: number) => {
      const raceStart = new Date(`${r.date}T${r.time ?? "00:00:00Z"}`);
      const isEspnEvent =
        !!espnRaceName &&
        espnRaceName.toLowerCase().includes(r.raceName.toLowerCase().replace(/^aws\s+/i, ""));
      const finished = raceStart.getTime() + 3 * 60 * 60 * 1000 < now;

      const state: "pre" | "in" | "post" = isEspnEvent
        ? liveSession
          ? "in"
          : sessions.every((s) => s.state === "post")
            ? "post"
            : "pre"
        : finished
          ? "post"
          : "pre";

      const winner = pastWinners.find((w: any) => w.round === r.round);

      return {
        id: `${season}-${r.round}`,
        round: r.round,
        season,
        title: r.raceName,
        circuit: r.Circuit?.circuitName ?? "",
        locality: r.Circuit?.Location?.locality ?? "",
        country: r.Circuit?.Location?.country ?? "",
        flag: countryFlag(r.Circuit?.Location?.country ?? ""),
        team1: winner?.winner ? winner.winner.split(" ").pop() : "",
        team2: winner ? "WINNER" : "",
        team1Full: winner?.winner ?? "",
        team2Full: winner?.constructor ?? "",
        score: winner ? "P1" : "",
        extra: isEspnEvent
          ? liveSession?.detail || sessions.find((s) => s.state === "pre")?.detail || r.date
          : `${r.Circuit?.Location?.locality ?? ""}, ${r.Circuit?.Location?.country ?? ""}`,
        status: state,
        isLive: state === "in" && isEspnEvent,
        startTime: raceStart.toISOString(),
        sessions: isEspnEvent
          ? sessions
          : [
              r.FirstPractice && {
                name: "Practice 1",
                date: `${r.FirstPractice.date}T${r.FirstPractice.time ?? "00:00:00Z"}`,
                state: "pre" as const,
                detail: "",
              },
              r.SecondPractice && {
                name: "Practice 2",
                date: `${r.SecondPractice.date}T${r.SecondPractice.time ?? "00:00:00Z"}`,
                state: "pre" as const,
                detail: "",
              },
              r.ThirdPractice && {
                name: "Practice 3",
                date: `${r.ThirdPractice.date}T${r.ThirdPractice.time ?? "00:00:00Z"}`,
                state: "pre" as const,
                detail: "",
              },
              r.Sprint && {
                name: "Sprint",
                date: `${r.Sprint.date}T${r.Sprint.time ?? "00:00:00Z"}`,
                state: "pre" as const,
                detail: "",
              },
              r.Qualifying && {
                name: "Qualifying",
                date: `${r.Qualifying.date}T${r.Qualifying.time ?? "00:00:00Z"}`,
                state: "pre" as const,
                detail: "",
              },
              {
                name: "Race",
                date: raceStart.toISOString(),
                state: "pre" as const,
                detail: "",
              },
            ].filter(Boolean),
        // Legacy payload the desktop widget still reads off the first entry.
        ...(idx === 0
          ? {
              analysis: standingsText,
              standings: detailedStandings,
              nextRace: (() => {
                const next = races.find(
                  (rr: any) =>
                    new Date(`${rr.date}T${rr.time ?? "00:00:00Z"}`).getTime() > now,
                );
                return next ? `${next.raceName} (${next.date})` : "Season complete";
              })(),
              pastWinners,
            }
          : {}),
      };
    });

    // Put the live or next round first; the feed reads top-down.
    const pivot = matches.findIndex((m) => m.isLive || m.status === "pre");
    const ordered =
      pivot > 0 ? [...matches.slice(pivot), ...matches.slice(0, pivot).reverse()] : matches;

    return NextResponse.json(
      {
        status: "success",
        season,
        lastRace: lastRace
          ? {
              round: lastRace.round,
              name: lastRace.raceName,
              date: lastRace.date,
              results: (lastRace.Results ?? []).map((res: any) => {
                const name = `${res.Driver.givenName} ${res.Driver.familyName}`;
                return {
                  position: res.position,
                  name,
                  code: res.Driver.code ?? "",
                  constructor: res.Constructor?.name ?? "",
                  time: res.Time?.time ?? res.status ?? "",
                  points: res.points,
                  grid: res.grid,
                  laps: res.laps,
                  fastestLap: res.FastestLap?.Time?.time ?? "",
                  image: headshot(name, ids),
                };
              }),
            }
          : null,
        standings: detailedStandings,
        constructorStandings: teamStandings,
        matches: ordered,
      },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
    );
  } catch (err) {
    console.error("F1 API Error:", err);
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Failed to fetch F1 data",
        matches: [],
      },
      { status: 502 },
    );
  }
}
