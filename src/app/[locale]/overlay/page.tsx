"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import SlotAd from "@/components/SlotAd";

export default function RealDesktopOverlayPage() {
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [opacity, setOpacity] = useState(95);
  const [pinnedSport, setPinnedSport] = useState<"all" | "soccer" | "cricket">("all");

  useEffect(() => {
    async function fetchLiveScores() {
      try {
        const [sRes, cRes] = await Promise.allSettled([
          fetch("/api/soccer"),
          fetch("/api/cricket"),
        ]);

        if (sRes.status === "fulfilled" && sRes.value.ok) {
          const sData = await sRes.value.json();
          if (sData.status === "success" && Array.isArray(sData.leagues)) {
            const matches: any[] = [];
            sData.leagues.forEach((l: any) => {
              matches.push(...(l.matches || []).map((m: any) => ({ ...m, league: l.league })));
            });
            setSoccerMatches(matches.slice(0, 4));
          }
        }

        if (cRes.status === "fulfilled" && cRes.value.ok) {
          const cData = await cRes.value.json();
          if (cData.status === "success" && Array.isArray(cData.matches)) {
            setCricketMatches(cData.matches.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Overlay fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveScores();
    const timer = setInterval(fetchLiveScores, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      
      {/* Top Testing Controls Bar */}
      <div className="w-full max-w-lg mb-6 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4 text-xs font-mono backdrop-blur">
        <div>
          <span className="text-zinc-400">Desktop Overlay Steath Opacity:</span>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="range"
              min="30"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-28 accent-emerald-400 cursor-pointer"
            />
            <span className="text-emerald-400 font-bold">{opacity}%</span>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setPinnedSport("all")}
            className={`px-2.5 py-1 rounded text-[10px] ${
              pinnedSport === "all" ? "bg-zinc-100 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPinnedSport("soccer")}
            className={`px-2.5 py-1 rounded text-[10px] ${
              pinnedSport === "soccer" ? "bg-emerald-400 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Soccer
          </button>
          <button
            onClick={() => setPinnedSport("cricket")}
            className={`px-2.5 py-1 rounded text-[10px] ${
              pinnedSport === "cricket" ? "bg-zinc-100 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"
            }`}
          >
            Cricket
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          REAL FLOATING DESKTOP OVERLAY WIDGET (WITH AD PLACEMENT)
          ═════════════════════════════════════════════════════════ */}
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-700/80 bg-zinc-950/95 shadow-2xl p-5 space-y-4 backdrop-blur-2xl transition-opacity"
        style={{ opacity: opacity / 100 }}
      >
        {/* Widget Top Drag Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white tracking-tight">ScoreDeck Live Overlay</span>
            <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">Always-on-Top</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-500">
            <Link href="/" className="text-zinc-400 hover:text-white text-[10px]">Exit</Link>
            <span>—</span>
            <span>✕</span>
          </div>
        </div>

        {/* Real Live Matches List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {loading && (
            <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
              FETCHING LIVE TELEMETRY...
            </div>
          )}

          {/* Real Soccer Matches */}
          {(pinnedSport === "all" || pinnedSport === "soccer") &&
            soccerMatches.map((m, idx) => (
              <div
                key={`soccer-${idx}`}
                className="p-3.5 rounded-xl border border-zinc-800 bg-[#121216] hover:border-zinc-700 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider">
                    ⚽ SOCCER · {m.time || m.status}
                  </span>
                  <span className="text-zinc-500 truncate max-w-[140px]">{m.league}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-white truncate">{m.home_team} vs {m.away_team}</span>
                  <span className="font-mono font-bold text-emerald-400 ml-2">
                    {m.home_score} - {m.away_score}
                  </span>
                </div>
              </div>
            ))}

          {/* Real Cricket Matches */}
          {(pinnedSport === "all" || pinnedSport === "cricket") &&
            cricketMatches.map((m, idx) => (
              <div
                key={`cricket-${idx}`}
                className="p-3.5 rounded-xl border border-zinc-800 bg-[#121216] hover:border-zinc-700 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-zinc-300 font-bold uppercase tracking-wider">
                    🏏 CRICKET · LIVE
                  </span>
                  <span className="text-zinc-500 truncate max-w-[140px]">{m.status_text}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-white truncate">{m.title}</span>
                  <span className="font-mono font-bold text-white ml-2">{m.score}</span>
                </div>
              </div>
            ))}
        </div>

        {/* ═════════════════════════════════════════════════════════
            REAL HOUSE AD PLACEMENT VIEW (SLOT: OVERLAY FOOTER)
            ═════════════════════════════════════════════════════════ */}
        <div className="pt-2 border-t border-zinc-800">
          <SlotAd />
        </div>

      </div>

    </div>
  );
}
