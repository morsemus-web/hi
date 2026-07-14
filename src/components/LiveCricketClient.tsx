"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { evaluateCricketMatchState } from "@/lib/cricketEngine";

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
  startDate: string;
  locationName: string;
  playerOfTheMatch?: string;
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

/* ── Real Player Face Headshots via Bing CDN ── */
function getPlayerImage(name: string): string {
  const cleanPlayerName = name.replace(/\(c\)|\(wk\)|\*/gi, "").trim();
  return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(cleanPlayerName + " headshot cricket png")}&w=80&h=80&c=7&rs=1&p=0`;
}

/* ── Real Logos Mapper via Bing CDN ── */
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

/* ── Date Formatting Helper ── */
function formatMatchTime(isoString: string) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return isoString;
  }
}

/* ── Google Sports Specific Helpers ── */
function getMatchState(statusText: string) {
  const t = (statusText || "").toLowerCase();
  
  // Clean all emojis for sleek typography
  let cleanText = statusText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
  
  // Extract the status part after " - " (e.g. "RCB vs GT - RCB won" → "RCB won")
  const statusPart = t.includes(" - ") ? t.split(" - ").slice(1).join(" - ").trim() : t;
  
  const isCompleted = statusPart.includes("won") || statusPart.includes("beat") || statusPart.includes("draw") || statusPart.includes("tied") || statusPart.includes("completed") || statusPart.includes("abandoned") || statusPart.includes("no result");
  const isUpcoming = statusPart.includes("starts at") || statusPart.includes("starts in") || statusPart.includes("starting") || statusPart.includes("preview") || statusPart.includes("yet to begin") || /\b\d{1,2}:\d{2}\b/.test(statusPart) || /\b(am|pm)\b/i.test(statusPart);
  const isLive = !isCompleted && !isUpcoming && (statusPart.includes("need") || statusPart.includes("opt to") || statusPart.includes("opted to") || statusPart.includes("trail") || statusPart.includes("lead") || statusPart.includes("chose to") || statusPart.includes("innings break") || statusPart.includes("break") || /\d+[\-\/]\d+/.test(t) || statusPart.includes("ov") || statusPart.includes("overs"));
  
  let statusDisplay = cleanText;
  if (cleanText.includes(" - ")) {
    statusDisplay = cleanText.split(" - ").slice(1).join(" - ").trim();
  }
  
  return { isLive, isCompleted, isUpcoming, statusDisplay };
}

function filterMatch(match: ParsedMatch, filter: FilterKey): boolean {
  if (filter === "all") return true;
  
  const league = getLeagueName(match).toLowerCase();
  
  if (filter === "ipl") {
    return league.includes("ipl") || league.includes("indian premier league");
  }
  
  if (filter === "international") {
    return !league.includes("ipl") && 
           !league.includes("indian premier league") && 
           !league.includes("county") && 
           !league.includes("championship");
  }
  
  if (filter === "county") {
    return league.includes("county") || league.includes("championship");
  }
  
  return true;
}

function formatGoogleStyleTime(isoString: string) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `TODAY, ${timeStr}`;
    } else if (isTomorrow) {
      return `TOMORROW, ${timeStr}`;
    } else {
      const dayStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      return `${dayStr.toUpperCase()}, ${timeStr}`;
    }
  } catch (e) {
    return isoString;
  }
}

function parseInningsScore(inningsTotal: string) {
  if (!inningsTotal) return { score: "", overs: "" };
  // inningsTotal is like "254-5 (20.0 Ovs)" or "162-10 (19.3)"
  const scoreMatch = inningsTotal.match(/^([0-9\/\-]+)/);
  const oversMatch = inningsTotal.match(/\(([0-9\.]+)/);
  
  const score = scoreMatch ? scoreMatch[1].replace("-", "/") : "";
  const overs = oversMatch ? oversMatch[1] : "";
  return { score, overs };
}

function getTarget(innings0Total: string) {
  if (!innings0Total) return 0;
  const scoreMatch = innings0Total.match(/^(\d+)/);
  if (scoreMatch) {
    return parseInt(scoreMatch[1]) + 1;
  }
  return 0;
}

function isTeamWinner(match: ParsedMatch, teamShort: string, teamFull: string) {
  const status = (match.statusDisplay || match.status_text || "").toLowerCase();
  const tShort = (teamShort || "").toLowerCase();
  const tFull = (teamFull || "").toLowerCase();
  
  return status.includes(`${tShort} won`) || 
         status.includes(`${tFull} won`) || 
         status.includes(`${tShort} won`) || 
         status.includes(`${tFull} won`);
}

function getCardSubtitle(match: ParsedMatch, details: MatchDetails | null) {
  const parts: string[] = [];
  
  const matchInfoParts = match.matchInfo ? match.matchInfo.split(",") : [];
  const stage = matchInfoParts[0]?.trim(); // e.g. "Qualifier 1"
  
  if (stage) {
    parts.push(stage);
  }
  
  if (details?.locationName) {
    parts.push(details.locationName);
  }
  
  if (details?.startDate) {
    try {
      const d = new Date(details.startDate);
      parts.push(d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    } catch(e) {}
  }
  
  const series = getLeagueName(match);
  if (series && !parts.includes(series)) {
    parts.push(series);
  }
  
  return parts.join(", ");
}

/* ── Parsing Helpers ── */
function parseTitle(rawTitle: string) {
  let title = rawTitle.replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
  const pipeParts = title.split(" | ");
  
  // Find the pipe part that contains " vs " and is NOT "Cricbuzz"
  let fullSection = "";
  for (let i = pipeParts.length - 1; i >= 0; i--) {
    const part = pipeParts[i].trim();
    if (part.toLowerCase() !== "cricbuzz" && part.toLowerCase() !== "cricbuzz.com") {
      if (part.includes(" vs ")) {
        fullSection = part;
        break;
      }
    }
  }
  
  // Fallback if no part has " vs "
  if (!fullSection) {
    const nonCricbuzzParts = pipeParts.filter(p => p.trim().toLowerCase() !== "cricbuzz");
    fullSection = nonCricbuzzParts[nonCricbuzzParts.length - 1]?.trim() || "";
  }
  
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
  
  const cleanSuffix = (s: string) => {
    if (!s) return "";
    return s
      .replace(/\s+\d+(st|nd|rd|th)\s+match.*$/i, "")
      .replace(/\s+(qualifier|group|final|semi).*$/i, "")
      .trim();
  };

  return {
    shortTeam1: cleanSuffix(parts[0]?.trim() || "??"),
    shortTeam2: cleanSuffix(parts[1]?.trim() || "??"),
  };
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
  
  const regex1 = new RegExp(`\\b${t1}\\s+([0-9/&\\s-]+(?:\\([0-9.]+\\))?)`, "i");
  const regex2 = new RegExp(`\\b${t2}\\s+([0-9/&\\s-]+(?:\\([0-9.]+\\))?)`, "i");
  
  const match1 = match.title.match(regex1);
  const match2 = match.title.match(regex2);
  
  if (match1) score1 = match1[1].trim();
  if (match2) score2 = match2[1].trim();
  
  if (!score1 && !score2 && match.score && match.score !== "score not found") {
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
  const selectedMatchRef = useRef<ParsedMatch | null>(null);
  const [matchDetailsMap, setMatchDetailsMap] = useState<Record<string, MatchDetails>>({});
  const fetchedIdsRef = useRef<Set<string>>(new Set());

  // Date selection states (UK / London relative to match soccer client)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateTabs, setDateTabs] = useState<{ label: string; dateStr: string }[]>([]);

  // Keep ref in sync with state so fetchMatches can read it without depending on it
  useEffect(() => { selectedMatchRef.current = selectedMatch; }, [selectedMatch]);

  // Generate date tabs: Yesterday, Today, Tomorrow (in London relative time)
  useEffect(() => {
    const dates: { label: string; dateStr: string }[] = [];
    const getLondonDate = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      try {
        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Europe/London",
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
        return formatter.format(d);
      } catch {
        return d.toISOString().split("T")[0];
      }
    };

    const yesterdayStr = getLondonDate(-1);
    const todayStr = getLondonDate(0);
    const tomorrowStr = getLondonDate(1);

    dates.push({ label: "Yesterday", dateStr: yesterdayStr });
    dates.push({ label: "Today", dateStr: todayStr });
    dates.push({ label: "Tomorrow", dateStr: tomorrowStr });

    setDateTabs(dates);
    setSelectedDate(todayStr); // Default to today
  }, []);

  const fetchMatches = useCallback(async (dateStr: string) => {
    if (!dateStr) return;
    try {
      const res = await fetch(`${API_URL}?date=${dateStr}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.matches)) {
        const processed = processMatches(data.status_text || data.matches);
        setMatches(processed);
        setLastUpdated(new Date());
        setError(null);

        // Keep selected match details synced via ref (avoids dependency loop)
        const currentSelected = selectedMatchRef.current;
        if (currentSelected) {
          const updated = processed.find(m => m.id === currentSelected.id);
          if (updated) setSelectedMatch(updated);
        }

        // Dynamic background details pre-fetch for schedule start timings and venues
        processed.forEach(async (m) => {
          const hasBeenFetched = fetchedIdsRef.current.has(m.id);
          const isLiveScore = m.isLive || (m.score && m.score !== "score not found" && m.score.trim() !== "");
          if (!hasBeenFetched || isLiveScore) {
            try {
              const detailRes = await fetch(`${DETAILS_API_URL}?id=${m.id}`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData.status === "success") {
                  fetchedIdsRef.current.add(m.id);
                  setMatchDetailsMap((prev) => ({ ...prev, [m.id]: detailData }));
                }
              }
            } catch (e) {
              // Ignore background fetch errors
            }
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scores");
    } finally {
      setLoading(false);
    }
  }, []);

  const processMatches = (raw: MatchData[]): ParsedMatch[] => {
    return raw.map((m) => {
      const { team1, team2, matchInfo } = parseTitle(m.title);
      const { shortTeam1, shortTeam2 } = parseShortTeams(m.status_text);
      let { isLive, isCompleted: stateCompleted, isUpcoming, statusDisplay } = getMatchState(m.status_text);

      // If no state detected from status_text, check title for scores to determine live vs preview
      if (!isLive && !stateCompleted && !isUpcoming) {
        const titleHasScores = /\b\d+[\/-]\d+\b/.test(m.title) || /\b\d+\s*\(/.test(m.title);
        if (titleHasScores) {
          isLive = true;
          statusDisplay = "In Progress";
        }
      }

      return { ...m, team1, team2, shortTeam1, shortTeam2, matchInfo, isLive, statusDisplay };
    });
  };

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true); // Show loader when switching dates
    fetchMatches(selectedDate);

    // Refresh scores every POLL_INTERVAL only if selected date is Today
    const todayTab = dateTabs.find(tab => tab.label === "Today");
    const isToday = todayTab && todayTab.dateStr === selectedDate;

    let interval: NodeJS.Timeout | null = null;
    if (isToday) {
      interval = setInterval(() => fetchMatches(selectedDate), POLL_INTERVAL);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedDate, dateTabs, fetchMatches]);

  // Dynamically evaluate match state (live/completed) taking background details into account
  const parsedMatches = matches.map((m) => {
    const details = matchDetailsMap[m.id] || null;
    const engineState = evaluateCricketMatchState(m, details);
    const isCompleted = engineState.matchEnded;
    const isLive = !engineState.matchEnded && (
      engineState.currentState === "LIVE" || 
      engineState.currentState === "INNINGS_BREAK" || 
      engineState.currentState === "RAIN_DELAY" || 
      engineState.currentState === "STUMPS" ||
      (m.isLive && engineState.currentState !== "NOT_STARTED")
    );
    return {
      ...m,
      isLive,
      statusDisplay: engineState.resultText || m.statusDisplay
    };
  });

  const filtered = parsedMatches.filter((m) => filterMatch(m, filter));
  const liveCount = parsedMatches.filter((m) => m.isLive).length;

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

        {/* English Commentary Beta Banner (No Emojis) */}
        <div className="mb-8 p-4 rounded-xl bg-sport-cricket/5 border border-sport-cricket/20 flex items-center gap-3 animate-fade-in shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
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

        {/* Date Tabs */}
        <div className="flex border-b border-border mb-8 select-none">
          {dateTabs.map(tab => (
            <button
              key={tab.dateStr}
              onClick={() => setSelectedDate(tab.dateStr)}
              className={`px-6 py-3 border-b-2 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedDate === tab.dateStr
                  ? "border-sport-cricket text-sport-cricket"
                  : "border-transparent text-text-muted/65 hover:text-text-dim"
              }`}
            >
              {tab.label}
              <span className="block text-[9px] font-normal font-mono opacity-50 mt-0.5">
                {tab.dateStr}
              </span>
            </button>
          ))}
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
          <div className="flex flex-col items-end gap-1 select-none">
            {lastUpdated && (
              <span className="text-[9px] font-mono text-text-muted/40 uppercase tracking-wider">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {error && matches.length > 0 && (
              <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider animate-pulse">
                Connection offline: showing cached scores
              </span>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-10 animate-fade-in">
            {/* Skeleton league header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-4 mt-2">
                <div className="h-4 w-48 rounded bg-overlay-2 animate-pulse" />
                <div className="h-3 w-12 rounded bg-overlay-2 animate-pulse" />
              </div>
              {/* Skeleton match cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass-card rounded-2xl border border-border/60 p-5 space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-28 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    {/* Subtitle skeleton */}
                    <div className="h-3 w-3/4 rounded bg-overlay-2 animate-pulse" />
                    {/* Team 1 skeleton */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-full bg-overlay-2 animate-pulse" />
                        <div className="h-3 w-32 rounded bg-overlay-2 animate-pulse" />
                      </div>
                      <div className="h-4 w-14 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    {/* Team 2 skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-full bg-overlay-2 animate-pulse" />
                        <div className="h-3 w-28 rounded bg-overlay-2 animate-pulse" />
                      </div>
                      <div className="h-4 w-14 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    {/* Status skeleton */}
                    <div className="mt-1">
                      <div className="h-3 w-40 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    {/* Footer links skeleton */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border/30">
                      <div className="h-3 w-16 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-20 rounded bg-overlay-2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Second skeleton league group */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-4 mt-2">
                <div className="h-4 w-36 rounded bg-overlay-2 animate-pulse" />
                <div className="h-3 w-12 rounded bg-overlay-2 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[5, 6].map((i) => (
                  <div key={i} className="glass-card rounded-2xl border border-border/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-24 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-16 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    <div className="h-3 w-2/3 rounded bg-overlay-2 animate-pulse" />
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-full bg-overlay-2 animate-pulse" />
                        <div className="h-3 w-32 rounded bg-overlay-2 animate-pulse" />
                      </div>
                      <div className="h-4 w-14 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-full bg-overlay-2 animate-pulse" />
                        <div className="h-3 w-28 rounded bg-overlay-2 animate-pulse" />
                      </div>
                      <div className="h-4 w-14 rounded bg-overlay-2 animate-pulse" />
                    </div>
                    <div className="mt-1"><div className="h-3 w-40 rounded bg-overlay-2 animate-pulse" /></div>
                    <div className="flex items-center gap-4 pt-3 border-t border-border/30">
                      <div className="h-3 w-16 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-20 rounded bg-overlay-2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error state (when no matches are cached/loaded) */}
        {error && !loading && matches.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <p className="text-sport-f1 text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchMatches(selectedDate); }}
              className="px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] bg-sport-cricket/15 text-sport-cricket border border-sport-cricket/20 rounded-lg hover:bg-sport-cricket/25 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state (No Emojis) */}
        {!loading && (!error || matches.length > 0) && filtered.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
            <p className="text-text-dim text-sm font-light mb-2">No matches found</p>
            <p className="text-text-muted text-xs font-light">
              {filter !== "all" ? "Try a different filter or check back later." : "There are no matches scheduled for this date."}
            </p>
          </div>
        )}

        {/* Match Grouping Blocks (Matches Football Design Pattern) */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-10">
            {Object.entries(groupedMatches).map(([leagueName, leagueMatches]) => (
              <div key={leagueName} className="space-y-4">
                {/* League Heading Grouped Header Chevron */}
                <div className="flex items-center border-b border-border/60 pb-2.5 mb-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-wider text-text-primary">
                      {leagueName}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-text-muted shrink-0">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Match Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {leagueMatches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className="cursor-pointer group animate-fade-in"
                    >
                      <MatchCard match={match} details={matchDetailsMap[match.id] || null} />
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
function MatchCard({ match, details }: { match: ParsedMatch; details: MatchDetails | null }) {
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

  const battingScore = score2 || score1 || "";
  const oversMatch = battingScore.match(/\((\d+(?:\.\d+)?)\)/);
  const currentOvers = oversMatch ? parseFloat(oversMatch[1]) : 0;
  const currentRuns = battingScore.match(/^(\d+)/) ? parseInt(battingScore.match(/^(\d+)/)![1]) : 0;
  const targetVal = currentRuns + runsNeeded;

  // Resolve dynamic match state using the universal engine
  const engineState = evaluateCricketMatchState(match, details);
  const isCompleted = engineState.matchEnded;
  const isLive = !isCompleted && (
    engineState.currentState === "LIVE" || 
    engineState.currentState === "INNINGS_BREAK" || 
    engineState.currentState === "RAIN_DELAY" || 
    engineState.currentState === "STUMPS" ||
    (match.isLive && engineState.currentState !== "NOT_STARTED")
  );

  const statusLower = (match.statusDisplay || "").toLowerCase();
  const fullStatusLower = (match.status_text || "").toLowerCase();
  const isT1Winner = isCompleted && isTeamWinner(match, match.shortTeam1, match.team1);
  const isT2Winner = isCompleted && isTeamWinner(match, match.shortTeam2, match.team2);
  
  // Decide whether to dim a team (dim completed losers only)
  const dimT1 = isCompleted && isT2Winner && !isT1Winner;
  const dimT2 = isCompleted && isT1Winner && !isT2Winner;

  // Innings scores from background loaded details or fallback to main scores
  const innScore1 = details?.innings[0] ? parseInningsScore(details.innings[0].total).score : "";
  const innScore2 = details?.innings[1] ? parseInningsScore(details.innings[1].total).score : "";
  const finalScore1 = innScore1 || score1;
  const finalScore2 = innScore2 || score2;

  // Chasing details
  const tVal = details?.innings[0] ? getTarget(details.innings[0].total) : targetVal;
  const oVal2 = details?.innings[1] ? parseInningsScore(details.innings[1].total).overs : "";
  const isChasing = (isLive || isCompleted) && (finalScore2 !== "" || (details?.innings?.length ?? 0) > 1);

  // Status text note: "Match yet to begin" or "RCB won by 92 runs"
  let statusNote = "Match yet to begin";
  if (isLive) {
    statusNote = engineState.resultText || match.statusDisplay;
  } else if (isCompleted) {
    statusNote = engineState.resultText || match.statusDisplay || match.status_text || "Match Completed";
  }

  // Google Sports Status header left string
  let statusHeader = "PREVIEW";
  if (isLive) {
    statusHeader = `LIVE • ${currentOvers > 0 ? currentOvers : oVal2 || "0"} OV`;
  } else if (isCompleted) {
    statusHeader = "RESULT";
  } else if (details?.startDate) {
    statusHeader = formatGoogleStyleTime(details.startDate);
  }

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border p-5 select-none ${
        isLive 
          ? "border-sport-cricket/35 shadow-[0_4px_24px_rgba(107,163,190,0.06)] bg-overlay/10" 
          : "border-border/60 hover:border-border hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
      }`}
    >
      {/* 1. Header block */}
      <div className="flex items-center justify-between pb-2">
        <span className={`text-[10px] font-black uppercase tracking-widest ${
          match.isLive ? "text-red-500 flex items-center gap-1.5 font-mono" : "text-text-muted/65"
        }`}>
          {match.isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
          {statusHeader}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted/30 font-mono">
          {match.shortTeam1} VS {match.shortTeam2}
        </span>
      </div>

      {/* 2. Subtitle block (Qualifier 1 (N), Dharamsala, May 26, 2026, Indian Premier League) */}
      <p className="text-[10.5px] font-medium text-text-muted/50 leading-tight pb-3 truncate max-w-full">
        {getCardSubtitle(match, details)}
      </p>

      {/* 3. Teams and Scores list grid */}
      <div className="space-y-3 pt-2.5 pb-2">
        {/* Team 1 Row */}
        <div className={`flex items-center justify-between gap-4 transition-opacity duration-300 ${dimT1 ? "opacity-45" : "opacity-100"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={getTeamLogo(match.shortTeam1)}
              alt={match.shortTeam1}
              width={26}
              height={26}
              className="rounded-full ring-1 ring-border flex-shrink-0 bg-overlay-2 object-contain p-0.5"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.shortTeam1)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
              }}
            />
            <span className={`text-[12px] uppercase tracking-wide truncate max-w-[180px] sm:max-w-[240px] ${
              dimT1 ? "font-medium text-text-muted" : "font-extrabold text-text-primary"
            }`}>
              {match.team1 || match.shortTeam1}
            </span>
          </div>
          {finalScore1 && (
            <span className={`font-mono text-xs sm:text-[13px] tracking-tight shrink-0 ${
              dimT1 ? "font-bold text-text-muted" : "font-black text-text-primary"
            }`}>
              {finalScore1.replace(/^[A-Z]+ /, "")}
            </span>
          )}
        </div>

        {/* Team 2 Row */}
        <div className={`flex items-center justify-between gap-4 transition-opacity duration-300 ${dimT2 ? "opacity-45" : "opacity-100"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={getTeamLogo(match.shortTeam2)}
              alt={match.shortTeam2}
              width={26}
              height={26}
              className="rounded-full ring-1 ring-border flex-shrink-0 bg-overlay-2 object-contain p-0.5"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.shortTeam2)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
              }}
            />
            <span className={`text-[12px] uppercase tracking-wide truncate max-w-[180px] sm:max-w-[240px] ${
              dimT2 ? "font-medium text-text-muted" : "font-extrabold text-text-primary"
            }`}>
              {match.team2 || match.shortTeam2}
            </span>
          </div>
          <div className="flex items-center shrink-0">
            {isChasing && tVal > 0 && (
              <span className="text-[10px] font-mono text-text-muted/40 mr-2 tracking-tighter shrink-0 select-none">
                ({oVal2 || currentOvers} ov, T:{tVal})
              </span>
            )}
            {finalScore2 && (
              <span className={`font-mono text-xs sm:text-[13px] tracking-tight shrink-0 ${
                dimT2 ? "font-bold text-text-muted" : "font-black text-text-primary"
              }`}>
                {finalScore2.replace(/^[A-Z]+ /, "")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Match Note Status text */}
      <div className="mt-2.5">
        <p className={`text-[11px] font-bold tracking-tight ${
          match.isLive ? "text-sport-cricket" : "text-text-dim"
        }`}>
          {statusNote}
        </p>
      </div>

      {/* 5. Gold-accented Player of the Match Highlights Showcase */}
      {isCompleted && details?.playerOfTheMatch && (
        <div className="mt-4 p-3 bg-[#b8a45e]/5 border border-[#b8a45e]/15 rounded-xl flex items-center gap-3 animate-fade-in select-none">
          <img
            src={getPlayerImage(details.playerOfTheMatch)}
            alt={details.playerOfTheMatch}
            className="w-[34px] h-[34px] rounded-full object-cover shrink-0 ring-2 ring-[#b8a45e]/30 bg-[#b8a45e]/15"
            onError={(e) => {
              e.currentTarget.src = "https://g.espncdn.com/i/headshots/nophoto.png";
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center text-[7.5px] font-black uppercase tracking-widest text-[#b8a45e] bg-[#b8a45e]/10 border border-[#b8a45e]/25 px-1.5 py-0.5 rounded leading-none select-none">
              Player of the Match
            </div>
            <p className="text-[11.5px] font-black text-text-primary truncate mt-1 leading-none">
              {details.playerOfTheMatch}
            </p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-[#b8a45e] shrink-0 opacity-80 select-none">
            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.35.148-2.41 1.285-2.41 2.695v.186c0 .89.366 1.7.954 2.285.541.539 1.285.897 2.112.977a4.27 4.27 0 003.535 3.535v2.247H7.75a.75.75 0 000 1.5h8.5a.75.75 0 000-1.5h-1.606v-2.247a4.27 4.27 0 003.535-3.535c.827-.08 1.571-.438 2.112-.977.588-.585.954-1.396.954-2.285v-.186c0-1.41-1.06-2.547-2.41-2.695v-.858a.75.75 0 00-.75-.75H5.916a.75.75 0 00-.75.75zm13.668 3.553v.186c0 .493-.203.94-.53 1.265-.3.298-.71.498-1.164.545a4.254 4.254 0 00-.31-1.81v-.186h2.004zM5.166 6.366h2.004v.186a4.254 4.254 0 00-.31 1.81 1.724 1.724 0 01-1.164-.545 1.724 1.724 0 01-.53-1.265v-.186z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* 6. Flat action links aligned horizontally */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
        {match.isLive ? (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest text-sport-cricket hover:underline select-none">
              Live Center
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 hover:underline select-none">
              Commentary
            </span>
          </>
        ) : isCompleted ? (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest text-sport-cricket hover:underline select-none">
              Live Blog
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 hover:underline select-none">
              Scorecard
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] font-black uppercase tracking-widest text-sport-cricket hover:underline select-none">
              Preview
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40 hover:underline select-none">
              Squads
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Immersive Details Slide Drawer Component ── */
function MatchDetailsDrawer({ match, onClose }: { match: ParsedMatch; onClose: () => void }) {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"live" | "scorecard" | "commentary" | "playing11" | "table" | "graphs">(
    match.isLive ? "live" : "scorecard"
  );
  const [inningsIdx, setInningsIdx] = useState(0);

  const getShortName = (fullName: string) => {
    const fLower = fullName.toLowerCase();
    const t1Lower = (match.team1 || "").toLowerCase();
    const s1Lower = (match.shortTeam1 || "").toLowerCase();
    const t2Lower = (match.team2 || "").toLowerCase();
    const s2Lower = (match.shortTeam2 || "").toLowerCase();
    
    if (fLower.includes(t1Lower) || fLower.includes(s1Lower) || t1Lower.includes(fLower) || s1Lower.includes(fLower)) {
      return match.shortTeam1;
    }
    if (fLower.includes(t2Lower) || fLower.includes(s2Lower) || t2Lower.includes(fLower) || s2Lower.includes(fLower)) {
      return match.shortTeam2;
    }
    return fullName;
  };

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

  // Resolve if the match is completed using the universal match state engine
  const matchState = evaluateCricketMatchState(match, details);
  const isMatchCompleted = matchState.matchEnded;

  // Switch tab away from "live" to "scorecard" when match is completed
  useEffect(() => {
    if (isMatchCompleted && activeTab === "live") {
      setActiveTab("scorecard");
    }
  }, [isMatchCompleted, activeTab]);

  // Resolve dynamically updated scores for completed/inactive matches
  const totalScore1 = details && details.innings.length > 0
    ? details.innings[0]?.total.split(" (")[0]
    : "";
  const totalScore2 = details && details.innings.length > 1
    ? details.innings[1]?.total.split(" (")[0]
    : "";

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
              {/* Dynamic Score Resolution */}
              {totalScore1 && (
                <span className="text-xs font-mono font-bold text-text-dim mt-1">{totalScore1}</span>
              )}
            </div>

            {/* Score box */}
            <div className="col-span-1 text-center flex flex-col items-center justify-center">
              <div className="text-sm font-mono font-black text-text-primary bg-overlay-2 border border-border rounded-lg py-1 px-2 shadow-inner min-w-[70px]">
                {match.score && match.score !== "score not found" 
                  ? match.score.replace(/^[A-Z]+ /, "") 
                  : (totalScore1 && totalScore2
                      ? `${totalScore1} vs ${totalScore2}`
                      : "VS")}
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
              {/* Dynamic Score Resolution */}
              {totalScore2 && (
                <span className="text-xs font-mono font-bold text-text-dim mt-1">{totalScore2}</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Tabs Navigation (Matches Football style) */}
        <div className="flex border-b border-border bg-surface px-2 sm:px-4 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          {([
            ...(match.isLive && !isMatchCompleted ? [{ key: "live" as const, label: "Live Center" }] : []),
            { key: "scorecard" as const, label: "Scorecard" },
            { key: "commentary" as const, label: "Commentary" },
            { key: "playing11" as const, label: "Playing XI" },
            { key: "table" as const, label: "Table" },
            { key: "graphs" as const, label: "Run Graphs" }
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-3 border-b-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-sport-cricket border-b-2 border-sport-cricket text-sport-cricket"
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
            <div className="space-y-6 animate-fade-in">
              {/* Status banner skeleton */}
              <div className="h-10 w-full rounded-lg bg-overlay-2 animate-pulse" />
              {/* Venue/Schedule skeleton */}
              <div className="glass-card rounded-xl p-4 border border-border space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 rounded bg-overlay-2 animate-pulse" />
                  <div className="h-3 w-40 rounded bg-overlay-2 animate-pulse" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 w-20 rounded bg-overlay-2 animate-pulse" />
                  <div className="h-3 w-52 rounded bg-overlay-2 animate-pulse" />
                </div>
              </div>
              {/* Batting card skeleton */}
              <div className="glass-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-overlay/30 border-b border-border flex justify-between items-center">
                  <div className="h-3 w-36 rounded bg-overlay-2 animate-pulse" />
                  <div className="h-3 w-20 rounded bg-overlay-2 animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  {/* Table header skeleton */}
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-16 rounded bg-overlay-2 animate-pulse" />
                    {[1,2,3,4,5].map(i => <div key={i} className="h-2 w-6 rounded bg-overlay-2 animate-pulse ml-auto" />)}
                  </div>
                  {/* Row skeletons */}
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-overlay-2 animate-pulse shrink-0" />
                      <div className="h-3 rounded bg-overlay-2 animate-pulse" style={{ width: `${100 - i * 8}px` }} />
                      <div className="h-3 w-6 rounded bg-overlay-2 animate-pulse ml-auto" />
                      <div className="h-3 w-6 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-5 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-5 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-8 rounded bg-overlay-2 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Bowling card skeleton */}
              <div className="glass-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                  <div className="h-3 w-32 rounded bg-overlay-2 animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-overlay-2 animate-pulse shrink-0" />
                      <div className="h-3 rounded bg-overlay-2 animate-pulse" style={{ width: `${90 - i * 6}px` }} />
                      <div className="h-3 w-6 rounded bg-overlay-2 animate-pulse ml-auto" />
                      <div className="h-3 w-5 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-6 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-5 rounded bg-overlay-2 animate-pulse" />
                      <div className="h-3 w-8 rounded bg-overlay-2 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && !details && (
            <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 text-xs font-light">{error}</p>
            </div>
          )}

          {details && (
            <div className="space-y-6 animate-fade-in">
              {(details.statusText || matchState.resultText) && (
                <div className="p-3.5 rounded-lg text-center bg-sport-cricket/5 border border-sport-cricket/20 text-xs font-semibold uppercase tracking-wider text-sport-cricket shadow-sm">
                  {matchState.resultText || details.statusText}
                </div>
              )}

              {/* Dynamic Timing & Venue Widget (Parsed from Google JSON-LD schema) */}
              {(details.startDate || details.locationName) && (
                <div className="glass-card rounded-xl p-4 border border-border space-y-2.5 text-xs font-mono text-text-muted">
                  {details.startDate && (
                    <div className="flex justify-between items-center">
                      <span>Match Schedule:</span>
                      <span className="text-text-dim font-bold">{formatMatchTime(details.startDate)}</span>
                    </div>
                  )}
                  {details.locationName && (
                    <div className="flex justify-between items-start gap-4">
                      <span>Match Venue:</span>
                      <span className="text-text-dim font-bold text-right max-w-[70%]">{details.locationName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: Live Center */}
              {activeTab === "live" && (
                <div className="space-y-6">
                   {/* Win Probability Indicator */}
                  {!isMatchCompleted && (
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
                  )}

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
              {activeTab === "scorecard" && (() => {
                const isTestMatch = match.matchInfo?.toLowerCase().includes("test") || match.title?.toLowerCase().includes("test");
                const maxInningsCount = isTestMatch ? 4 : 2;
                const displayedInnings = details.innings.slice(0, maxInningsCount);
                const safeInningsIdx = Math.min(inningsIdx, displayedInnings.length - 1);

                const getBattingTeamShortName = (innIdx: number) => {
                  const inn = details.innings[innIdx];
                  if (!inn || inn.batters.length === 0) {
                    return innIdx === 0 ? match.shortTeam1 : match.shortTeam2;
                  }
                  const firstBatter = inn.batters[0].name.toLowerCase();
                  
                  for (const [teamName, squad] of Object.entries(details.teams)) {
                    const inSquad = squad.some(
                      (p) => p.toLowerCase().includes(firstBatter) || firstBatter.includes(p.toLowerCase())
                    );
                    if (inSquad) {
                      const tNameLower = teamName.toLowerCase();
                      if (tNameLower.includes(match.team1.toLowerCase()) || tNameLower.includes(match.shortTeam1.toLowerCase())) {
                        return match.shortTeam1;
                      }
                      if (tNameLower.includes(match.team2.toLowerCase()) || tNameLower.includes(match.shortTeam2.toLowerCase())) {
                        return match.shortTeam2;
                      }
                      return teamName.replace(/[^A-Z]/g, "") || teamName.substring(0, 3).toUpperCase();
                    }
                  }
                  return innIdx === 0 ? match.shortTeam1 : match.shortTeam2;
                };

                const getInningsTeams = (innIdx: number) => {
                  const inn = details.innings[innIdx];
                  let battingTeam = innIdx === 0 ? match.team1 : match.team2;
                  let bowlingTeam = innIdx === 0 ? match.team2 : match.team1;
                  
                  if (!inn || inn.batters.length === 0) {
                    return { battingTeam, bowlingTeam };
                  }
                  const firstBatter = inn.batters[0].name.toLowerCase();
                  
                  for (const [teamName, squad] of Object.entries(details.teams)) {
                    const inSquad = squad.some(
                      (p) => p.toLowerCase().includes(firstBatter) || firstBatter.includes(p.toLowerCase())
                    );
                    if (inSquad) {
                      battingTeam = teamName;
                      const otherTeam = Object.keys(details.teams).find(name => name !== teamName);
                      if (otherTeam) {
                        bowlingTeam = otherTeam;
                      }
                      break;
                    }
                  }
                  return { battingTeam, bowlingTeam };
                };

                const currentTeams = getInningsTeams(safeInningsIdx);

                return (
                  <div className="space-y-6">
                    {/* Innings selector tab */}
                    <div className="flex gap-2 p-1 bg-overlay-2 border border-border rounded-xl w-fit shrink-0">
                      {displayedInnings.map((inn, idx) => {
                        const prefix = idx === 0 || (isTestMatch && idx === 1) ? "1st Innings" : "2nd Innings";
                        const labelText = `${prefix} - ${getBattingTeamShortName(idx)}`;

                        return (
                          <button
                            key={idx}
                            onClick={() => setInningsIdx(idx)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                              safeInningsIdx === idx
                                ? "bg-bg border border-border text-sport-cricket shadow-sm"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {labelText}
                          </button>
                        );
                      })}
                    </div>

                    {/* Batting details */}
                    <div className="glass-card rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 bg-overlay/30 border-b border-border flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sport-cricket">
                          {currentTeams.battingTeam} Batting Card
                        </span>
                        <span className="text-xs font-mono font-bold text-sport-cricket">
                          {details.innings[safeInningsIdx]?.total}
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
                            {details.innings[safeInningsIdx]?.batters.map((b, idx) => (
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

                    {/* Summary boxes (Extras + Total + Yet to Bat) */}
                    {(() => {
                      const inn = details.innings[safeInningsIdx];
                      const rawExtras = inn?.extras || "";
                      // Parse extras into structured data: "7 (b 1, lb 1, w 3, nb 2, p 0)" → { total: 7, breakdown items }
                      const extrasTotal = rawExtras.match(/^(\d+)/)?.[1] || "0";
                      const extrasBreakdown = rawExtras.match(/\((.+)\)/)?.[1] || "";
                      const extrasItems = extrasBreakdown.split(",").map(s => s.trim()).filter(Boolean);
                      // Parse total: "254-5 (20 Overs, RR: 12.7)" → score, overs, runRate
                      const rawTotal = inn?.total || "";
                      const totalScore = rawTotal.match(/^([0-9\-\/]+)/)?.[1]?.replace("-", "/") || "—";
                      const totalOvers = rawTotal.match(/\(([0-9.]+)/)?.[1] || "";
                      const totalRR = rawTotal.match(/RR:\s*([0-9.]+)/)?.[1] || "";
                      const hasYetToBat = inn?.yetToBat && inn.yetToBat.length > 0;
                      return (
                        <div className={`grid gap-4 ${hasYetToBat ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                          <div className="glass-card rounded-xl p-4 border border-border space-y-3">
                            {/* Extras row */}
                            <div className="flex justify-between items-start text-xs">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">Extras</span>
                              <div className="text-right">
                                <span className="font-mono font-bold text-text-primary">{extrasTotal}</span>
                                {extrasItems.length > 0 && (
                                  <div className="flex flex-wrap justify-end gap-1.5 mt-1">
                                    {extrasItems.map((item, i) => (
                                      <span key={i} className="text-[9px] font-mono text-text-muted bg-overlay-2 px-1.5 py-0.5 rounded">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Total row */}
                            <div className="flex justify-between items-center text-xs pt-2.5 border-t border-border/40">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-sport-cricket">Total</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sport-cricket font-extrabold text-sm">{totalScore}</span>
                                {totalOvers && (
                                  <span className="text-[9px] font-mono text-text-muted bg-overlay-2 px-1.5 py-0.5 rounded">{totalOvers} Ov</span>
                                )}
                                {totalRR && (
                                  <span className="text-[9px] font-mono text-text-muted bg-overlay-2 px-1.5 py-0.5 rounded">RR {totalRR}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {hasYetToBat && (
                            <div className="glass-card rounded-xl p-4 border border-border">
                              <h4 className="text-[9px] font-bold uppercase tracking-wider text-text-muted mb-2">
                                Yet to Bat
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {inn.yetToBat.map((player, pIdx) => (
                                  <span key={pIdx} className="text-[10px] font-medium text-text-dim bg-overlay-2 px-2 py-1 rounded-md">
                                    {player}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Bowling scorecard */}
                    <div className="glass-card rounded-xl border border-border overflow-hidden">
                      <div className="px-4 py-3 bg-overlay/30 border-b border-border">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#b8865e]">
                          {currentTeams.bowlingTeam} Bowling Card
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
                            {details.innings[safeInningsIdx]?.bowlers.map((bw, idx) => (
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
                );
              })()}

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
                  {Object.entries(details.teams).map(([teamName, squad], idx) => {
                    const resolvedShortName = getShortName(teamName);
                    return (
                      <div key={idx} className="glass-card border border-border rounded-xl overflow-hidden">
                        <div className="px-4 py-3 bg-overlay/30 border-b border-border flex items-center gap-3">
                          <img
                            src={getTeamLogo(resolvedShortName)}
                            alt={teamName}
                            className="w-7 h-7 rounded-full bg-overlay-2 shrink-0 object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(resolvedShortName)}&background=1f2937&color=6ba3be&rounded=true&bold=true&size=48`;
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
                    );
                  })}
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
