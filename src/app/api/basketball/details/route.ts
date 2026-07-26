import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ESPN_SUMMARY =
  "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ESPN returns team stats as a flat label/value list; the app wants them paired
// home-vs-away like the football stats tab does.
function pairTeamStats(teams: any[]): { label: string; away: string; home: string }[] {
  const away = teams.find((t: any) => t.homeAway === "away") ?? teams[0];
  const home = teams.find((t: any) => t.homeAway === "home") ?? teams[1];
  const awayStats: any[] = away?.statistics ?? [];
  const homeStats: any[] = home?.statistics ?? [];

  return awayStats.map((s: any) => ({
    label: s.label ?? s.name ?? "",
    away: s.displayValue ?? "",
    home:
      homeStats.find((h: any) => (h.name ?? h.label) === (s.name ?? s.label))
        ?.displayValue ?? "",
  }));
}

function mapPlayers(group: any) {
  const block = group?.statistics?.[0];
  if (!block) return null;
  const labels: string[] = block.names ?? [];
  return {
    team: group.team?.abbreviation ?? "",
    teamFull: group.team?.displayName ?? "",
    logo: group.team?.logo ?? "",
    labels,
    players: (block.athletes ?? []).map((a: any) => ({
      name: a.athlete?.displayName ?? "",
      shortName: a.athlete?.shortName ?? "",
      position: a.athlete?.position?.abbreviation ?? "",
      headshot: a.athlete?.headshot?.href ?? "",
      starter: !!a.starter,
      didNotPlay: !!a.didNotPlay,
      stats: a.stats ?? [],
    })),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Match ID is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${ESPN_SUMMARY}?event=${encodeURIComponent(id)}`, {
      cache: "no-store",
      headers: { "User-Agent": UA, Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`ESPN summary returned ${res.status}`);
    const data = await res.json();

    const comp = data.header?.competitions?.[0];
    const competitors = comp?.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0];
    const awayTeam = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1];

    const linescoreLabels = (awayTeam?.linescores ?? []).map(
      (_: any, i: number) => (i < 4 ? `Q${i + 1}` : `OT${i - 3}`),
    );

    // Scoring plays first, then the tail of the feed — that's what a phone-sized
    // timeline actually wants.
    const allPlays: any[] = data.plays ?? [];
    const plays = allPlays
      .slice(-60)
      .reverse()
      .map((p: any) => ({
        clock: p.clock?.displayValue ?? "",
        period: p.period?.number ?? 0,
        text: p.text ?? "",
        scoringPlay: !!p.scoringPlay,
        homeScore: p.homeScore ?? 0,
        awayScore: p.awayScore ?? 0,
        team: p.team?.id ?? "",
      }));

    const standings = (data.standings?.groups ?? []).map((g: any) => ({
      name: g.header ?? "Standings",
      entries: (g.standings?.entries ?? []).map((e: any) => {
        const stat = (n: string) =>
          e.stats?.find((s: any) => s.name === n)?.displayValue ?? "";
        return {
          team: e.team ?? "",
          wins: stat("wins"),
          losses: stat("losses"),
          winPercent: stat("winPercent"),
          gamesBehind: stat("gamesBehind"),
          streak: stat("streak"),
        };
      }),
    }));

    const leaders = (data.leaders ?? []).map((teamBlock: any) => ({
      team: teamBlock.team?.abbreviation ?? "",
      categories: (teamBlock.leaders ?? []).map((cat: any) => ({
        label: cat.displayName ?? cat.name ?? "",
        leaders: (cat.leaders ?? []).map((l: any) => ({
          name: l.athlete?.displayName ?? "",
          headshot: l.athlete?.headshot?.href ?? "",
          value: l.displayValue ?? "",
        })),
      })),
    }));

    return NextResponse.json(
      {
        status: "success",
        id,
        title: comp?.competitors
          ? `${awayTeam?.team?.displayName} at ${home?.team?.displayName}`
          : "",
        league: data.header?.league?.name ?? "NBA",
        statusText:
          comp?.status?.type?.detail ?? comp?.status?.type?.shortDetail ?? "",
        state: comp?.status?.type?.state ?? "pre",
        startDate: comp?.date ?? "",
        venue: data.gameInfo?.venue?.fullName ?? "",
        venueCity: data.gameInfo?.venue?.address?.city ?? "",
        attendance: data.gameInfo?.attendance ?? null,
        officials: (data.gameInfo?.officials ?? []).map((o: any) => o.displayName),
        broadcasts: (data.header?.competitions?.[0]?.broadcasts ?? []).flatMap(
          (b: any) => b.names ?? b.media?.shortName ?? [],
        ),
        teams: {
          away: {
            abbreviation: awayTeam?.team?.abbreviation ?? "",
            name: awayTeam?.team?.displayName ?? "",
            logo: awayTeam?.team?.logos?.[0]?.href ?? awayTeam?.team?.logo ?? "",
            score: awayTeam?.score ?? "",
            record: awayTeam?.record?.[0]?.displayValue ?? "",
            linescores: (awayTeam?.linescores ?? []).map(
              (l: any) => l.displayValue ?? String(l.value ?? ""),
            ),
          },
          home: {
            abbreviation: home?.team?.abbreviation ?? "",
            name: home?.team?.displayName ?? "",
            logo: home?.team?.logos?.[0]?.href ?? home?.team?.logo ?? "",
            score: home?.score ?? "",
            record: home?.record?.[0]?.displayValue ?? "",
            linescores: (home?.linescores ?? []).map(
              (l: any) => l.displayValue ?? String(l.value ?? ""),
            ),
          },
        },
        linescoreLabels,
        teamStats: pairTeamStats(data.boxscore?.teams ?? []),
        boxscore: (data.boxscore?.players ?? [])
          .map(mapPlayers)
          .filter((x: any) => x !== null),
        leaders,
        plays,
        standings,
        injuries: (data.injuries ?? []).map((t: any) => ({
          team: t.team?.abbreviation ?? "",
          players: (t.injuries ?? []).map((i: any) => ({
            name: i.athlete?.displayName ?? "",
            status: i.status ?? "",
            detail: i.details?.type ?? i.shortComment ?? "",
          })),
        })),
      },
      { headers: { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" } },
    );
  } catch (error) {
    console.error("NBA detail error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Failed to load game details",
      },
      { status: 502 },
    );
  }
}
