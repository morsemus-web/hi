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
  venue: string;
  broadcasts: string[];
  score: string;
  extra: string;
  status: string;
  isLive: boolean;
}

const API_URL = "/api/basketball";
const POLL_INTERVAL = 10000;

export default function LiveBasketballClient() {
  const [matches, setMatches] = useState<NBAMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.matches)) {
        setMatches(data.matches);
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

  const liveCount = matches.filter(m => m.isLive).length;

  return (
    <main className="min-h-screen bg-bg text-text-primary relative overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors">
          &larr; Back to ScoreDeck
        </Link>

        <div className="mt-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">NBA Live Scores</h1>
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
            Real-time basketball scores and live updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-border pb-6">
          <div className="flex flex-col items-end gap-1 select-none w-full">
            {lastUpdated && (
              <span className="text-[9px] font-mono text-text-muted/40 uppercase tracking-wider">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>
        )}

        {error && !loading && matches.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center animate-fade-in">
            <p className="text-red-400 text-sm font-light mb-4">{error}</p>
            <button
              onClick={() => { setLoading(true); fetchMatches(); }}
              className="px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] bg-accent/15 text-accent border border-accent/20 rounded-lg hover:bg-accent/25 transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && matches.length === 0 && !error && (
          <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
            <p className="text-text-dim text-sm font-light mb-2">No matches found</p>
            <p className="text-text-muted text-xs font-light">Check back later for live matches.</p>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <div key={match.id} className="glass-card rounded-2xl border border-border/60 p-5 hover:border-accent/30 transition-colors animate-fade-in group">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${match.isLive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-overlay-2 text-text-muted border border-border'}`}>
                    {match.isLive ? 'LIVE' : match.extra || 'Upcoming'}
                  </span>
                  {match.broadcasts && match.broadcasts.length > 0 && (
                    <span className="text-[9px] font-mono uppercase text-accent/80">
                      📺 {match.broadcasts.join(', ')}
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.team1Logo ? (
                        <img src={match.team1Logo} alt={match.team1} className="w-8 h-8 object-contain drop-shadow-md" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-overlay-2" />
                      )}
                      <span className="font-semibold text-lg">{match.team1Full}</span>
                    </div>
                    {match.score !== "Upcoming" && (
                      <span className="font-mono text-2xl font-bold">{match.score.split('-')[0]}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.team2Logo ? (
                        <img src={match.team2Logo} alt={match.team2} className="w-8 h-8 object-contain drop-shadow-md" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-overlay-2" />
                      )}
                      <span className="font-semibold text-lg">{match.team2Full}</span>
                    </div>
                    {match.score !== "Upcoming" && (
                      <span className="font-mono text-2xl font-bold">{match.score.split('-')[1]}</span>
                    )}
                  </div>
                </div>

                {match.venue && (
                  <div className="mt-5 pt-4 border-t border-border/40">
                     <p className="text-[10px] text-text-muted font-light uppercase tracking-widest">
                       📍 {match.venue}
                     </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
