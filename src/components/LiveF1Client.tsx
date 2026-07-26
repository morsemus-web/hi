"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";

interface DriverStanding {
  position: string;
  name: string;
  code: string;
  number: string;
  points: string;
  wins: string;
  nationality: string;
  constructor: string;
  image: string;
}

interface TeamStanding {
  position: string;
  name: string;
  nationality: string;
  points: string;
  wins: string;
}

interface Session {
  name: string;
  date: string;
  state: "pre" | "in" | "post";
  detail: string;
}

interface Race {
  id: string;
  round: string;
  season: string;
  title: string;
  circuit: string;
  locality: string;
  country: string;
  team1Full: string;
  status: "pre" | "in" | "post";
  isLive: boolean;
  startTime: string;
  extra: string;
  sessions: Session[];
}

interface RaceResult {
  position: string;
  name: string;
  code: string;
  constructor: string;
  time: string;
  points: string;
  grid: string;
  laps: string;
  fastestLap: string;
  image: string;
}

interface Payload {
  season: string;
  standings: DriverStanding[];
  constructorStandings: TeamStanding[];
  lastRace: { round: string; name: string; date: string; results: RaceResult[] } | null;
  matches: Race[];
}

const API_URL = "/api/f1";
const POLL_INTERVAL = 30000;

function fmt(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LiveF1Client() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      if (json.status === "success") {
        setData(json);
        setError(null);
      } else {
        throw new Error(json.error || "F1 feed unavailable");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch F1 data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchData]);

  // matches[0] is the live or next round — not necessarily a finished race, so
  // the winner card reads from lastRace instead.
  const weekend = data?.matches?.[0] ?? null;
  const podium = data?.lastRace?.results?.slice(0, 3) ?? [];

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
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Formula 1 Hub</h1>
            {weekend?.isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-red-400">
                  Live
                </span>
              </span>
            )}
          </div>
          <p className="text-text-dim text-sm font-light leading-relaxed max-w-lg">
            Live session status, results and championship standings for the {data?.season ?? ""}{" "}
            season.
          </p>
        </div>

        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-overlay-2 rounded-2xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-overlay-2 rounded-2xl" />
              <div className="h-64 bg-overlay-2 rounded-2xl" />
            </div>
          </div>
        )}

        {error && !loading && !data && (
          <div className="glass-card rounded-xl p-8 text-center max-w-2xl">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="px-6 py-2 bg-accent/15 text-accent rounded cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-8">
            {/* Race weekend — the whole point of the page during a Grand Prix */}
            {weekend && (
              <div className="glass-card rounded-3xl p-8 border border-border/60">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-2">
                      Round {weekend.round} &middot; {weekend.season}
                    </h2>
                    <h3 className="text-2xl font-bold">{weekend.title}</h3>
                    <p className="text-sm text-text-muted mt-1">
                      {weekend.circuit}
                      {weekend.locality ? ` — ${weekend.locality}, ${weekend.country}` : ""}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-overlay-2 border border-border text-[10px] font-mono uppercase tracking-widest text-text-dim">
                    {weekend.status === "post"
                      ? "Completed"
                      : weekend.isLive
                        ? "Session running"
                        : "Upcoming"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {weekend.sessions?.map((s, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 ${
                        s.state === "in"
                          ? "border-red-500/30 bg-red-500/5"
                          : s.state === "post"
                            ? "border-border/50 bg-overlay-1 opacity-70"
                            : "border-border/60 bg-overlay-1"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {s.name}
                        </span>
                        {s.state === "in" && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted font-mono">{fmt(s.date)}</p>
                      {s.detail && (
                        <p className="text-[11px] text-text-dim mt-1">{s.detail}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Last race podium + classification */}
              <div className="glass-card rounded-3xl p-8 border border-border/60">
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-6">
                  {data.lastRace?.name ?? "Latest Grand Prix"}
                </h2>

                {podium.length > 0 ? (
                  <>
                    <div className="flex items-end justify-center gap-4 mb-8">
                      {[podium[1], podium[0], podium[2]].filter(Boolean).map((d, i) => (
                        <div key={d.name} className="flex flex-col items-center text-center">
                          {d.image ? (
                            <img
                              src={d.image}
                              alt={d.name}
                              className={`rounded-full object-cover border-2 border-accent/20 ${
                                i === 1 ? "w-16 h-16" : "w-12 h-12"
                              }`}
                            />
                          ) : (
                            <div
                              className={`rounded-full bg-overlay-2 ${
                                i === 1 ? "w-16 h-16" : "w-12 h-12"
                              }`}
                            />
                          )}
                          <span className="text-2xl font-black text-red-500 mt-2">
                            P{d.position}
                          </span>
                          <span className="text-xs font-semibold">{d.code || d.name}</span>
                          <span className="text-[10px] text-text-muted">{d.constructor}</span>
                        </div>
                      ))}
                    </div>

                    <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                      {data.lastRace?.results.map((r) => (
                        <div
                          key={r.position + r.name}
                          className="flex items-center gap-3 py-2 text-sm border-b border-border/30 last:border-0"
                        >
                          <span className="font-mono text-text-muted w-6">{r.position}</span>
                          <span className="flex-1 font-medium truncate">{r.name}</span>
                          <span className="text-[11px] text-text-muted truncate max-w-[110px]">
                            {r.time || "—"}
                          </span>
                          <span className="font-mono text-accent w-8 text-right">{r.points}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-text-muted text-sm">No completed race this season yet.</p>
                )}
              </div>

              <div className="space-y-8">
                {/* Driver standings */}
                <div className="glass-card rounded-3xl p-8 border border-border/60">
                  <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-6">
                    Driver Standings
                  </h2>
                  <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {data.standings?.map((driver) => (
                      <li
                        key={driver.position}
                        className="flex items-center gap-4 p-3 rounded-xl bg-overlay-1 border border-border/50"
                      >
                        <div className="text-lg font-black text-overlay-3 w-6">
                          {driver.position}
                        </div>
                        {driver.image ? (
                          <img
                            src={driver.image}
                            alt={driver.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-accent/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-overlay-2 flex items-center justify-center text-[10px] font-bold text-text-muted">
                            {driver.code}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{driver.name}</div>
                          <div className="text-xs text-text-muted truncate">
                            {driver.constructor}
                          </div>
                        </div>
                        <span className="text-accent font-mono text-sm tracking-widest">
                          {driver.points}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Constructor standings */}
                {data.constructorStandings?.length > 0 && (
                  <div className="glass-card rounded-3xl p-8 border border-border/60">
                    <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-6">
                      Constructor Standings
                    </h2>
                    <ul className="space-y-2">
                      {data.constructorStandings.map((t) => (
                        <li key={t.position} className="flex items-center gap-4 text-sm py-1.5">
                          <span className="font-mono text-text-muted w-6">{t.position}</span>
                          <span className="flex-1 font-medium">{t.name}</span>
                          <span className="text-[11px] text-text-muted">{t.wins} wins</span>
                          <span className="font-mono text-accent w-10 text-right">{t.points}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Full calendar */}
            <div className="glass-card rounded-3xl p-8 border border-border/60">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-6">
                {data.season} Calendar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.matches?.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-xl border p-4 ${
                      r.isLive
                        ? "border-red-500/30 bg-red-500/5"
                        : r.status === "post"
                          ? "border-border/40 bg-overlay-1 opacity-60"
                          : "border-border/60 bg-overlay-1"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">
                        Round {r.round}
                      </span>
                      {r.isLive && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm font-semibold truncate">{r.title}</p>
                    <p className="text-[11px] text-text-muted truncate">
                      {r.locality}
                      {r.country ? `, ${r.country}` : ""}
                    </p>
                    {r.team1Full && (
                      <p className="text-[11px] text-accent mt-1.5 truncate">🏆 {r.team1Full}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
