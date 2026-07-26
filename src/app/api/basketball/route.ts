import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// BALLDONTLIE is the fallback only. It has no live scores on the free tier, no
// venue, no broadcasts, and no logos — which is why the board looked empty most
// of the time. ESPN's public scoreboard has all of it and needs no key.
const BDL_KEY = process.env.BALLDONTLIE_API_KEY ?? "";

const ESPN_SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface Match {
  id: string;
  title: string;
  team1: string;
  team2: string;
  team1Full: string;
  team2Full: string;
  team1Logo: string;
  team2Logo: string;
  team1Score: string;
  team2Score: string;
  team1Record: string;
  team2Record: string;
  venue: string;
  broadcasts: string[];
  score: string;
  extra: string;
  status: "pre" | "in" | "post";
  isLive: boolean;
  startTime: string;
  league: string;
}

// "2026-03-15" (or anything Date can parse) -> "20260315", ESPN's format.
function espnDate(input?: string | null): string | null {
  if (!input) return null;
  const compact = input.replace(/-/g, "");
  if (/^\d{8}$/.test(compact)) return compact;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

function mapEspnEvent(event: any): Match | null {
  const comp = event?.competitions?.[0];
  if (!comp) return null;

  const competitors = comp.competitors ?? [];
  // ESPN lists home first; the rest of ScoreDeck shows away-at-home.
  const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0];
  const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1];
  if (!home || !away) return null;

  const state = (event.status?.type?.state ?? "pre") as "pre" | "in" | "post";
  const detail: string = event.status?.type?.shortDetail ?? event.status?.type?.detail ?? "";
  const homeScore = String(home.score ?? "");
  const awayScore = String(away.score ?? "");

  const score =
    state === "pre"
      ? "Upcoming"
      : `${away.team?.abbreviation ?? "AWY"} ${awayScore} - ${homeScore} ${home.team?.abbreviation ?? "HOM"}`;

  const broadcasts: string[] = [];
  (comp.broadcasts ?? []).forEach((b: any) => {
    (b.names ?? []).forEach((n: string) => {
      if (n && !broadcasts.includes(n)) broadcasts.push(n);
    });
  });

  return {
    id: String(event.id),
    title: event.name ?? `${away.team?.displayName} at ${home.team?.displayName}`,
    team1: away.team?.abbreviation ?? "",
    team2: home.team?.abbreviation ?? "",
    team1Full: away.team?.displayName ?? "",
    team2Full: home.team?.displayName ?? "",
    team1Logo: away.team?.logo ?? "",
    team2Logo: home.team?.logo ?? "",
    team1Score: awayScore,
    team2Score: homeScore,
    team1Record: away.records?.[0]?.summary ?? "",
    team2Record: home.records?.[0]?.summary ?? "",
    venue: comp.venue?.fullName ?? "",
    broadcasts,
    score,
    extra: detail,
    status: state,
    isLive: state === "in",
    startTime: event.date ?? "",
    league: "NBA",
  };
}

async function fetchEspn(date?: string | null): Promise<Match[]> {
  const d = espnDate(date);
  const url = d ? `${ESPN_SCOREBOARD}?dates=${d}` : ESPN_SCOREBOARD;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`ESPN scoreboard returned ${res.status}`);
  const json = await res.json();
  return (json.events ?? [])
    .map(mapEspnEvent)
    .filter((m: Match | null): m is Match => m !== null);
}

// Off-season and empty days are normal for the NBA. Rather than show nothing,
// walk forward to find the next slate so the board is never blank.
async function fetchNextSlate(from: Date, maxDays = 21): Promise<Match[]> {
  for (let i = 1; i <= maxDays; i++) {
    const probe = new Date(from);
    probe.setUTCDate(probe.getUTCDate() + i);
    const matches = await fetchEspn(probe.toISOString().slice(0, 10));
    if (matches.length > 0) return matches;
  }
  return [];
}

async function fetchBalldontlie(date: string): Promise<Match[]> {
  if (!BDL_KEY) return [];
  const res = await fetch(`https://api.balldontlie.io/v1/games?dates[]=${date}`, {
    headers: { Authorization: BDL_KEY },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const json = await res.json();

  return (json.data ?? []).map((event: any): Match => {
    const home = event.home_team;
    const away = event.visitor_team;
    const status: string = event.status ?? "";
    const isFinal = /final/i.test(status);
    const state: "pre" | "in" | "post" = isFinal ? "post" : event.period > 0 ? "in" : "pre";

    return {
      id: String(event.id),
      title: `${away?.full_name} at ${home?.full_name}`,
      team1: away?.abbreviation ?? "",
      team2: home?.abbreviation ?? "",
      team1Full: away?.full_name ?? "",
      team2Full: home?.full_name ?? "",
      team1Logo: "",
      team2Logo: "",
      team1Score: String(event.visitor_team_score ?? ""),
      team2Score: String(event.home_team_score ?? ""),
      team1Record: "",
      team2Record: "",
      venue: "",
      broadcasts: [],
      score:
        state === "pre"
          ? "Upcoming"
          : `${away?.abbreviation} ${event.visitor_team_score} - ${event.home_team_score} ${home?.abbreviation}`,
      extra: status,
      status: state,
      isLive: state === "in",
      startTime: event.date ?? "",
      league: "NBA",
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const today = new Date().toISOString().slice(0, 10);
  const requested = date || today;

  try {
    let matches: Match[] = [];
    let note = "";

    try {
      matches = await fetchEspn(requested);
    } catch {
      matches = await fetchBalldontlie(requested);
      note = "espn_unavailable";
    }

    if (matches.length === 0) {
      const upcoming = await fetchNextSlate(new Date(requested));
      if (upcoming.length > 0) {
        matches = upcoming;
        note = "no_games_on_date_showing_next_slate";
      }
    }

    return NextResponse.json(
      { status: "success", date: requested, note, matches },
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=60" } },
    );
  } catch (err) {
    console.error("NBA API Error:", err);
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Failed to fetch NBA scores",
        matches: [],
      },
      { status: 502 },
    );
  }
}
