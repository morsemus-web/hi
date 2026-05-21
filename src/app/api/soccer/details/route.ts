import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path || !path.startsWith("/sport/football")) {
      return NextResponse.json(
        { status: "error", error: "Missing or invalid path parameter" },
        { status: 400 }
      );
    }

    const url = `https://www.bbc.com${path}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", error: `Upstream BBC Live page returned ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let jsonData: any = null;

    $("script").each((_, script) => {
      const content = $(script).html() || "";
      if (content.includes("window.__INITIAL_DATA__")) {
        const match = content.match(/window\.__INITIAL_DATA__\s*=\s*["'](.*?)["']\s*;/);
        if (match) {
          const rawStr = match[1];
          try {
            // Decodes double-escaped double-quotes and unicode literals
            const unescapedStr = JSON.parse(`"${rawStr}"`);
            jsonData = JSON.parse(unescapedStr);
          } catch (e1) {
            try {
              // Fallback simple string replacement unescaping
              const unescapedStr = rawStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              jsonData = JSON.parse(unescapedStr);
            } catch (e2) {
              console.error("JSON parsing fallback failed:", e2);
            }
          }
        }
      }
    });

    if (!jsonData || !jsonData.data) {
      return NextResponse.json(
        { status: "error", error: "Could not parse hydration data from BBC match page" },
        { status: 502 }
      );
    }

    const data = jsonData.data;

    // 1. Events timeline (Goals / Cards / Bookings)
    const eventsKey = Object.keys(data).find(k => k.includes("football-on-the-day-events"));
    const eventsData = eventsKey ? data[eventsKey]?.data?.events?.[0] : null;

    const extractActions = (teamData: any) => {
      const actions: any[] = [];
      const teamActions = teamData?.actions || [];
      for (const ta of teamActions) {
        const playerName = ta.playerName || "";
        const subActions = ta.actions || [];
        for (const sa of subActions) {
          actions.push({
            player: playerName,
            type: sa.type || "", // "Goal", "Yellow Card", "Red Card"
            time: sa.timeLabel?.value || sa.time?.label || "",
          });
        }
      }
      return actions.sort((a, b) => {
        const getMin = (t: string) => parseInt(t.replace(/\+/g, "").replace(/'/g, "")) || 0;
        return getMin(a.time) - getMin(b.time);
      });
    };

    const homeEvents = eventsData ? extractActions(eventsData.home) : [];
    const awayEvents = eventsData ? extractActions(eventsData.away) : [];

    // 2. Formations & Lineups
    const lineupsKey = Object.keys(data).find(k => k.includes("match-lineups"));
    const lineupsData = lineupsKey ? data[lineupsKey]?.data : null;

    const extractLineupActions = (teamData: any) => {
      const actions: any[] = [];
      if (!teamData || !teamData.players) return actions;
      
      const allPlayers = [
        ...(teamData.players.starters || []),
        ...(teamData.players.substitutes || [])
      ];
      
      for (const p of allPlayers) {
        const playerName = p.displayName || p.name?.short || p.name?.shirt || "";
        
        // Cards (Yellow / Red cards)
        if (p.cards && Array.isArray(p.cards)) {
          for (const card of p.cards) {
            actions.push({
              player: playerName,
              type: card.type || "Yellow Card",
              time: card.timeLabel?.value || "",
            });
          }
        }
        
        // Substitutions
        if (p.substitutes && Array.isArray(p.substitutes)) {
          for (const sub of p.substitutes) {
            actions.push({
              player: `${playerName} ↔ ${sub.playerSubbedInName || ""}`,
              type: "Substitution",
              time: sub.timeLabel?.value || "",
            });
          }
        }
      }
      return actions;
    };

    const homeLineupActions = lineupsData ? extractLineupActions(lineupsData.homeTeam) : [];
    const awayLineupActions = lineupsData ? extractLineupActions(lineupsData.awayTeam) : [];

    const homeEventsCombined = [...homeEvents, ...homeLineupActions];
    const awayEventsCombined = [...awayEvents, ...awayLineupActions];

    const formatTeamLineup = (team: any) => {
      if (!team) return null;
      const pitchLayout = team.pitchLayout || [];
      
      const players = pitchLayout.map((row: any[]) => {
        return (row || []).map((p: any) => ({
          name: p.name || "",
          shirt_number: p.shirtNumber || "",
          position: p.position || "",
          accessible_text: p.accessibleText || "",
        }));
      });

      const substitutes = (team.substitutes || []).map((p: any) => ({
        name: p.name || "",
        shirt_number: p.shirtNumber || "",
        position: p.position || "",
        accessible_text: p.accessibleText || "",
      }));

      return {
        formation: team.formation?.value || team.formation?.accessible || "N/A",
        pitch: players,
        substitutes,
      };
    };

    const homeLineup = formatTeamLineup(lineupsData?.homeTeam);
    const awayLineup = formatTeamLineup(lineupsData?.awayTeam);

    // 3. Performance Statistics
    const statsKey = Object.keys(data).find(k => k.includes("match-stats"));
    const statsData = statsKey ? data[statsKey]?.data : null;

    const formatStats = (statsObj: any) => {
      if (!statsObj) return {};
      const formatted: Record<string, number> = {};
      for (const [key, value] of Object.entries(statsObj)) {
        if (value && typeof value === "object" && "total" in value) {
          formatted[key] = (value as any).total;
        }
      }
      return formatted;
    };

    const homeStats = formatStats(statsData?.homeTeam?.stats);
    const awayStats = formatStats(statsData?.awayTeam?.stats);

    // 4. Head-to-Head and Form Guide
    const previewKey = Object.keys(data).find(k => k.includes("football-match-preview"));
    const previewData = previewKey ? data[previewKey]?.data : null;

    const meetings: any[] = [];
    const prevScores = previewData?.previousScores || [];
    for (const block of prevScores) {
      const blockMatches = block.matches || [];
      for (const m of blockMatches) {
        meetings.push({
          date: m.date || "",
          tournament: m.tournament?.name || "",
          home_team: m.participants?.home?.fullName || m.participants?.home?.shortName || "",
          away_team: m.participants?.away?.fullName || m.participants?.away?.shortName || "",
          home_score: m.participants?.home?.score || "0",
          away_score: m.participants?.away?.score || "0",
          summary: m.accessibleEventSummary || "",
        });
      }
    }

    const h2h = {
      summary: {
        total: previewData?.previousMeetings?.totalPlayed || 0,
        home_wins: previewData?.previousMeetings?.homeParticipantWins || 0,
        away_wins: previewData?.previousMeetings?.awayParticipantWins || 0,
        draws: previewData?.previousMeetings?.draws || 0,
        first_played: previewData?.previousMeetings?.firstEventDate || "",
      },
      last_five: meetings.slice(0, 5),
    };

    const homeRankInfo = previewData?.homeTeam?.seasonSoFar || {};
    const awayRankInfo = previewData?.awayTeam?.seasonSoFar || {};

    const homeForm = (previewData?.homeTeam?.formGuide || []).map((f: any) => ({
      result: f.winner === "draw" ? "D" : f.winner === "home" ? "W" : "L",
    }));
    const awayForm = (previewData?.awayTeam?.formGuide || []).map((f: any) => ({
      result: f.winner === "draw" ? "D" : f.winner === "away" ? "W" : "L",
    }));

    // 5. Standings Table Scraping (Dynamic by tournament slug)
    const tournamentUrn = previewData?.tournament?.urn || statsData?.tournament?.urn || "";
    let standings: any[] = [];
    let tournamentSlug = "";

    if (tournamentUrn) {
      const parts = tournamentUrn.split(":");
      tournamentSlug = parts[parts.length - 1];
    }

    if (tournamentSlug) {
      // Normalize common BBC tournament slugs
      let slug = tournamentSlug;
      if (slug === "english-premier-league") slug = "premier-league";
      if (slug === "spanish-la-liga") slug = "la-liga";
      if (slug === "italian-serie-a") slug = "serie-a";
      if (slug === "german-bundesliga") slug = "bundesliga";
      if (slug === "french-ligue-1") slug = "ligue-1";
      if (slug === "scottish-premiership") slug = "scottish-premiership";

      try {
        const tableUrl = `https://www.bbc.com/sport/football/${slug}/table`;
        const tableRes = await fetch(tableUrl, {
          cache: "no-store",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (tableRes.ok) {
          const tableHtml = await tableRes.text();
          const $t = cheerio.load(tableHtml);
          let tableJson: any = null;

          $t("script").each((_, script) => {
            const content = $t(script).html() || "";
            if (content.includes("window.__INITIAL_DATA__")) {
              const match = content.match(/window\.__INITIAL_DATA__\s*=\s*["'](.*?)["']\s*;/);
              if (match) {
                try {
                  const unescapedStr = JSON.parse(`"${match[1]}"`);
                  tableJson = JSON.parse(unescapedStr);
                } catch {}
              }
            }
          });

          if (tableJson && tableJson.data) {
            const footballTableKey = Object.keys(tableJson.data).find(k => k.includes("football-table"));
            const footballTableData = footballTableKey ? tableJson.data[footballTableKey]?.data : null;
            const tournaments = footballTableData?.tournaments || [];
            
            if (tournaments.length > 0) {
              const stages = tournaments[0]?.stages || [];
              standings = stages.map((stage: any) => {
                const round = stage.rounds?.[0];
                const participants = round?.participants || [];
                return {
                  stage_name: stage.name || "Standings",
                  teams: participants.map((p: any) => ({
                    rank: p.rank || 0,
                    name: p.name || "",
                    short_name: p.shortName || "",
                    points: p.points || 0,
                    played: p.matchesPlayed || 0,
                    wins: p.wins || 0,
                    losses: p.losses || 0,
                    draws: p.draws || 0,
                    goals_for: p.goalsScoredFor || 0,
                    goals_against: p.goalsScoredAgainst || 0,
                    goal_diff: p.goalDifference || 0,
                    rank_status: p.rankStatus || "",
                    form: (p.formGuide || []).map((f: any) => f.value),
                  })),
                };
              });
            }
          }
        }
      } catch (tableErr) {
        console.error("Failed to parse standings table for slug:", tournamentSlug, tableErr);
      }
    }

    return NextResponse.json({
      status: "success",
      events: {
        home: homeEventsCombined,
        away: awayEventsCombined,
      },
      lineups: {
        home: homeLineup,
        away: awayLineup,
      },
      stats: {
        home: homeStats,
        away: awayStats,
      },
      h2h,
      ranks: {
        home: homeRankInfo,
        away: awayRankInfo,
      },
      forms: {
        home: homeForm,
        away: awayForm,
      },
      standings,
      tournament_name: previewData?.tournament?.name || statsData?.tournament?.name || "Football",
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=5, stale-while-revalidate=15",
      }
    });

  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Failed to fetch match details",
      },
      { status: 502 }
    );
  }
}
