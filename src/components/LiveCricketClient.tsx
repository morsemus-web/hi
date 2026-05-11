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

/* ── Constants ── */
const API_URL = "/api/cricket";
const POLL_INTERVAL = 5000;
const JUNK_BOWLERS = ["IPL", "TATA IPL", "Over", "score not found", ""];

const FILTERS = [
  { key: "all", label: "All Matches" },
  { key: "ipl", label: "IPL" },
  { key: "international", label: "International" },
  { key: "county", label: "County" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

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
  if (filter === "ipl") return t.includes("premier league");
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

/* ── Avatar URL ── */
function avatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&rounded=true&bold=true&size=48`;
}

/* ── Main Component ── */
export default function LiveCricketClient() {
  const [matches, setMatches] = useState<ParsedMatch[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.matches)) {
        setMatches(processMatches(data.matches));
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const filtered = matches.filter((m) => filterMatch(m, filter));
  const liveCount = matches.filter((m) => m.isLive).length;

  return (
    <main className="min-h-screen bg-bg text-text-primary">
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
              Live Cricket
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
            Real-time scores from every match. Auto-refreshes every 5 seconds — ball by ball, wicket by wicket.
          </p>
        </div>

        {/* Filter pills + last updated */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-[10px] font-medium uppercase tracking-[0.1em] transition-all duration-300 cursor-pointer border ${
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
          <div className="glass-card rounded-xl p-8 text-center">
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
          <div className="glass-card rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🏏</div>
            <p className="text-text-dim text-sm font-light mb-2">No matches found</p>
            <p className="text-text-muted text-xs font-light">
              {filter !== "all" ? "Try a different filter or check back later." : "Check back later for live matches."}
            </p>
          </div>
        )}

        {/* Match Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((match) => (
              <MatchCard key={match.id} match={match} />
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

  const hasScore = match.score && match.score !== "score not found";

  return (
    <div
      className={`glass-card rounded-xl overflow-hidden transition-all duration-500 ${
        match.isLive ? "border-sport-cricket/15 hover:border-sport-cricket/30" : ""
      }`}
      style={match.isLive ? { boxShadow: "0 0 30px rgba(107,163,190,0.06)" } : undefined}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-text-muted/50 truncate max-w-[70%]">
          {match.matchInfo || "Cricket"}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {match.isLive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.15em] text-red-400/80 font-medium">
                Live
              </span>
            </>
          ) : (
            <span className="text-[9px] uppercase tracking-[0.12em] text-text-muted/40 font-light">
              {/won/i.test(match.statusDisplay) ? "Completed" : match.statusDisplay || "—"}
            </span>
          )}
        </div>
      </div>

      {/* Teams + Score */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-4">
          {/* Team 1 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={avatarUrl(match.shortTeam1)}
              alt={match.shortTeam1}
              width={36}
              height={36}
              className="rounded-full ring-1 ring-border flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
                {match.shortTeam1}
              </p>
              <p className="text-[9px] text-text-muted/50 font-light truncate">
                {match.team1}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className="flex-shrink-0 text-center px-3">
            {hasScore ? (
              <p className={`text-lg font-extrabold tracking-tight font-mono ${match.isLive ? "text-sport-cricket" : "text-text-primary"}`}>
                {match.score.replace(/^[A-Z]+ /, "")}
              </p>
            ) : (
              <p className="text-sm font-mono text-text-muted/40">vs</p>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
                {match.shortTeam2}
              </p>
              <p className="text-[9px] text-text-muted/50 font-light truncate">
                {match.team2}
              </p>
            </div>
            <img
              src={avatarUrl(match.shortTeam2)}
              alt={match.shortTeam2}
              width={36}
              height={36}
              className="rounded-full ring-1 ring-border flex-shrink-0"
            />
          </div>
        </div>

        {/* Status text */}
        {match.statusDisplay && (
          <div className={`mt-4 text-center px-4 py-2 rounded-lg ${match.isLive ? "bg-sport-cricket/[0.06] border border-sport-cricket/[0.12]" : "bg-overlay-2 border border-border"}`}>
            <p className={`text-[11px] font-light ${match.isLive ? "text-sport-cricket" : "text-text-dim"}`}>
              {match.statusDisplay}
            </p>
          </div>
        )}

        {/* Players section */}
        {(validBatsmen?.length > 0 || validBowler) && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              {/* Batsmen */}
              {validBatsmen?.length > 0 && (
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-text-muted/40 mb-2 font-mono">
                    Batting
                  </p>
                  <div className="space-y-1.5">
                    {validBatsmen.map((b, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px] text-text-dim font-light truncate max-w-[60%]">
                          {b.name}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-text-primary/80">
                          {b.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bowler */}
              {validBowler && (
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-text-muted/40 mb-2 font-mono">
                    Bowling
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-sport-f1/50" />
                    <span className="text-[11px] text-text-dim font-light">
                      {match.current_bowler.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
