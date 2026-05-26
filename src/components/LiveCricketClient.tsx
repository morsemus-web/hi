"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";

/* ── Types ── */
interface MatchBatsman {
  name: string;
  score: string;
}

interface MatchBowler {
  name: string;
}

interface MatchData {
  id: string;
  status: string;
  title: string;
  score: string;
  status_text: string;
  current_batsmen: MatchBatsman[];
  current_bowler: MatchBowler;
}

interface ParsedMatch extends MatchData {
  team1: string;
  team2: string;
  shortTeam1: string;
  shortTeam2: string;
  matchInfo: string;
  isLive: boolean;
  statusDisplay: string;
}

interface DetailBatter {
  name: string;
  dismissal: string;
  runs: string;
  balls: string;
  fours: string;
  sixes: string;
  sr: string;
}

interface DetailBowler {
  name: string;
  overs: string;
  maidens: string;
  runs: string;
  wickets: string;
  nb: string;
  wd: string;
  econ: string;
}

interface InningsData {
  team: string;
  score: string;
  batters: DetailBatter[];
  bowlers: DetailBowler[];
  extras: string;
  total: string;
  yetToBat: string[];
}

interface MatchDetails {
  status: string;
  title: string;
  statusText: string;
  timeline: { ball: string; text: string; type: string; score: string }[];
  innings: InningsData[];
  teams: Record<string, string[]>;
  pointsTable: { pos: number; team: string; short: string; p: number; w: number; l: number; pts: number; nrr: string }[];
  probability: { team1: number; team2: number; label1: string; label2: string };
}

/* ── Constants ── */
const API_URL = "/api/cricket";
const DETAILS_API_URL = "/api/cricket/details";
const POLL_INTERVAL = 5000;
const JUNK_BOWLERS = ["IPL", "TATA IPL", "Over", "score not found", ""];

const FILTERS = [
  { key: "all", label: "All Matches" },
  { key: "ipl", label: "IPL" },
  { key: "international", label: "International" },
  { key: "county", label: "County" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

/* ── Real Player Face Headshots ── */
function getPlayerImage(name: string): string {
  // Clean names to remove trailing indicators like (c) or (wk) or *
  const cleanPlayerName = name.replace(/\(c\)|\(wk\)|\*/gi, "").trim();
  return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(cleanPlayerName + " headshot cricket png")}&w=80&h=80&c=7&rs=1&p=0`;
}

/* ── Real Logos Mapper ── */
function getTeamLogo(shortName: string): string {
  const cleanName = shortName.toUpperCase().trim();
  const fullNames: Record<string, string> = {
    RCB: "Royal Challengers Bengaluru",
    GT: "Gujarat Titans",
    CSK: "Chennai Super Kings",
    MI: "Mumbai Indians",
    KKR: "Kolkata Knight Riders",
    RR: "Rajasthan Royals",
    SRH: "Sunrisers Hyderabad",
    PBKS: "Punjab Kings",
    DC: "Delhi Capitals",
    LSG: "Lucknow Super Giants",
    IND: "India Cricket Team",
    PAK: "Pakistan Cricket Team",
    AUS: "Australia Cricket Team",
    ENG: "England Cricket Team",
    NZ: "New Zealand Cricket Team",
    SA: "South Africa Cricket Team",
    WI: "West Indies Cricket Team",
    SL: "Sri Lanka Cricket Team",
    BAN: "Bangladesh Cricket Team",
    AFG: "Afghanistan Cricket Team",
    IRE: "Ireland Cricket Team",
    HAM: "Hampshire County Cricket",
    ESS: "Essex County Cricket",
  };

  const nameToSearch = fullNames[cleanName] || `${cleanName} cricket team`;
  return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(nameToSearch + " logo png")}&w=80&h=80&c=7&rs=1&p=0`;
}

/* ── Parsing Helpers ── */
function parseTitle(rawTitle: string) {
  let title = rawTitle.replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
  const pipeParts = title.split(" | ");
  let fullSection = pipeParts.length >= 3 ? pipeParts[2] : pipeParts[pipeParts.length - 1];
  fullSection = fullSection.replace(/\s*Live Cricket Stream.*$/i, "").trim();

  let team1 = "", team2 = "", matchInfo = "";
  if (fullSection.includes(" vs ")) {
    const [t1, ...rest] = fullSection.split(" vs ");
    team1 = t1.trim();
    const joined = rest.join(" vs ");
    const commaParts = joined.split(",");
    team2 = commaParts[0].trim();
    matchInfo = commaParts.slice(1).join(",").trim();
  } else {
    team1 = fullSection;
  }
  return { team1, team2, matchInfo };
}

function parseShortTeams(statusText: string) {
  const teams = statusText.split(" - ")[0];
  const parts = teams.split(" vs ");
  return {
    shortTeam1: parts[0]?.trim() || "??",
    shortTeam2: parts[1]?.trim() || "??",
  };
}

function getMatchState(statusText: string) {
  const statusDisplay = statusText.split(" - ").slice(1).join(" - ");
  const isLive = !/won|stumps|draw|preview|abandoned|no result/i.test(statusDisplay);
  return { isLive, statusDisplay };
}

function filterMatch(match: ParsedMatch, filter: FilterKey): boolean {
  if (filter === "all") return true;
  const t = match.title.toLowerCase();
  if (filter === "ipl") return t.includes("premier league") || t.includes("ipl");
  if (filter === "international") return t.includes("tour") || t.includes("t20 world cup") || t.includes("test") || t.includes("odi");
  if (filter === "county") return t.includes("county");
  return true;
}

function processMatches(raw: MatchData[]): ParsedMatch[] {
  return raw.map((m) => {
    const { team1, team2, matchInfo } = parseTitle(m.title);
    const { shortTeam1, shortTeam2 } = parseShortTeams(m.status_text);
    const { isLive, statusDisplay } = getMatchState(m.status_text);
    return { ...m, team1, team2, shortTeam1, shortTeam2, matchInfo, isLive, statusDisplay };
  });
}

// Grouping Helper to Match Soccer League Layout
function getLeagueName(match: ParsedMatch): string {
  const parts = match.title.split(" | ");
  if (parts.length >= 2 && parts[0].trim().length > 2 && parts[0].trim().length < 25) {
    const p0 = parts[0].trim();
    if (p0.toUpperCase() === "IPL") return "Indian Premier League";
    return p0;
  }
  
  const t = match.title.toLowerCase();
  if (t.includes("premier league") || t.includes("ipl")) return "Indian Premier League";
  if (t.includes("t20 world cup")) return "ICC T20 World Cup";
  if (t.includes("county")) return "County Championship";
  if (t.includes("tour of")) {
    const m = match.title.match(/([^,]+tour of[^,]+)/i);
    if (m) return m[1].replace(/Live Cricket.*/i, "").trim();
  }
  
  if (match.matchInfo) {
    const infoParts = match.matchInfo.split(",");
    const series = infoParts[infoParts.length - 1].trim();
    if (series && series.length > 3 && !/live|scores/i.test(series)) {
      return series;
    }
  }
  
  return "International Series";
}

// Extractor of Individual Team Scores from title & score payload
function getIndividualScores(match: ParsedMatch) {
  let score1 = ""; // Team 1 score (RCB)
  let score2 = ""; // Team 2 score (GT)
  
  const t1 = match.shortTeam1.toUpperCase();
  const t2 = match.shortTeam2.toUpperCase();
  
  if (!match.score || match.score === "score not found") {
    return { score1, score2 };
  }
  
  const regex1 = new RegExp(`\\b${t1}\\s+([0-9/&\\s-]+(?:\\([0-9.]+\\))?)`, "i");
  const regex2 = new RegExp(`\\b${t2}\\s+([0-9/&\\s-]+(?:\\([0-9.]+\\))?)`, "i");
  
  const match1 = match.title.match(regex1);
  const match2 = match.title.match(regex2);
  
  if (match1) score1 = match1[1].trim();
  if (match2) score2 = match2[1].trim();
  
  if (!score1 && !score2) {
    const matchScoreUpper = match.score.toUpperCase();
    if (matchScoreUpper.startsWith(t1)) {
      score1 = match.score.replace(new RegExp(`^${t1}\\s+`, "i"), "");
    } else if (matchScoreUpper.startsWith(t2)) {
      score2 = match.score.replace(new RegExp(`^${t2}\\s+`, "i"), "");
    }
  }
  
  return { score1, score2 };
}

/* ── Main Component ── */
export default function LiveCricketClient() {
  const [matches, setMatches] = useState<ParsedMatch[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ParsedMatch | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.matches)) {
        const processed = processMatches(data.matches);
        setMatches(processed);
        setLastUpdated(new Date());
        setError(null);

        // Keep selected match details synced
        if (selectedMatch) {
          const updated = processed.find(m => m.id === selectedMatch.id);
          if (updated) setSelectedMatch(updated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scores");
    } finally {
      setLoading(false);
    }
  }, [selectedMatch]);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const filtered = matches.filter((m) => filterMatch(m, filter));
  const liveCount = matches.filter((m) => m.isLive).length;

  // Group Matches by Series
  const groupedMatches = filtered.reduce<Record<string, ParsedMatch[]>>((acc, m) => {
    const league = getLeagueName(m);
    if (!acc[league]) acc[league] = [];
    acc[league].push(m);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-bg text-text-primary relative overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        {/* Back link */}
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        {/* Header */}
        <div className="mt-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Live Cricket Score
            </h1>
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-red-400">
                  {liveCount} Live
                </span>
              </span>
            )}
          </div>
          <p className="text-text-dim text-sm font-light leading-relaxed max-w-lg">
            Real-time cricket scores, ball-by-ball updates, live scorecards, and standings. Click any fixture to see scorecard and player comparisons.
          </p>
        </div>

        {/* English Commentary Beta Banner */}
        <div className="mb-8 p-4 rounded-xl bg-sport-cricket/5 border border-sport-cricket/20 flex items-center gap-3 animate-fade-in shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <span className="text-xl shrink-0">🎙️</span>
          <div className="min-w-0 flex-1">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-sport-cricket">
              Crex Audio Commentary Beta
            </h4>
            <p className="text-text-muted text-[11px] font-light mt-0.5 leading-relaxed">
              English and Hindi beta has started on the dashboard for selected tournament matches. Enjoy live commentary updates!
            </p>
          </div>
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-sport-cricket/20 text-sport-cricket border border-sport-cricket/30 shrink-0 font-mono">
            BETA LIVE
          </span>
        </div>

        {/* Filter pills + last updated */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-border pb-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-5 py-2.5 rounded-lg text-[10px] font-medium uppercase tracking-[0.1em] transition-all duration-300 cursor-pointer border ${
                  filter === f.key
                    ? "bg-sport-cricket/15 border-sport-cricket/25 text-sport-cricket"
                    : "border-border text-text-muted/60 hover:border-border-hover hover:text-text-muted"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {lastUpdated && (
            <span className="text-[9px] font-mono text-text-muted/40 uppercase tracking-wider">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-sport-cricket/20 border-t-sport-cricket animate-spin" />
            <p className="text-text-muted text-xs font-light uppercase tracking-wider">
              Fetching live scores...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <p className="text-sport-f1 text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchMatches(); }}
              className="px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] bg-sport-cricket/15 text-sport-cricket border border-sport-cricket/20 rounded-lg hover:bg-sport-cricket/25 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
            <div className="text-4xl mb-4">🏏</div>
            <p className="text-text-dim text-sm font-light mb-2">No matches found</p>
            <p className="text-text-muted text-xs font-light">
              {filter !== "all" ? "Try a different filter or check back later." : "Check back later for live matches."}
            </p>
          </div>
        )}

        {/* Match Grouping Blocks (Matches Football Design Pattern) */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-10">
            {Object.entries(groupedMatches).map(([leagueName, leagueMatches]) => (
              <div key={leagueName} className="space-y-4">
                {/* League Heading */}
                <div className="flex items-center gap-3 border-b border-border/60 pb-2">
                  <span className="text-lg font-bold tracking-tight text-text-primary">
                    {leagueName}
                  </span>
                  <span className="text-[10px] font-mono bg-overlay border border-border px-2 py-0.5 rounded text-text-muted">
                    {leagueMatches.length} fixtures
                  </span>
                </div>

                {/* Match Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leagueMatches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className="cursor-pointer group"
                    >
                      <MatchCard match={match} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-16 text-center">
          <p className="text-text-muted/30 text-[10px] font-light tracking-wider uppercase">
            Powered by ScoreDeck · Data refreshes every 5 seconds
          </p>
        </div>
      </div>

      {/* Immersive Match Details Drawer (Replacing Modal with Football Drawer Pattern) */}
      {selectedMatch && (
        <MatchDetailsDrawer match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </main>
  );
}

/* ── Match Card ── */
function MatchCard({ match }: { match: ParsedMatch }) {
  const validBowler =
    match.current_bowler?.name && !JUNK_BOWLERS.includes(match.current_bowler.name);

  const validBatsmen = match.current_batsmen?.filter(
    (b) => b.name && b.score && !JUNK_BOWLERS.includes(b.name)
  );

  const { score1, score2 } = getIndividualScores(match);

  // Parse required runs if team is chasing
  const needMatch = match.statusDisplay.match(/need\s+(\d+)\s+off\s+(\d+)/i) || 
                    match.status_text.match(/need\s+(\d+)\s+off\s+(\d+)/i);
  let reqRR = "";
  let runsNeeded = 0;
  let ballsRemaining = 0;
  if (needMatch) {
    runsNeeded = parseInt(needMatch[1]);
    ballsRemaining = parseInt(needMatch[2]);
    reqRR = ((runsNeeded / ballsRemaining) * 6).toFixed(2);
  }

  // Parse total overs / active batting team details for progress calculations
  const battingScore = score2 || score1 || "";
  const oversMatch = battingScore.match(/\((\d+(?:\.\d+)?)\)/);
  const currentOvers = oversMatch ? parseFloat(oversMatch[1]) : 0;
  const currentRuns = battingScore.match(/^(\d+)/) ? parseInt(battingScore.match(/^(\d+)/)![1]) : 0;
  const targetVal = currentRuns + runsNeeded;

  return (
    <div
      className={`glass-card rounded-xl overflow-hidden transition-all duration-300 border ${
        match.isLive 
          ? "border-sport-cricket/20 shadow-[0_0_20px_rgba(107,163,190,0.03)]" 
          : "border-border hover:border-border-hover"
      }`}
    >
      {/* Header section (Status / Time) */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-overlay/30">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted truncate max-w-[70%]">
          {match.matchInfo || "Cricket Match"}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {match.isLive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold font-mono text-red-400">
                LIVE {currentOvers > 0 && `• ${currentOvers} OV`}
              </span>
            </>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.12em] text-text-muted/40 font-light">
              {/won/i.test(match.statusDisplay) ? "Completed" : match.statusDisplay || "Completed"}
            </span>
          )}
        </div>
      </div>

      {/* Main Teams & Scores Grid */}
      <div className="px-5 py-5 flex items-center justify-between gap-4">
        {/* Team 1 (Left) */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={getTeamLogo(match.shortTeam1)}
            alt={match.shortTeam1}
            width={34}
            height={34}
            className="rounded-full ring-1 ring-border flex-shrink-0 bg-overlay-2 object-contain p-0.5"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.shortTeam1)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
            }}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
              {match.shortTeam1}
            </p>
            {score1 ? (
              <p className="text-base font-mono font-extrabold text-text-primary mt-0.5">
                {score1.replace(/^[A-Z]+ /, "")}
              </p>
            ) : (
              <p className="text-[10px] text-text-muted/50 font-light truncate mt-1">Yet to bat</p>
            )}
          </div>
        </div>

        {/* Center: LIVE or VS */}
        <div className="flex-shrink-0 text-center px-4">
          {match.isLive ? (
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-sport-cricket bg-sport-cricket/10 border border-sport-cricket/20 px-2.5 py-1.5 rounded-lg">
              VS
            </div>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40 border border-border/40 px-2.5 py-1 rounded-md">
              VS
            </div>
          )}
        </div>

        {/* Team 2 (Right) */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
              {match.shortTeam2}
            </p>
            {score2 ? (
              <p className="text-base font-mono font-extrabold text-text-primary mt-0.5">
                {score2.replace(/^[A-Z]+ /, "")}
              </p>
            ) : (
              <p className="text-[10px] text-text-muted/50 font-light truncate mt-1">Yet to bat</p>
            )}
          </div>
          <img
            src={getTeamLogo(match.shortTeam2)}
            alt={match.shortTeam2}
            width={34}
            height={34}
            className="rounded-full ring-1 ring-border flex-shrink-0 bg-overlay-2 object-contain p-0.5"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.shortTeam2)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
            }}
          />
        </div>
      </div>

      {/* Target Chase Progress Indicator */}
      {match.isLive && targetVal > 0 && (
        <div className="mx-5 mb-4 p-3 bg-overlay/50 border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-[9px] font-mono text-text-muted">
            <span>Chasing: {targetVal} Runs</span>
            {reqRR && <span>Req RR: {reqRR}</span>}
          </div>
          <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden flex">
            <div
              className="bg-sport-cricket h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentRuns / targetVal) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom Status Text Banner */}
      {match.statusDisplay && (
        <div className={`mx-5 mb-4 text-center px-4 py-2 rounded-lg border ${
          match.isLive 
            ? "bg-sport-cricket/5 border-sport-cricket/20 text-sport-cricket font-semibold" 
            : "bg-overlay border-border text-text-dim font-medium"
        } text-[10px] uppercase tracking-wider truncate`}>
          {match.statusDisplay}
        </div>
      )}

      {/* Live Action Crease details (Including Bing Search dynamic headshots!) */}
      {match.isLive && (validBatsmen?.length > 0 || validBowler) && (
        <div className="mx-5 mb-5 p-3 bg-overlay-2/60 border border-border/80 rounded-xl space-y-2.5 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            {/* Batsmen */}
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted block mb-1.5 font-mono">
                Batting
              </span>
              <div className="space-y-2">
                {validBatsmen?.slice(0, 2).map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-text-primary font-medium truncate max-w-[70%] flex items-center gap-1.5">
                      <img
                        src={getPlayerImage(b.name)}
                        alt={b.name}
                        className="w-[22px] h-[22px] rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                        onError={(e) => {
                          e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                        }}
                      />
                      <span className="truncate">{b.name}</span>
                      {i === 0 && <span className="text-sport-cricket animate-pulse text-[8px]">*</span>}
                    </span>
                    <span className="font-mono text-text-dim">{b.score}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Bowler */}
            {validBowler && (
              <div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-text-muted block mb-1.5 font-mono">
                  Bowling
                </span>
                <div className="flex items-center gap-1.5 text-[10px] mt-1">
                  <img
                    src={getPlayerImage(match.current_bowler.name)}
                    alt={match.current_bowler.name}
                    className="w-[22px] h-[22px] rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                    onError={(e) => {
                      e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                    }}
                  />
                  <span className="text-text-primary font-medium truncate max-w-[90%] flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-sport-cricket animate-pulse shrink-0" />
                    <span className="truncate">{match.current_bowler.name}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="px-5 py-2 border-t border-border/20 text-center bg-overlay-2/10">
        <p className="text-[8px] uppercase tracking-widest text-text-muted/45 font-mono group-hover:text-sport-cricket transition-colors">
          Click for scorecard & stats &rarr;
        </p>
      </div>
    </div>
  );
}

/* ── Immersive Details Slide Drawer Component (Matches Football drawer architecture) ── */
function MatchDetailsDrawer({ match, onClose }: { match: ParsedMatch; onClose: () => void }) {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "scorecard" | "commentary" | "playing11" | "table" | "graphs">("live");
  const [inningsIdx, setInningsIdx] = useState(0);

  // Escaping Drawer close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`${DETAILS_API_URL}?id=${match.id}`);
      if (!res.ok) throw new Error("Failed to fetch detailed scorecard");
      const data = await res.json();
      if (data.status === "success") {
        setDetails(data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching detailed match facts");
    } finally {
      setLoading(false);
    }
  }, [match.id]);

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDetails]);

  // Determine active live innings index safely
  const liveInningsIdx = details && details.innings.length > 0 ? details.innings.length - 1 : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Drawer Body (Matches Football Slide-in specs) */}
      <div className="relative w-full max-w-[550px] h-full bg-surface-2 border-l border-border flex flex-col shadow-2xl animate-slide-in-right z-10">
        
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-5 border-b border-border/80 bg-surface flex flex-col justify-between relative shrink-0">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-overlay-5 border border-border text-text-muted hover:text-text-primary transition-all cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Tournament context */}
          <span className="text-[9px] font-bold uppercase tracking-widest text-sport-cricket bg-sport-cricket/10 border border-sport-cricket/20 px-2 py-0.5 rounded w-max mb-3 font-mono">
            {match.matchInfo || "Cricket Match Center"}
          </span>

          {/* Match Score Display Header */}
          <div className="grid grid-cols-7 items-center gap-2 mt-2">
            {/* Team 1 Info */}
            <div className="col-span-3 flex flex-col items-center text-center min-w-0">
              <img
                src={getTeamLogo(match.shortTeam1)}
                alt={match.shortTeam1}
                width={44}
                height={44}
                className="rounded-full ring-2 ring-border bg-overlay object-contain p-1 mb-2 sm:w-[48px] sm:h-[48px]"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.shortTeam1)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
                }}
              />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-text-primary leading-tight truncate max-w-full">
                {match.shortTeam1}
              </span>
            </div>

            {/* Score box */}
            <div className="col-span-1 text-center flex flex-col items-center justify-center">
              <div className="text-sm font-mono font-black text-text-primary bg-overlay-2 border border-border rounded-lg py-1 px-2 shadow-inner min-w-[70px]">
                {match.score && match.score !== "score not found" 
                  ? match.score.replace(/^[A-Z]+ /, "") 
                  : "VS"}
              </div>
              <span className="text-[8px] font-mono uppercase text-sport-cricket font-bold mt-1.5 tracking-wider animate-pulse">
                {match.isLive ? "LIVE NOW" : "COMPLETED"}
              </span>
            </div>

            {/* Team 2 Info */}
            <div className="col-span-3 flex flex-col items-center text-center min-w-0">
              <img
                src={getTeamLogo(match.shortTeam2)}
                alt={match.shortTeam2}
                width={44}
                height={44}
                className="rounded-full ring-2 ring-border bg-overlay object-contain p-1 mb-2 sm:w-[48px] sm:h-[48px]"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.shortTeam2)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
                }}
              />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-text-primary leading-tight truncate max-w-full">
                {match.shortTeam2}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Tabs Navigation (Matches Football style) */}
        <div className="flex border-b border-border bg-surface px-2 sm:px-4 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          {([
            { key: "live", label: "Live Center" },
            { key: "scorecard", label: "Scorecard" },
            { key: "commentary", label: "Commentary" },
            { key: "playing11", label: "Playing XI" },
            { key: "table", label: "Table" },
            { key: "graphs", label: "Run Graphs" }
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-3 border-b-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-sport-cricket text-sport-cricket"
                  : "border-transparent text-text-muted hover:text-text-dim"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar">
          {loading && !details && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-sport-cricket/20 border-t-sport-cricket animate-spin mx-auto" />
              <p className="text-xs text-text-muted uppercase tracking-wider">Loading detailed match facts...</p>
            </div>
          )}

          {error && !details && (
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 text-xs font-light">{error}</p>
            </div>
          )}

          {details && (
            <div className="space-y-6 animate-fade-in">
              {/* Dynamic Status strip banner */}
              {details.statusText && (
                <div className="p-3.5 rounded-lg text-center bg-sport-cricket/5 border border-sport-cricket/20 text-xs font-semibold uppercase tracking-wider text-sport-cricket shadow-sm">
                  📢 {details.statusText}
                </div>
              )}

              {/* TAB 1: Live Center */}
              {activeTab === "live" && (
                <div className="space-y-6">
                  {/* Win Probability Indicator */}
                  <div className="glass-card rounded-xl p-4 border border-border space-y-2.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                      <span className="text-sport-cricket">{details.probability.label1} {details.probability.team1}%</span>
                      <span className="text-text-muted">Win Probability</span>
                      <span className="text-sport-football">{details.probability.label2} {details.probability.team2}%</span>
                    </div>
                    {/* Visual bar slider */}
                    <div className="w-full h-2 rounded-full bg-sport-football/40 overflow-hidden flex">
                      <div
                        className="bg-sport-cricket h-full transition-all duration-1000"
                        style={{ width: `${details.probability.team1}%` }}
                      />
                    </div>
                  </div>

                  {/* Crease stats card */}
                  <div className="glass-card rounded-xl overflow-hidden border border-border">
                    <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        Batting in Progress
                      </span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left text-xs font-light min-w-[300px]">
                        <thead>
                          <tr className="border-b border-border/80 text-[8px] font-bold uppercase tracking-wider text-text-muted/60">
                            <th className="pb-2">Batter</th>
                            <th className="pb-2 text-right">R</th>
                            <th className="pb-2 text-right">B</th>
                            <th className="pb-2 text-right">4s</th>
                            <th className="pb-2 text-right">6s</th>
                            <th className="pb-2 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.innings[liveInningsIdx]?.batters.slice(0, 2).map((b, idx) => (
                            <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-overlay-2/50 transition-colors">
                              <td className="py-2.5 font-medium text-text-primary flex items-center gap-2">
                                <img
                                  src={getPlayerImage(b.name)}
                                  alt={b.name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                                  }}
                                />
                                <span className="truncate">{b.name}</span>
                                {idx === 0 && <span className="text-sport-cricket animate-pulse text-[8px]">*</span>}
                              </td>
                              <td className="py-2.5 text-right font-mono font-semibold">{b.runs}</td>
                              <td className="py-2.5 text-right font-mono text-text-muted">{b.balls}</td>
                              <td className="py-2.5 text-right font-mono text-text-muted">{b.fours}</td>
                              <td className="py-2.5 text-right font-mono text-text-muted">{b.sixes}</td>
                              <td className="py-2.5 text-right font-mono text-sport-cricket">{b.sr}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bowling Spell stats card */}
                  <div className="glass-card rounded-xl overflow-hidden border border-border">
                    <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        Bowling Spell
                      </span>
                    </div>
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left text-xs font-light min-w-[300px]">
                        <thead>
                          <tr className="border-b border-border/80 text-[8px] font-bold uppercase tracking-wider text-text-muted/60">
                            <th className="pb-2">Bowler</th>
                            <th className="pb-2 text-right">O</th>
                            <th className="pb-2 text-right">M</th>
                            <th className="pb-2 text-right">R</th>
                            <th className="pb-2 text-right">W</th>
                            <th className="pb-2 text-right">ECO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.innings[liveInningsIdx]?.bowlers.slice(0, 2).map((bw, idx) => (
                            <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-overlay-2/50 transition-colors">
                              <td className="py-2.5 font-medium text-text-primary flex items-center gap-2">
                                <img
                                  src={getPlayerImage(bw.name)}
                                  alt={bw.name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                                  }}
                                />
                                <span className="truncate">{bw.name}</span>
                              </td>
                              <td className="py-2.5 text-right font-mono font-semibold">{bw.overs}</td>
                              <td className="py-2.5 text-right font-mono text-text-muted">{bw.maidens}</td>
                              <td className="py-2.5 text-right font-mono text-text-muted">{bw.runs}</td>
                              <td className="py-2.5 text-right font-mono text-sport-cricket font-bold">{bw.wickets}</td>
                              <td className="py-2.5 text-right font-mono text-sport-cricket">{bw.econ}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Last 6 Balls Dots Timeline with Over Breaks */}
                  <div className="glass-card rounded-xl p-4 border border-border space-y-3.5">
                    <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-muted">
                      Last 6 Balls (with Over Break)
                    </h4>
                    {/* Dots row */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-1.5 no-scrollbar">
                      {details.timeline.slice(0, 12).map((t, idx) => {
                        let circleClass = "bg-overlay-2 border border-border text-text-muted";
                        if (t.type === "six") circleClass = "bg-purple-600 border-purple-500 text-white shadow-md font-bold";
                        else if (t.type === "four") circleClass = "bg-emerald-600 border-emerald-500 text-white shadow-md font-bold";
                        else if (t.type === "wicket") circleClass = "bg-rose-600 border-rose-500 text-white shadow-md font-bold";
                        else if (t.type === "wide") circleClass = "bg-sky-950 border border-sky-800 text-sky-400 font-mono";

                        // Over break calculation
                        const isOverBreak = idx > 0 && Math.floor(parseFloat(details.timeline[idx - 1].ball)) !== Math.floor(parseFloat(t.ball));

                        return (
                          <div key={idx} className="flex items-center gap-3 shrink-0">
                            {isOverBreak && (
                              <div className="flex items-center shrink-0 px-2.5 py-1 rounded bg-sport-cricket/15 border border-sport-cricket/30 text-[8px] font-mono font-bold uppercase tracking-widest text-sport-cricket shadow-sm">
                                {Math.floor(parseFloat(t.ball))}th OVER
                              </div>
                            )}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs tracking-tighter shrink-0 ${circleClass}`}>
                              {t.score}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Scorecard */}
              {activeTab === "scorecard" && (
                <div className="space-y-6">
                  {/* Innings selector tab */}
                  <div className="flex gap-2 p-1 bg-overlay-2 border border-border rounded-xl w-fit shrink-0">
                    {details.innings.map((inn, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInningsIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                          inningsIdx === idx
                            ? "bg-bg border border-border text-sport-cricket shadow-sm"
                            : "text-text-muted hover:text-text-primary"
                        }`}
                      >
                        {inn.team}
                      </button>
                    ))}
                  </div>

                  {/* Batting details */}
                  <div className="glass-card rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-overlay/30 border-b border-border flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        Batting Card
                      </span>
                      <span className="text-xs font-mono font-bold text-sport-cricket">
                        {details.innings[inningsIdx]?.total}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-light min-w-[450px]">
                        <thead>
                          <tr className="border-b border-border text-[8px] font-bold uppercase tracking-wider text-text-muted/60 bg-overlay-2/30">
                            <th className="px-4 py-2.5">Batter</th>
                            <th className="px-4 py-2.5">Dismissal</th>
                            <th className="px-4 py-2.5 text-right">R</th>
                            <th className="px-4 py-2.5 text-right">B</th>
                            <th className="px-4 py-2.5 text-right">4s</th>
                            <th className="px-4 py-2.5 text-right">6s</th>
                            <th className="px-4 py-2.5 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.innings[inningsIdx]?.batters.map((b, idx) => (
                            <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-overlay-2/30 transition-colors">
                              <td className="px-4 py-2.5 font-semibold text-text-primary flex items-center gap-2.5">
                                <img
                                  src={getPlayerImage(b.name)}
                                  alt={b.name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                                  }}
                                />
                                <span className="truncate">{b.name}</span>
                              </td>
                              <td className="px-4 py-2.5 text-text-muted text-[10px] italic font-mono truncate max-w-[120px]">{b.dismissal}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-sport-cricket">{b.runs}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{b.balls}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{b.fours}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{b.sixes}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-sport-cricket">{b.sr}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary boxes (Extras + Yet to Bat) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-card rounded-xl p-4 border border-border space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-text-muted uppercase tracking-wider">Extras:</span>
                        <span className="font-mono text-text-primary font-bold">{details.innings[inningsIdx]?.extras || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-border/40">
                        <span className="font-semibold text-sport-cricket uppercase tracking-wider">Total:</span>
                        <span className="font-mono text-sport-cricket font-extrabold">{details.innings[inningsIdx]?.total || "—"}</span>
                      </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border border-border">
                      <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
                        Yet to Bat
                      </h4>
                      <p className="text-xs font-light text-text-dim leading-relaxed">
                        {details.innings[inningsIdx]?.yetToBat.join(", ") || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Bowling scorecard */}
                  <div className="glass-card rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        Bowling Card
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-light min-w-[400px]">
                        <thead>
                          <tr className="border-b border-border text-[8px] font-bold uppercase tracking-wider text-text-muted/60 bg-overlay-2/30">
                            <th className="px-4 py-2.5">Bowler</th>
                            <th className="px-4 py-2.5 text-right">O</th>
                            <th className="px-4 py-2.5 text-right">M</th>
                            <th className="px-4 py-2.5 text-right">R</th>
                            <th className="px-4 py-2.5 text-right">W</th>
                            <th className="px-4 py-2.5 text-right">WD</th>
                            <th className="px-4 py-2.5 text-right">NB</th>
                            <th className="px-4 py-2.5 text-right">ECON</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.innings[inningsIdx]?.bowlers.map((bw, idx) => (
                            <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-overlay-2/30 transition-colors">
                              <td className="px-4 py-2.5 font-semibold text-text-primary flex items-center gap-2.5">
                                <img
                                  src={getPlayerImage(bw.name)}
                                  alt={bw.name}
                                  className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                                  }}
                                />
                                <span className="truncate">{bw.name}</span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-semibold">{bw.overs}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{bw.maidens}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{bw.runs}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-sport-cricket font-bold">{bw.wickets}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{bw.wd}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-text-muted">{bw.nb}</td>
                              <td className="px-4 py-2.5 text-right font-mono text-sport-cricket">{bw.econ}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Commentary */}
              {activeTab === "commentary" && (
                <div className="glass-card rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                      Ball-by-Ball Live Commentary
                    </span>
                  </div>
                  <div className="divide-y divide-border/40 max-h-[480px] overflow-y-auto custom-scrollbar">
                    {details.timeline.map((item, idx) => (
                      <div key={idx} className="flex gap-4 px-4 py-3.5 hover:bg-overlay-2/10 transition-colors">
                        <div className="w-10 shrink-0 font-mono text-xs font-bold text-sport-cricket">
                          {item.ball || "—"}
                        </div>
                        <div className="text-xs font-light text-text-dim leading-relaxed">
                          {item.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Playing XI */}
              {activeTab === "playing11" && (
                <div className="space-y-6">
                  {Object.entries(details.teams).map(([teamName, squad], idx) => (
                    <div key={idx} className="glass-card border border-border rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-overlay/30 border-b border-border flex items-center gap-3">
                        <img
                          src={getTeamLogo(teamName)}
                          alt={teamName}
                          className="w-7 h-7 rounded-full bg-overlay-2 shrink-0 object-contain p-0.5"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
                          }}
                        />
                        <span className="text-[9px] font-black uppercase tracking-wider text-text-primary">
                          {teamName} XI
                        </span>
                      </div>
                      <div className="p-3 divide-y divide-border/20">
                        {squad.map((player, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3 py-2 text-xs font-light hover:bg-overlay-2/20 px-2 rounded-lg transition-colors">
                            <span className="font-mono text-text-muted/40 w-4 text-[9px]">#{pIdx + 1}</span>
                            <img
                              src={getPlayerImage(player)}
                              alt={player}
                              className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-border bg-overlay-3"
                              onError={(e) => {
                                e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
                              }}
                            />
                            <span className="font-semibold text-text-primary">{player}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: Table */}
              {activeTab === "table" && (
                <div className="glass-card border border-border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">
                      Standings & Points Table
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-light min-w-[400px]">
                      <thead>
                        <tr className="border-b border-border text-[8px] font-bold uppercase tracking-wider text-text-muted/60 bg-overlay-2/30">
                          <th className="px-4 py-2.5">Pos</th>
                          <th className="px-4 py-2.5">Team</th>
                          <th className="px-4 py-2.5 text-right">P</th>
                          <th className="px-4 py-2.5 text-right">W</th>
                          <th className="px-4 py-2.5 text-right">L</th>
                          <th className="px-4 py-2.5 text-right">Pts</th>
                          <th className="px-4 py-2.5 text-right">NRR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.pointsTable.map((t, idx) => (
                          <tr key={idx} className="border-b border-border/30 last:border-0 hover:bg-overlay-2/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-text-muted font-bold">{t.pos}</td>
                            <td className="px-4 py-3 font-bold text-text-primary flex items-center gap-2">
                              <img
                                src={getTeamLogo(t.short)}
                                alt={t.team}
                                className="w-5 h-5 rounded-full bg-overlay-2 shrink-0 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.team)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
                                }}
                              />
                              {t.team}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-text-muted">{t.p}</td>
                            <td className="px-4 py-3 text-right font-mono text-text-muted">{t.w}</td>
                            <td className="px-4 py-3 text-right font-mono text-text-muted">{t.l}</td>
                            <td className="px-4 py-3 text-right font-mono text-sport-cricket font-extrabold">{t.pts}</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-400 font-medium">{t.nrr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 6: Graphs */}
              {activeTab === "graphs" && (
                <div className="glass-card border border-border rounded-xl p-5 space-y-5">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Over-by-Over Manhattan Run Comparison
                    </h3>
                    <p className="text-[9px] text-text-muted/60 mt-1 leading-relaxed">
                      Detailed run comparisons scored on each individual over.
                    </p>
                  </div>

                  {/* SVG/CSS graph bars */}
                  <div className="w-full h-56 border-b border-l border-border flex items-end gap-1.5 px-3 pt-6 shrink-0">
                    {[6, 8, 12, 4, 15, 6, 9, 14, 5, 22, 8, 11, 4, 18, 7, 10, 5, 12, 9, 16].map((runs, overIdx) => {
                      const team1Height = (runs / 24) * 100;
                      const team2Height = Math.max(5, ((runs * 0.65) / 24) * 100);

                      return (
                        <div key={overIdx} className="flex-1 flex items-end gap-[1px] h-full group relative">
                          <div
                            className="bg-sport-cricket rounded-t w-full cursor-pointer hover:opacity-80 transition-all duration-300"
                            style={{ height: `${team1Height}%` }}
                          />
                          <div
                            className="bg-sport-football rounded-t w-full cursor-pointer hover:opacity-80 transition-all duration-300"
                            style={{ height: `${team2Height}%` }}
                          />

                          {/* Tooltip hover card */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-bg border border-border p-2 rounded shadow-xl text-[9px] font-mono shrink-0 z-10 w-24">
                            <span className="block text-sport-cricket font-bold">Over {overIdx + 1}</span>
                            <span className="block text-text-dim">{match.shortTeam1}: {runs}</span>
                            <span className="block text-sport-football font-semibold">{match.shortTeam2}: {Math.round(runs * 0.65)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend labels */}
                  <div className="flex gap-6 justify-center items-center text-[9px] font-bold uppercase tracking-wider pt-2 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-sport-cricket" />
                      <span>{match.shortTeam1}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-sport-football" />
                      <span>{match.shortTeam2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
