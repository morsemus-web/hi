"use client";

import { useEffect, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";

interface F1Match {
  id: string;
  title: string;
  team1: string;
  team1Full: string;
  score: string;
  extra: string;
  analysis: string[];
}

const API_URL = "/api/f1";

export default function LiveF1Client() {
  const [data, setData] = useState<F1Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      if (json.status === "success" && json.matches && json.matches.length > 0) {
        setData(json.matches[0]);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch F1 data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="min-h-screen bg-bg text-text-primary relative overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        <Link href="/" className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors">
          &larr; Back to ScoreDeck
        </Link>

        <div className="mt-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Formula 1 Hub</h1>
          </div>
          <p className="text-text-dim text-sm font-light leading-relaxed max-w-lg">
            Latest Grand Prix results and current driver standings.
          </p>
        </div>

        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-overlay-2 rounded-2xl w-full max-w-2xl" />
            <div className="h-64 bg-overlay-2 rounded-2xl w-full max-w-2xl" />
          </div>
        )}

        {error && !loading && !data && (
          <div className="glass-card rounded-xl p-8 text-center max-w-2xl">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => { setLoading(true); fetchData(); }} className="px-6 py-2 bg-accent/15 text-accent rounded">Retry</button>
          </div>
        )}

        {data && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Last Race Winner */}
            <div className="glass-card rounded-3xl p-8 border border-border/60 hover:border-accent/30 transition-colors">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-6">Latest Grand Prix Winner</h2>
              <div className="flex flex-col items-center text-center justify-center py-6">
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <span className="text-4xl font-black text-red-500">{data.score}</span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{data.team1Full}</h3>
                <p className="text-text-muted font-mono tracking-widest">{data.team1}</p>
                <div className="mt-6 px-4 py-2 rounded-full bg-overlay-2 border border-border">
                  <span className="text-xs font-medium text-text-dim">{data.title}</span>
                </div>
              </div>
            </div>

            {/* Standings */}
            <div className="glass-card rounded-3xl p-8 border border-border/60">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-text-muted mb-6">Top Driver Standings</h2>
              <ul className="space-y-4">
                {data.analysis.map((line, idx) => (
                  <li key={idx} className="flex items-center justify-between p-4 rounded-xl bg-overlay-1 border border-border/50">
                    <span className="font-mono text-lg font-semibold">{line.split('-')[0].trim()}</span>
                    <span className="text-accent font-mono text-sm tracking-widest">{line.split('-')[1]?.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
