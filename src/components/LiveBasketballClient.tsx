"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";

interface NBAMatch {
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
}

const API_URL = "/api/basketball";
const POLL_INTERVAL = 15000;

function dateForOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

function labelForOffset(off: number): string {
  if (off === 0) return "Today";
  if (off === -1) return "Yesterday";
  if (off === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + off);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function tipoff(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function LiveBasketballClient() {
  const [matches, setMatches] = useState<NBAMatch[]>([]);
  const [note, setNote] = useState("");
  const [dayOffset, setDayOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?date=${dateForOffset(dayOffset)}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.matches)) {
        setMatches(data.matches);
        setNote(data.note ?? "");
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scores");
    } finally {
      setLoading(false);
    }
  }, [dayOffset]);

  useEffect(() => {
    setLoading(true);
    fetchMatches();
    // Only poll the live board; past and future days are static.
    if (dayOffset !== 0) return;
    const interval = setInterval(fetchMatches, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMatches, dayOffset]);

  const liveCount = matches.filter((m) => m.isLive).length;

  return (
    <main className="min-h-screen bg-bg text-text-primary relative overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        <div className="mt-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Basketball Live Scores
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
            Real-time NBA scores, quarter by quarter.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-border pb-6">
          <div className="flex items-center gap-1 rounded-full border border-border bg-overlay-1 px-2 py-1">
            <button
              onClick={() => setDayOffset((d) => d - 1)}
              className="px-3 py-1 text-accent hover:text-accent/70 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              &larr;
            </button>
            <button
              onClick={() => setDayOffset(0)}
              className="px-3 py-1 text-xs font-bold text-text-primary min-w-[80px] cursor-pointer"
            >
              {labelForOffset(dayOffset)}
            </button>
            <button
              onClick={() => setDayOffset((d) => d + 1)}
              className="px-3 py-1 text-accent hover:text-accent/70 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              &rarr;
            </button>
          </div>
          {lastUpdated && (
            <span className="text-[9px] font-mono text-text-muted/40 uppercase tracking-wider">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* The NBA has long off-season gaps; say so rather than showing a bare board. */}
        {note === "no_games_on_date_showing_next_slate" && !loading && (
          <div className="mb-6 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
            <p className="text-xs text-accent">
              No games on {labelForOffset(dayOffset).toLowerCase()} — showing the next
              scheduled slate.
            </p>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-2xl border border-border/60 p-5 space-y-4">
                <div className="h-3 w-3/4 rounded bg-overlay-2 animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[26px] h-[26px] rounded-full bg-overlay-2 animate-pulse" />
                    <div className="h-3 w-32 rounded bg-overlay-2 animate-pulse" />
                  </div>
                  <div className="h-4 w-14 rounded bg-overlay-2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !loading && matches.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <p className="text-red-400 text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchMatches();
              }}
              className="px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] bg-accent/15 text-accent border border-accent/20 rounded-lg hover:bg-accent/25 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && matches.length === 0 && !error && (
          <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
            <p className="text-text-dim text-sm font-light mb-2">No games scheduled</p>
            <p className="text-text-muted text-xs font-light">
              The NBA season runs October through June.
            </p>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => {
              const started = match.status !== "pre";
              const awayWon =
                match.status === "post" && Number(match.team1Score) > Number(match.team2Score);
              const homeWon =
                match.status === "post" && Number(match.team2Score) > Number(match.team1Score);

              return (
                <div
                  key={match.id}
                  className="glass-card rounded-2xl border border-border/60 p-5 hover:border-accent/30 transition-colors animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${
                        match.isLive
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : "bg-overlay-2 text-text-muted border border-border"
                      }`}
                    >
                      {match.isLive ? `LIVE · ${match.extra}` : match.extra || "Upcoming"}
                    </span>
                    {match.broadcasts?.length > 0 && (
                      <span className="text-[9px] font-mono uppercase text-accent/80">
                        📺 {match.broadcasts.join(", ")}
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <TeamRow
                      logo={match.team1Logo}
                      name={match.team1Full}
                      record={match.team1Record}
                      score={started ? match.team1Score : ""}
                      won={awayWon}
                    />
                    <TeamRow
                      logo={match.team2Logo}
                      name={match.team2Full}
                      record={match.team2Record}
                      score={started ? match.team2Score : ""}
                      won={homeWon}
                    />
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between gap-3">
                    {match.venue && (
                      <p className="text-[10px] text-text-muted font-light uppercase tracking-widest truncate">
                        📍 {match.venue}
                      </p>
                    )}
                    {!started && match.startTime && (
                      <p className="text-[10px] font-mono text-accent shrink-0">
                        {tipoff(match.startTime)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function TeamRow({
  logo,
  name,
  record,
  score,
  won,
}: {
  logo: string;
  name: string;
  record: string;
  score: string;
  won: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {logo ? (
          <img
            src={logo}
            alt={name}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = "https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/nba.png";
            }}
            className="w-8 h-8 object-contain drop-shadow-md shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-overlay-2 flex items-center justify-center font-bold text-xs text-text-muted shrink-0">
            {name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <span className={`font-semibold text-lg truncate block ${won ? "" : "text-text-dim"}`}>
            {name}
          </span>
          {record && <span className="text-[10px] text-text-muted font-mono">{record}</span>}
        </div>
      </div>
      {score !== "" && (
        <span className={`font-mono text-2xl font-bold shrink-0 ${won ? "text-accent" : ""}`}>
          {score}
        </span>
      )}
    </div>
  );
}
