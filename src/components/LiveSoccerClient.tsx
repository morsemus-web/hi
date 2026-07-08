"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";

/* ── Types ── */
interface MatchData {
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  status: string; // "Upcoming" | "Live" | "Finished" | "Postponed"
  time: string; // e.g. "19:45", "42'", "FT", "HT"
  detail_path?: string;
  home_badge?: string;
  away_badge?: string;
}

interface LeagueData {
  league: string;
  matches: MatchData[];
}

interface ApiResponse {
  status: string;
  date: string;
  leagues: LeagueData[];
}

/* ── Helper: Avatar URL ── */
function avatarUrl(name: string) {
  const cleanName = name.replace(/FC|CF|AFC|UD|Real|Club/gi, "").trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=random&color=fff&rounded=true&bold=true&size=48`;
}

function getTeamLogoUrl(name: string, bbcBadgeUrl?: string) {
  if (bbcBadgeUrl && bbcBadgeUrl.trim() !== "" && !bbcBadgeUrl.includes("placeholder-badge")) {
    return bbcBadgeUrl;
  }
  const cleanName = name.replace(/FC|CF|AFC|UD|Real|Club|Atlético|Athletic/gi, "").trim();
  return `https://tse2.mm.bing.net/th?q=${encodeURIComponent(cleanName + " FC logo png")}&w=80&h=80&c=7&rs=1&p=0`;
}

function convertUKToIST(timeStr: string, dateStr: string): string {
  if (!/^\d{1,2}:\d{2}$/.test(timeStr)) return timeStr;
  
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  const d = new Date(`${dateStr}T12:00:00Z`);
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/London', timeZoneName: 'shortOffset' });
  const formatParts = formatter.formatToParts(d);
  const tzPart = formatParts.find(p => p.type === 'timeZoneName')?.value || "";
  
  const isBST = tzPart.includes('+1');
  const offsetHours = isBST ? 4 : 5;
  const offsetMinutes = 30;
  
  let istMinutes = minutes + offsetMinutes;
  let istHours = hours + offsetHours;
  
  if (istMinutes >= 60) {
    istMinutes -= 60;
    istHours += 1;
  }
  if (istHours >= 24) {
    istHours -= 24;
  }
  
  return `${istHours.toString().padStart(2, '0')}:${istMinutes.toString().padStart(2, '0')} IST`;
}

/* ── Constants ── */
const POLL_INTERVAL = 10000; // 10 seconds

export default function LiveSoccerClient() {
  const [leagues, setLeagues] = useState<LeagueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState("all");
  
  // Date selection states (UK / London relative)
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dateTabs, setDateTabs] = useState<{ label: string; dateStr: string }[]>([]);

  // Selected match for the drawer
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);

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

  const fetchScores = useCallback(async (dateStr: string) => {
    if (!dateStr) return;
    try {
      const res = await fetch(`/api/soccer?date=${dateStr}`);
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data: ApiResponse = await res.json();
      if (data.status === "success" && Array.isArray(data.leagues)) {
        const processedLeagues = data.leagues.map((league) => ({
          ...league,
          matches: league.matches.map((match) => ({
            ...match,
            time: convertUKToIST(match.time, dateStr)
          }))
        }));
        setLeagues(processedLeagues);
        setError(null);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load live scores");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch when selectedDate changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    fetchScores(selectedDate);
  }, [selectedDate, fetchScores]);

  // Auto-refresh scores every 10s if the date is "Today"
  useEffect(() => {
    if (!selectedDate) return;
    
    const todayTab = dateTabs.find(tab => tab.label === "Today");
    const isToday = todayTab && todayTab.dateStr === selectedDate;
    
    if (!isToday) return;

    const interval = setInterval(() => {
      fetchScores(selectedDate);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedDate, dateTabs, fetchScores]);

  // Filter leagues and matches based on search query and league filter
  const filteredLeagues = leagues
    .map(leagueBlock => {
      const matches = leagueBlock.matches.filter(match => {
        const matchesSearch = 
          match.home_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
          match.away_team.toLowerCase().includes(searchQuery.toLowerCase()) ||
          leagueBlock.league.toLowerCase().includes(searchQuery.toLowerCase());
          
        return matchesSearch;
      });

      return {
        ...leagueBlock,
        matches
      };
    })
    .filter(leagueBlock => {
      if (leagueBlock.matches.length === 0) return false;
      
      if (selectedLeagueFilter === "all") return true;
      if (selectedLeagueFilter === "pl") return leagueBlock.league.toLowerCase().includes("premier league");
      if (selectedLeagueFilter === "ucl") return leagueBlock.league.toLowerCase().includes("champions league") || leagueBlock.league.toLowerCase().includes("championship");
      if (selectedLeagueFilter === "laliga") return leagueBlock.league.toLowerCase().includes("la liga") || leagueBlock.league.toLowerCase().includes("spanish");
      if (selectedLeagueFilter === "seriea") return leagueBlock.league.toLowerCase().includes("serie a") || leagueBlock.league.toLowerCase().includes("italian");
      
      return true;
    });

  const liveMatchesCount = leagues.reduce((acc, l) => acc + l.matches.filter(m => m.status === "Live").length, 0);

  return (
    <main className="min-h-screen bg-bg text-text-primary relative overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        
        {/* Back Link */}
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
              Live Football
            </h1>
            {liveMatchesCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-red-400">
                  {liveMatchesCount} Live
                </span>
              </span>
            )}
          </div>
          <p className="text-text-dim text-sm font-light leading-relaxed max-w-lg">
            Real-time soccer scores and dynamic stats. Click any fixture to see standings, pitch lineups, H2H, and timeline.
          </p>
        </div>

        {/* English Commentary Beta Banner */}
        <div className="mb-8 p-4 rounded-xl bg-sport-football/5 border border-sport-football/20 flex items-center gap-3 animate-fade-in shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
          <span className="text-xl shrink-0">🎙️</span>
          <div className="min-w-0">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-sport-football">
              English Audio Commentary Beta
            </h4>
            <p className="text-text-muted text-[11px] font-light mt-0.5 leading-relaxed">
              English beta has started on the website for selected matches. Look for matches with active live commentary!
            </p>
          </div>
          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-sport-football/20 text-sport-football border border-sport-football/30 shrink-0 font-mono">
            BETA LIVE
          </span>
        </div>

        {/* Date Tabs */}
        <div className="flex border-b border-border mb-8">
          {dateTabs.map(tab => (
            <button
              key={tab.dateStr}
              onClick={() => setSelectedDate(tab.dateStr)}
              className={`px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                selectedDate === tab.dateStr
                  ? "border-sport-football text-sport-football"
                  : "border-transparent text-text-muted hover:text-text-dim"
              }`}
            >
              {tab.label}
              <span className="block text-[9px] font-normal font-mono opacity-50 mt-0.5">
                {tab.dateStr}
              </span>
            </button>
          ))}
        </div>

        {/* Controls: Search + League Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* League pills */}
          <div className="flex flex-wrap gap-2 order-2 md:order-1">
            {[
              { key: "all", label: "All Leagues" },
              { key: "pl", label: "Premier League" },
              { key: "laliga", label: "La Liga" },
              { key: "seriea", label: "Serie A" },
              { key: "ucl", label: "Europe/Cup" },
            ].map(pill => (
              <button
                key={pill.key}
                onClick={() => setSelectedLeagueFilter(pill.key)}
                className={`px-4 py-2 rounded-lg text-[10px] font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                  selectedLeagueFilter === pill.key
                    ? "bg-sport-football/15 border-sport-football/30 text-sport-football"
                    : "border-border text-text-muted/60 hover:border-border-hover hover:text-text-dim"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative order-1 md:order-2 max-w-xs w-full">
            <input
              type="text"
              placeholder="Search team or league..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-overlay border border-border focus:border-sport-football/40 text-xs px-4 py-2.5 rounded-lg outline-none transition-all placeholder:text-text-muted/40 text-text-primary"
            />
          </div>
        </div>

        {/* Loading state - Glassmorphic Skeletal Loader */}
        {loading && (
          <div className="space-y-10 animate-pulse">
            {[1, 2].map((leagueIdx) => (
              <div key={leagueIdx} className="space-y-4">
                {/* League Heading Skeleton */}
                <div className="flex items-center gap-3 border-b border-border/60 pb-2">
                  <div className="h-6 w-48 bg-overlay border border-border rounded-lg" />
                  <div className="h-4 w-16 bg-overlay border border-border rounded-lg" />
                </div>

                {/* Match Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((matchIdx) => (
                    <div 
                      key={matchIdx} 
                      className="glass-card rounded-xl overflow-hidden border border-border flex flex-col justify-between"
                    >
                      {/* Header section skeleton */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-overlay/30">
                        <div className="h-3 w-16 bg-overlay border border-border/40 rounded" />
                        <div className="h-3.5 w-10 bg-overlay border border-border/40 rounded" />
                      </div>

                      {/* Main Teams & Scores Grid skeleton */}
                      <div className="px-5 py-5 flex items-center justify-between gap-4">
                        {/* Home Team skeleton */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-[34px] h-[34px] rounded-full bg-overlay-2 border border-border flex-shrink-0" />
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="h-3 w-20 bg-overlay border border-border rounded" />
                            <div className="h-2 w-10 bg-overlay border border-border rounded opacity-60" />
                          </div>
                        </div>

                        {/* Match Center: VS skeleton */}
                        <div className="flex-shrink-0 text-center px-4">
                          <div className="h-7 w-12 bg-overlay/50 border border-border rounded-lg" />
                        </div>

                        {/* Away Team skeleton */}
                        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
                          <div className="space-y-1.5 flex-1 min-w-0 flex flex-col items-end">
                            <div className="h-3 w-20 bg-overlay border border-border rounded" />
                            <div className="h-2 w-10 bg-overlay border border-border rounded opacity-60" />
                          </div>
                          <div className="w-[34px] h-[34px] rounded-full bg-overlay-2 border border-border flex-shrink-0" />
                        </div>
                      </div>

                      {/* Bottom Hint skeleton */}
                      <div className="px-5 py-2 border-t border-border/20 bg-overlay-2/10 flex justify-center">
                        <div className="h-2.5 w-28 bg-overlay border border-border/40 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="glass-card rounded-xl p-8 text-center border border-sport-f1/20">
            <p className="text-sport-f1 text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchScores(selectedDate); }}
              className="px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] bg-sport-football/15 text-sport-football border border-sport-football/20 rounded-lg hover:bg-sport-football/25 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredLeagues.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">⚽</div>
            <p className="text-text-dim text-sm font-light mb-2">No football matches found</p>
            <p className="text-text-muted text-xs font-light">
              {searchQuery || selectedLeagueFilter !== "all" 
                ? "Try adjusting your search filters." 
                : "There are no matches scheduled for this date."}
            </p>
          </div>
        )}

        {/* Content: League Blocks */}
        {!loading && !error && filteredLeagues.length > 0 && (
          <div className="space-y-10">
            {filteredLeagues.map(leagueBlock => (
              <div key={leagueBlock.league} className="space-y-4">
                {/* League Heading */}
                <div className="flex items-center gap-3 border-b border-border/60 pb-2">
                  <span className="text-lg font-bold tracking-tight text-text-primary">
                    {leagueBlock.league}
                  </span>
                  <span className="text-[10px] font-mono bg-overlay border border-border px-2 py-0.5 rounded text-text-muted">
                    {leagueBlock.matches.length} fixtures
                  </span>
                </div>

                {/* Match Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leagueBlock.matches.map((match, i) => (
                    <MatchCard 
                      key={`${match.home_team}-${match.away_team}-${i}`} 
                      match={match} 
                      onSelect={(m) => setSelectedMatch(m)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-20 text-center">
          <p className="text-text-muted/30 text-[10px] font-light tracking-wider uppercase">
            Powered by ScoreDeck Live Soccer Scraper
          </p>
        </div>

      </div>

      {/* Slide Drawer Side Overlay */}
      {selectedMatch && (
        <MatchDetailsDrawer 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}
    </main>
  );
}

/* ── Match Card Component ── */
function MatchCard({ match, onSelect }: { match: MatchData; onSelect: (m: MatchData) => void }) {
  const isLive = match.status === "Live";
  const isFinished = match.status === "Finished";
  
  return (
    <div
      onClick={() => {
        if (match.detail_path) {
          onSelect(match);
        }
      }}
      className={`glass-card rounded-xl overflow-hidden transition-all duration-300 border flex flex-col justify-between ${
        match.detail_path 
          ? "cursor-pointer hover:scale-[1.01] hover:shadow-[0_4px_25px_rgba(0,0,0,0.15)] hover:bg-overlay-5" 
          : ""
      } ${
        isLive 
          ? "border-sport-football/20 shadow-[0_0_20px_rgba(184,134,94,0.03)]" 
          : "border-border hover:border-border-hover"
      }`}
    >
      {/* Header section (Status / Time) */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-overlay/30">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-text-muted">
          {match.status}
        </span>
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold font-mono text-red-400">
                {match.time}
              </span>
            </>
          ) : (
            <span className={`text-[10px] font-mono font-medium ${isFinished ? "text-text-muted" : "text-sport-football"}`}>
              {match.time}
            </span>
          )}
        </div>
      </div>

      {/* Main Teams & Scores Grid */}
      <div className="px-5 py-5 flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={getTeamLogoUrl(match.home_team, match.home_badge)}
            alt={match.home_team}
            width={34}
            height={34}
            className="rounded-full ring-1 ring-border flex-shrink-0 bg-overlay-2 object-contain p-0.5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = avatarUrl(match.home_team);
            }}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
              {match.home_team}
            </p>
            <p className="text-[9px] text-text-muted/60 font-light truncate">
              Home
            </p>
          </div>
        </div>

        {/* Match Center: Score or VS */}
        <div className="flex-shrink-0 text-center px-4">
          {match.home_score !== "" && match.away_score !== "" ? (
            <div className="flex items-center gap-1 bg-overlay/50 border border-border px-3 py-1.5 rounded-lg font-mono">
              <span className={`text-base font-extrabold ${isLive ? "text-sport-football" : "text-text-primary"}`}>
                {match.home_score}
              </span>
              <span className="text-text-muted/30 text-xs px-0.5">:</span>
              <span className={`text-base font-extrabold ${isLive ? "text-sport-football" : "text-text-primary"}`}>
                {match.away_score}
              </span>
            </div>
          ) : (
            <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted/40 border border-border/40 px-2.5 py-1 rounded-md">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-3 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-text-primary truncate">
              {match.away_team}
            </p>
            <p className="text-[9px] text-text-muted/60 font-light truncate">
              Away
            </p>
          </div>
          <img
            src={getTeamLogoUrl(match.away_team, match.away_badge)}
            alt={match.away_team}
            width={34}
            height={34}
            className="rounded-full ring-1 ring-border flex-shrink-0 bg-overlay-2 object-contain p-0.5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = avatarUrl(match.away_team);
            }}
          />
        </div>
      </div>

      {/* Bottom Hint */}
      {match.detail_path && (
        <div className="px-5 py-2 border-t border-border/20 text-center bg-overlay-2/10">
          <p className="text-[8px] uppercase tracking-widest text-text-muted/40 font-mono group-hover:text-sport-football transition-colors">
            Click for lineups & stats &rarr;
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Match Details Side Drawer Component ── */
function MatchDetailsDrawer({ match, onClose }: { match: MatchData; onClose: () => void }) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"summary" | "stats" | "lineup" | "h2h" | "standings">("summary");
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

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

  // Fetch details
  useEffect(() => {
    if (!match.detail_path) return;
    
    let isMounted = true;
    setLoading(true);
    setError(null);
    setDetails(null);
    setActiveTab("summary");
    setSelectedStageIdx(0);

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/soccer/details?path=${encodeURIComponent(match.detail_path!)}`);
        if (!res.ok) throw new Error(`Details fetch failed: ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          if (data.status === "success") {
            setDetails(data);
          } else {
            throw new Error(data.error || "Failed to load match details.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load match details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [match]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-[550px] h-full bg-surface-2 border-l border-border flex flex-col shadow-2xl animate-slide-in-right z-10">
        
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border/80 bg-surface flex flex-col justify-between relative">
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
          <span className="text-[9px] font-bold uppercase tracking-widest text-sport-football bg-sport-football/10 border border-sport-football/20 px-2 py-0.5 rounded w-max mb-3 font-mono">
            {details?.tournament_name || "Football Match Center"}
          </span>

          {/* Match Score Display */}
          <div className="grid grid-cols-7 items-center gap-2 mt-2">
            {/* Home Team */}
            <div className="col-span-3 flex flex-col items-center text-center min-w-0">
              <img
                src={getTeamLogoUrl(match.home_team, match.home_badge)}
                alt={match.home_team}
                width={44}
                height={44}
                className="rounded-full ring-2 ring-border bg-overlay object-contain p-1 mb-2 sm:w-[48px] sm:h-[48px]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = avatarUrl(match.home_team);
                }}
              />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-text-primary leading-tight truncate max-w-full">
                {match.home_team}
              </span>
              {details?.ranks?.home?.rank && (
                <span className="text-[8px] text-text-muted mt-0.5 font-mono">
                  Rank {details.ranks.home.ordinalRank || `${details.ranks.home.rank}`}
                </span>
              )}
            </div>

            {/* Score */}
            <div className="col-span-1 text-center flex flex-col items-center justify-center">
              {match.home_score !== "" && match.away_score !== "" ? (
                <div className="text-xl sm:text-2xl font-mono font-black text-text-primary bg-overlay-2 border border-border rounded-lg py-1 px-2.5 sm:px-3 shadow-inner">
                  {match.home_score} - {match.away_score}
                </div>
              ) : (
                <div className="text-[9px] sm:text-xs font-extrabold tracking-widest text-text-muted border border-border/40 py-1 px-2 rounded bg-overlay-2">
                  VS
                </div>
              )}
              <span className="text-[8px] font-mono uppercase text-sport-football font-bold mt-1.5 tracking-wider animate-pulse">
                {match.time}
              </span>
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex flex-col items-center text-center min-w-0">
              <img
                src={getTeamLogoUrl(match.away_team, match.away_badge)}
                alt={match.away_team}
                width={44}
                height={44}
                className="rounded-full ring-2 ring-border bg-overlay object-contain p-1 mb-2 sm:w-[48px] sm:h-[48px]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = avatarUrl(match.away_team);
                }}
              />
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-text-primary leading-tight truncate max-w-full">
                {match.away_team}
              </span>
              {details?.ranks?.away?.rank && (
                <span className="text-[8px] text-text-muted mt-0.5 font-mono">
                  Rank {details.ranks.away.ordinalRank || `${details.ranks.away.rank}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Tabs list */}
        <div className="flex border-b border-border bg-surface px-2 sm:px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { key: "summary", label: "Timeline" },
            { key: "stats", label: "Stats" },
            { key: "lineup", label: "Lineups" },
            { key: "h2h", label: "H2H & Form" },
            { key: "standings", label: "League Standings" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 sm:px-4 py-3 border-b-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "border-sport-football text-sport-football"
                  : "border-transparent text-text-muted hover:text-text-dim"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 custom-scrollbar">
          {loading && (
            <div className="space-y-6">
              {/* TIMELINE TAB SKELETON */}
              {activeTab === "summary" && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 w-36 bg-overlay border border-border rounded" />
                  <div className="relative pl-6 py-2 space-y-5">
                    {/* Vertical line */}
                    <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border/40" />
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="relative pl-6 flex items-start">
                        {/* Circle marker */}
                        <div className="absolute left-[-15px] top-1.5 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center animate-none" />
                        {/* Event card */}
                        <div className="w-full bg-overlay border border-border p-3.5 rounded-xl flex items-center justify-between gap-3">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-8 bg-overlay-2 border border-border/40 rounded" />
                              <div className="h-3.5 w-12 bg-overlay-2 border border-border/40 rounded" />
                            </div>
                            <div className="h-3.5 w-24 bg-overlay-2 border border-border/40 rounded" />
                          </div>
                          <div className="h-3 w-16 bg-overlay-2 border border-border/40 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STATS TAB SKELETON */}
              {activeTab === "stats" && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 w-40 bg-overlay border border-border rounded" />
                  <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div key={idx} className="space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="h-3 w-6 bg-overlay border border-border rounded" />
                          <div className="h-3 w-28 bg-overlay border border-border rounded" />
                          <div className="h-3 w-6 bg-overlay border border-border rounded" />
                        </div>
                        {/* Bar */}
                        <div className="h-2.5 rounded-full bg-overlay border border-border overflow-hidden flex">
                          <div className="h-full bg-overlay-2/60 w-[45%]" />
                          <div className="h-full bg-overlay-2/60 w-[55%] ml-auto" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LINEUPS TAB SKELETON */}
              {activeTab === "lineup" && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 w-44 bg-overlay border border-border rounded" />
                  <div className="space-y-8">
                    {[1, 2].map((teamIdx) => (
                      <div key={teamIdx} className="space-y-3">
                        <div className="flex justify-between items-center bg-overlay border border-border px-4 py-2.5 rounded-lg">
                          <div className="h-3.5 w-24 bg-overlay-2 border border-border/40 rounded" />
                          <div className="h-4 w-12 bg-overlay-2 border border-border/40 rounded" />
                        </div>
                        {/* Pitch mockup */}
                        <div className="relative w-full aspect-[4/3.2] max-w-[420px] mx-auto bg-gradient-to-b from-emerald-950/40 to-emerald-950/65 rounded-xl border border-emerald-500/10 p-4 flex flex-col justify-between">
                          {[1, 2, 3, 4].map((rowIdx) => (
                            <div key={rowIdx} className="flex justify-around items-center w-full">
                              {Array.from({ length: rowIdx === 1 ? 1 : rowIdx === 2 ? 4 : rowIdx === 3 ? 3 : 3 }).map((_, pIdx) => (
                                <div key={pIdx} className="flex flex-col items-center">
                                  <div className="w-8 h-8 rounded-full bg-emerald-900/30 border border-emerald-500/20 shadow" />
                                  <div className="h-2.5 w-10 bg-emerald-900/20 border border-emerald-500/10 rounded mt-1.5" />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* H2H TAB SKELETON */}
              {activeTab === "h2h" && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 w-36 bg-overlay border border-border rounded" />
                  {/* Ratio cards */}
                  <div className="grid grid-cols-3 gap-3 text-center bg-overlay border border-border rounded-xl p-4">
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="h-2.5 w-12 bg-overlay-2 border border-border/40 rounded mx-auto" />
                        <div className="h-6 w-6 bg-overlay-2 border border-border/40 rounded mx-auto" />
                        <div className="h-2 w-8 bg-overlay-2 border border-border/40 rounded mx-auto" />
                      </div>
                    ))}
                  </div>
                  {/* Five meetings */}
                  <div className="space-y-3">
                    <div className="h-3 w-24 bg-overlay border border-border rounded" />
                    {[1, 2, 3].map((idx) => (
                      <div key={idx} className="bg-overlay border border-border/60 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="h-2.5 w-16 bg-overlay-2 border border-border/40 rounded" />
                          <div className="h-3 w-20 bg-overlay-2 border border-border/40 rounded" />
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="h-3 w-24 bg-overlay-2 border border-border/40 rounded" />
                          <div className="h-4 w-10 bg-overlay-2 border border-border/40 rounded" />
                          <div className="h-3 w-24 bg-overlay-2 border border-border/40 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STANDINGS TAB SKELETON */}
              {activeTab === "standings" && (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 w-40 bg-overlay border border-border rounded" />
                  <div className="border border-border rounded-xl overflow-hidden">
                    <div className="bg-overlay border-b border-border py-2.5 px-3 flex justify-between">
                      <div className="h-3 w-6 bg-overlay-2 border border-border/40 rounded" />
                      <div className="h-3 w-24 bg-overlay-2 border border-border/40 rounded" />
                      <div className="h-3 w-6 bg-overlay-2 border border-border/40 rounded" />
                      <div className="h-3 w-8 bg-overlay-2 border border-border/40 rounded" />
                      <div className="h-3 w-8 bg-overlay-2 border border-border/40 rounded" />
                    </div>
                    <div className="divide-y divide-border/40 bg-surface">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div key={idx} className="py-3 px-3 flex justify-between items-center">
                          <div className="h-3 w-4 bg-overlay border border-border rounded" />
                          <div className="h-3.5 w-24 bg-overlay border border-border rounded" />
                          <div className="h-3 w-4 bg-overlay border border-border rounded" />
                          <div className="h-3 w-4 bg-overlay border border-border rounded" />
                          <div className="h-3.5 w-6 bg-overlay border border-border rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="py-12 text-center bg-red-500/5 border border-red-500/10 rounded-xl px-4">
              <span className="text-2xl mb-2 block">⚠️</span>
              <p className="text-xs text-red-400 font-light mb-4">{error}</p>
              <p className="text-[10px] text-text-muted">Match statistics, lineups, or historical H2H are not currently hydrated for this match block.</p>
            </div>
          )}

          {!loading && !error && details && (
            <div className="space-y-6">
              
              {/* TIMELINE TAB */}
              {activeTab === "summary" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-border/40 pb-2">
                    Match Events Timeline
                  </h3>

                  {(!details.events?.home || details.events.home.length === 0) &&
                   (!details.events?.away || details.events.away.length === 0) ? (
                    <div className="text-center py-12 bg-overlay-2 border border-border/40 rounded-xl">
                      <p className="text-xs text-text-muted">No goals or bookings reported yet.</p>
                    </div>
                  ) : (
                    <div className="relative pl-6 py-2 space-y-4">
                      {/* Vertical Timeline Line */}
                      <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-border/40" />

                      {/* Timeline Events */}
                      {/* Merge and sort home + away events */}
                      {[
                        ...details.events.home.map((e: any) => ({ ...e, isHome: true })),
                        ...details.events.away.map((e: any) => ({ ...e, isHome: false })),
                      ]
                        .sort((a, b) => {
                          const getMin = (t: string) => parseInt(t.replace(/\+/g, "").replace(/'/g, "")) || 0;
                          return getMin(a.time) - getMin(b.time);
                        })
                        .map((evt, idx) => {
                          const icon = evt.type.toLowerCase().includes("goal") 
                            ? "⚽" 
                            : evt.type.toLowerCase().includes("red") 
                            ? "🟥" 
                            : evt.type.toLowerCase().includes("yellow")
                            ? "🟨"
                            : evt.type.toLowerCase().includes("sub")
                            ? "🔄"
                            : "🟨";

                          return (
                            <div key={idx} className="relative pl-6 flex items-start">
                              {/* Event marker on the timeline line */}
                              <div className="absolute left-[-15px] top-1.5 w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] z-10">
                                <span className="absolute -translate-y-[0.5px]">{icon}</span>
                              </div>

                              {/* Event card content - responsive & full-width */}
                              <div className={`w-full bg-overlay border p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm ${
                                evt.isHome 
                                  ? "border-l-2 border-l-sport-football border-border/50" 
                                  : "border-l-2 border-l-accent border-border/50"
                              }`}>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black font-mono text-text-primary">
                                      {evt.time}
                                    </span>
                                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                                      evt.isHome 
                                        ? "bg-sport-football/10 text-sport-football" 
                                        : "bg-accent/10 text-accent"
                                    }`}>
                                      {evt.isHome ? "Home" : "Away"}
                                    </span>
                                  </div>
                                  <p className="text-xs font-bold text-text-dim mt-1 truncate">
                                    {evt.player}
                                  </p>
                                </div>
                                <div className="text-[10px] font-bold text-text-muted font-mono uppercase shrink-0">
                                  {evt.type}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* STATS TAB */}
              {activeTab === "stats" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-border/40 pb-2">
                    Performance Statistics
                  </h3>

                  {(!details.stats?.home || Object.keys(details.stats.home).length === 0) ? (
                    <div className="text-center py-12 bg-overlay-2 border border-border/40 rounded-xl">
                      <p className="text-xs text-text-muted">Statistics are not available for this fixture.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {[
                        { key: "possessionPercentage", label: "Possession (%)", format: (v: number) => `${v}%` },
                        { key: "shotsTotal", label: "Total Shots", format: (v: number) => `${v}` },
                        { key: "shotsOnTarget", label: "Shots On Target", format: (v: number) => `${v}` },
                        { key: "cornersWon", label: "Corners", format: (v: number) => `${v}` },
                        { key: "foulsCommitted", label: "Fouls", format: (v: number) => `${v}` },
                      ].map(stat => {
                        const hVal = details.stats.home[stat.key] ?? 0;
                        const aVal = details.stats.away[stat.key] ?? 0;
                        const total = hVal + aVal || 1;
                        const hPct = (hVal / total) * 100;
                        const aPct = (aVal / total) * 100;

                        return (
                          <div key={stat.key} className="space-y-2">
                            {/* Stat Labels */}
                            <div className="flex justify-between items-center text-xs font-semibold text-text-primary">
                              <span className="w-10 font-mono font-black">{stat.format(hVal)}</span>
                              <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">
                                {stat.label}
                              </span>
                              <span className="w-10 text-right font-mono font-black">{stat.format(aVal)}</span>
                            </div>

                            {/* comparative Progress Bar */}
                            <div className="h-2.5 rounded-full overflow-hidden flex bg-border/40">
                              {/* Home bar */}
                              <div 
                                style={{ width: `${hPct}%` }}
                                className="h-full bg-sport-football transition-all duration-500 rounded-l-full border-r border-background/20"
                              />
                              {/* Away bar */}
                              <div 
                                style={{ width: `${aPct}%` }}
                                className="h-full bg-accent transition-all duration-500 rounded-r-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* LINEUPS TAB */}
              {activeTab === "lineup" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-border/40 pb-2">
                    Starting Squad Formations
                  </h3>

                  {(!details.lineups?.home?.pitch || details.lineups.home.pitch.length === 0) &&
                   (!details.lineups?.away?.pitch || details.lineups.away.pitch.length === 0) ? (
                    <div className="text-center py-12 bg-overlay-2 border border-border/40 rounded-xl">
                      <p className="text-xs text-text-muted">Starting lineups are not reported yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Home Team Formation Pitch */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-overlay border border-border px-4 py-2 rounded-lg">
                          <span className="text-xs font-extrabold uppercase text-text-primary">{match.home_team}</span>
                          <span className="text-[10px] font-mono font-black uppercase text-sport-football bg-sport-football/10 px-2 py-0.5 rounded border border-sport-football/20">
                            {details.lineups.home.formation}
                          </span>
                        </div>
                        <PitchLayout lineup={details.lineups.home} />
                      </div>

                      {/* Away Team Formation Pitch */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-overlay border border-border px-4 py-2 rounded-lg">
                          <span className="text-xs font-extrabold uppercase text-text-primary">{match.away_team}</span>
                          <span className="text-[10px] font-mono font-black uppercase text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                            {details.lineups.away.formation}
                          </span>
                        </div>
                        <PitchLayout lineup={details.lineups.away} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* H2H TAB */}
              {activeTab === "h2h" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-border/40 pb-2">
                    Head to Head History
                  </h3>

                  {/* Summary card ratios */}
                  {details.h2h?.summary && details.h2h.summary.total > 0 && (
                    <div className="grid grid-cols-3 gap-3 text-center bg-overlay border border-border rounded-xl p-4 shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-text-muted">Home Wins</p>
                        <p className="text-lg font-black font-mono text-sport-football">{details.h2h.summary.home_wins}</p>
                        <p className="text-[8px] text-text-muted/60 font-mono">
                          {((details.h2h.summary.home_wins / details.h2h.summary.total) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="space-y-1 border-x border-border/60">
                        <p className="text-[9px] uppercase tracking-wider text-text-muted">Draws</p>
                        <p className="text-lg font-black font-mono text-text-primary">{details.h2h.summary.draws}</p>
                        <p className="text-[8px] text-text-muted/60 font-mono">
                          {((details.h2h.summary.draws / details.h2h.summary.total) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-text-muted">Away Wins</p>
                        <p className="text-lg font-black font-mono text-accent">{details.h2h.summary.away_wins}</p>
                        <p className="text-[8px] text-text-muted/60 font-mono">
                          {((details.h2h.summary.away_wins / details.h2h.summary.total) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Last 5 Meetings */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                      Last 5 Meetings
                    </h4>

                    {!details.h2h?.last_five || details.h2h.last_five.length === 0 ? (
                      <div className="text-center py-8 bg-overlay-2 border border-border/40 rounded-xl">
                        <p className="text-xs text-text-muted">No head-to-head records found.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {details.h2h.last_five.map((meet: any, mIdx: number) => {
                          const homeScoreVal = parseInt(meet.home_score) || 0;
                          const awayScoreVal = parseInt(meet.away_score) || 0;
                          
                          return (
                            <div key={mIdx} className="bg-overlay border border-border/60 rounded-xl p-3.5 shadow-sm space-y-2">
                              {/* Meta information */}
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-mono text-text-muted">{meet.date}</span>
                                <span className="text-[8px] uppercase tracking-wider text-sport-football bg-sport-football/5 px-2 py-0.5 rounded font-mono border border-sport-football/10">
                                  {meet.tournament}
                                </span>
                              </div>

                              {/* Teams score row */}
                              <div className="flex justify-between items-center text-xs font-semibold">
                                <span className={`uppercase tracking-wide w-[40%] truncate ${homeScoreVal > awayScoreVal ? "text-text-primary font-black" : "text-text-dim"}`}>
                                  {meet.home_team}
                                </span>
                                
                                <span className="font-mono font-black text-center bg-overlay-2 border border-border px-2.5 py-0.5 rounded text-[11px] w-[50px] shadow-inner shrink-0">
                                  {meet.home_score} : {meet.away_score}
                                </span>

                                <span className={`uppercase tracking-wide w-[40%] text-right truncate ${awayScoreVal > homeScoreVal ? "text-text-primary font-black" : "text-text-dim"}`}>
                                  {meet.away_team}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STANDINGS TAB */}
              {activeTab === "standings" && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-muted border-b border-border/40 pb-2">
                    League Standings Table
                  </h3>

                  {!details.standings || details.standings.length === 0 ? (
                    <div className="text-center py-12 bg-overlay-2 border border-border/40 rounded-xl">
                      <p className="text-xs text-text-muted">League tables are not hydrated for this fixture cup block.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Standings Stage selector tabs (if multiple exist) */}
                      {details.standings.length > 1 && (
                        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
                          {details.standings.map((stage: any, sIdx: number) => (
                            <button
                              key={sIdx}
                              onClick={() => setSelectedStageIdx(sIdx)}
                              className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${
                                selectedStageIdx === sIdx
                                  ? "bg-sport-football/15 border-sport-football/30 text-sport-football"
                                  : "border-border text-text-muted hover:text-text-dim"
                              }`}
                            >
                              {stage.stage_name}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Standings Table Rendering */}
                      {details.standings[selectedStageIdx] && (
                        <div className="border border-border rounded-xl overflow-hidden shadow-inner">
                          <table className="w-full text-left border-collapse text-[10px]">
                            <thead>
                              <tr className="bg-overlay border-b border-border text-[9px] uppercase font-bold text-text-muted tracking-wider">
                                <th className="py-2.5 px-3 text-center w-8">#</th>
                                <th className="py-2.5 px-2">Team</th>
                                <th className="py-2.5 px-2 text-center">P</th>
                                <th className="py-2.5 px-2 text-center">GD</th>
                                <th className="py-2.5 px-3 text-center">PTS</th>
                                <th className="py-2.5 px-3 text-center hidden sm:table-cell">Form</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 bg-surface">
                              {details.standings[selectedStageIdx].teams.map((t: any) => {
                                const isCurrentHome = t.name.toLowerCase().includes(match.home_team.toLowerCase()) || 
                                                     match.home_team.toLowerCase().includes(t.name.toLowerCase());
                                const isCurrentAway = t.name.toLowerCase().includes(match.away_team.toLowerCase()) || 
                                                     match.away_team.toLowerCase().includes(t.name.toLowerCase());
                                const isCurrentTeam = isCurrentHome || isCurrentAway;

                                // Qualification / Relegation left zone borders
                                let zoneBorderColor = "";
                                if (t.rank_status.toLowerCase().includes("champions league") || t.rank_status.toLowerCase().includes("stage")) {
                                  zoneBorderColor = "border-l-2 border-l-emerald-500";
                                } else if (t.rank_status.toLowerCase().includes("relegation") || t.rank_status.toLowerCase().includes("lower")) {
                                  zoneBorderColor = "border-l-2 border-l-red-500";
                                } else if (t.rank_status.toLowerCase().includes("europa league") || t.rank_status.toLowerCase().includes("conference")) {
                                  zoneBorderColor = "border-l-2 border-l-blue-400";
                                }

                                return (
                                  <tr 
                                    key={t.rank}
                                    className={`transition-colors ${
                                      isCurrentTeam 
                                        ? "bg-sport-football/5 border-y border-sport-football/20 text-sport-football font-black" 
                                        : "hover:bg-overlay-2/30"
                                    }`}
                                  >
                                    {/* Rank */}
                                    <td className={`py-3 px-3 text-center font-mono font-bold text-text-muted ${zoneBorderColor}`}>
                                      {t.rank}
                                    </td>
                                    
                                    {/* Team Name */}
                                    <td className="py-3 px-2 font-bold max-w-[80px] sm:max-w-[150px] truncate uppercase tracking-wide">
                                      {t.name}
                                    </td>
                                    
                                    {/* Played */}
                                    <td className="py-3 px-2 text-center font-mono text-text-dim">
                                      {t.played}
                                    </td>
                                    
                                    {/* Goal Difference */}
                                    <td className="py-3 px-2 text-center font-mono text-text-muted">
                                      {t.goal_diff > 0 ? `+${t.goal_diff}` : t.goal_diff}
                                    </td>
                                    
                                    {/* Points */}
                                    <td className="py-3 px-3 text-center font-mono text-text-primary font-black bg-overlay-2/40">
                                      {t.points}
                                    </td>
                                    
                                    {/* Form Guide */}
                                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                                      <div className="flex items-center justify-center gap-1">
                                        {(t.form || []).slice(-5).map((f: string, fIdx: number) => {
                                          const formStyle = f === "W" 
                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                            : f === "L" 
                                            ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                            : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20";
                                          return (
                                            <span 
                                              key={fIdx} 
                                              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black font-mono shadow-sm shrink-0 ${formStyle}`}
                                            >
                                              {f}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── starting Squad pitch Layout Component ── */
function PitchLayout({ lineup }: { lineup: any }) {
  if (!lineup || !lineup.pitch || lineup.pitch.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-overlay-2 rounded-xl border border-border/40">
        <p className="text-[10px] uppercase font-mono tracking-wider text-text-muted">Lineup graphic not available.</p>
      </div>
    );
  }

  // Goalkeeper (row 0 in pitch) should render at the bottom of the field.
  // Reversing lineup.pitch so rows render GK (bottom) to STRIKER (top) vertically.
  const reversedRows = [...lineup.pitch].reverse();

  return (
    <div className="space-y-4">
      {/* Tactical pitch visualization */}
      <div className="relative w-full aspect-[4/3.2] max-w-[420px] mx-auto bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-xl overflow-hidden shadow-inner border border-emerald-500/25 p-4 flex flex-col justify-between select-none">
        
        {/* Grass Pattern stripes */}
        <div className="absolute inset-0 flex flex-col pointer-events-none opacity-[0.03]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`flex-1 w-full ${i % 2 === 0 ? "bg-white" : "bg-transparent"}`} />
          ))}
        </div>

        {/* Pitch white lines */}
        <div className="absolute inset-2 border border-white/10 rounded-lg pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-2 right-2 border-t border-white/10 pointer-events-none" />
        
        {/* Penalty areas */}
        <div className="absolute top-2 left-1/4 right-1/4 h-12 border-b border-x border-white/10 pointer-events-none" />
        <div className="absolute bottom-2 left-1/4 right-1/4 h-12 border-t border-x border-white/10 pointer-events-none" />
        
        {/* Render rows vertically */}
        {reversedRows.map((row: any[], rIdx: number) => (
          <div key={rIdx} className="flex justify-around items-center w-full z-10">
            {(row || []).map((player: any, pIdx: number) => (
              <div key={pIdx} className="flex flex-col items-center group relative cursor-help shrink-0">
                {/* Player Shirt representation */}
                <div className="w-8 h-8 rounded-full bg-sport-football border-2 border-white/95 flex items-center justify-center font-bold text-[10px] text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-transform duration-200">
                  {player.shirt_number}
                </div>
                {/* Player short name */}
                <span className="text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded mt-1.5 max-w-[80px] truncate text-center shadow border border-white/5">
                  {player.name}
                </span>

                {/* Tactical details popup on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-[9px] text-emerald-300 font-mono py-1.5 px-2.5 rounded whitespace-nowrap shadow-2xl z-50 border border-border">
                  {player.accessible_text || player.position || player.name}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Substitutes grid listing below pitch */}
      {lineup.substitutes && lineup.substitutes.length > 0 && (
        <div className="space-y-2 mt-4 bg-overlay border border-border p-4 rounded-xl">
          <h4 className="text-[9px] font-black uppercase tracking-wider text-text-muted">
            Substitutes Bench
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {lineup.substitutes.map((sub: any, sIdx: number) => (
              <div key={sIdx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-overlay-2 border border-border/40 text-[9px]">
                <span className="font-mono font-black text-sport-football w-4 text-center shrink-0">
                  {sub.shirt_number}
                </span>
                <span className="text-text-primary font-bold truncate max-w-[120px]">
                  {sub.name}
                </span>
                <span className="text-[8px] text-text-muted/60 ml-auto uppercase font-mono font-bold">
                  {sub.position}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
