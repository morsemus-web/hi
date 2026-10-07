"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import SlotAd from "@/components/SlotAd";

type SportTab = "soccer" | "cricket" | "basketball" | "f1";
type BottomNav = "scores" | "commentary" | "news" | "account";

export default function MobileAppPage() {
  const [activeSport, setActiveSport] = useState<SportTab>("soccer");
  const [activeNav, setActiveNav] = useState<BottomNav>("scores");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const [soccerData, setSoccerData] = useState<any[]>([]);
  const [cricketData, setCricketData] = useState<any[]>([]);
  const [basketballData, setBasketballData] = useState<any[]>([]);
  const [f1Data, setF1Data] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all sports feeds
  useEffect(() => {
    async function loadAllSports() {
      setLoading(true);
      try {
        const [sRes, cRes, bRes, fRes] = await Promise.allSettled([
          fetch("/api/soccer"),
          fetch("/api/cricket"),
          fetch("/api/basketball"),
          fetch("/api/f1"),
        ]);

        if (sRes.status === "fulfilled" && sRes.value.ok) {
          const s = await sRes.value.json();
          if (s.status === "success" && Array.isArray(s.leagues)) {
            const list: any[] = [];
            s.leagues.forEach((l: any) => {
              (l.matches || []).forEach((m: any) => {
                list.push({ ...m, league: l.league });
              });
            });
            setSoccerData(list);
          }
        }

        if (cRes.status === "fulfilled" && cRes.value.ok) {
          const c = await cRes.value.json();
          if (c.status === "success" && Array.isArray(c.matches)) {
            setCricketData(c.matches);
          }
        }

        if (bRes.status === "fulfilled" && bRes.value.ok) {
          const b = await bRes.value.json();
          if (b.status === "success" && Array.isArray(b.games)) {
            setBasketballData(b.games);
          }
        }

        if (fRes.status === "fulfilled" && fRes.value.ok) {
          const f = await fRes.value.json();
          if (f.status === "success" && Array.isArray(f.drivers)) {
            setF1Data(f.drivers);
          }
        }
      } catch (err) {
        console.error("Mobile app fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAllSports();
    const interval = setInterval(loadAllSports, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans pb-24 select-none max-w-md mx-auto relative border-x border-zinc-800/80 shadow-2xl">
      
      {/* ═════════════════════════════════════════════════════════
          NATIVE MOBILE TOP APP BAR
          ═════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#0a0a0d]/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-base font-extrabold tracking-tight text-white font-mono">
              ScoreDeck
            </h1>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded font-bold">
              APK v1.0.2
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/download"
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all shadow"
            >
              Get APK
            </Link>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search teams, players, leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-emerald-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 outline-none transition-all font-sans"
          />
        </div>

        {/* Native Sport Selector Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1 text-xs font-mono">
          <button
            onClick={() => setActiveSport("soccer")}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all border ${
              activeSport === "soccer"
                ? "bg-emerald-500 text-zinc-950 font-bold border-emerald-400 shadow-sm"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            ⚽ Soccer ({soccerData.length})
          </button>
          <button
            onClick={() => setActiveSport("cricket")}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all border ${
              activeSport === "cricket"
                ? "bg-zinc-100 text-zinc-950 font-bold border-white shadow-sm"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            🏏 Cricket ({cricketData.length})
          </button>
          <button
            onClick={() => setActiveSport("basketball")}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all border ${
              activeSport === "basketball"
                ? "bg-zinc-100 text-zinc-950 font-bold border-white shadow-sm"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            🏀 NBA ({basketballData.length})
          </button>
          <button
            onClick={() => setActiveSport("f1")}
            className={`px-3 py-1.5 rounded-xl shrink-0 transition-all border ${
              activeSport === "f1"
                ? "bg-zinc-100 text-zinc-950 font-bold border-white shadow-sm"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            🏎️ F1
          </button>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════════
          MAIN MATCH FEED CONTENT
          ═════════════════════════════════════════════════════════ */}
      <main className="px-4 py-4 space-y-4">
        
        {/* Top House Campaign Ad Banner */}
        <div className="rounded-2xl border border-zinc-800 bg-[#111114] p-3.5 shadow-sm">
          <SlotAd sport={activeSport} campaignIndex={0} />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center text-xs font-mono text-zinc-500 animate-pulse">
            LOADING REAL-TIME {activeSport.toUpperCase()} TELEMETRY...
          </div>
        )}

        {/* ── 1. SOCCER FEED ── */}
        {activeSport === "soccer" && !loading && (
          <div className="space-y-3">
            {soccerData.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono">No live soccer fixtures right now.</div>
            ) : (
              soccerData.map((m, idx) => (
                <div key={idx} className="space-y-3">
                  <div
                    onClick={() => setSelectedMatch(m)}
                    className="p-4 rounded-2xl border border-zinc-800 bg-[#111114] hover:border-zinc-700 active:scale-[0.99] transition-all cursor-pointer space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                        ⚽ {m.time || m.status}
                      </span>
                      <span className="text-zinc-400 truncate max-w-[180px]">{m.league}</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">{m.home_team}</div>
                        <div className="text-sm font-bold text-zinc-300 truncate">{m.away_team}</div>
                      </div>
                      <div className="text-right font-mono font-bold text-lg text-emerald-400 pl-3">
                        <div>{m.home_score ?? 0}</div>
                        <div className="text-zinc-300">{m.away_score ?? 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Mid-feed In-App House Ad View (after 2nd match) */}
                  {idx === 1 && (
                    <div className="pt-1">
                      <SlotAd sport="soccer" campaignIndex={1} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 2. CRICKET FEED ── */}
        {activeSport === "cricket" && !loading && (
          <div className="space-y-3">
            {cricketData.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono">No live cricket matches right now.</div>
            ) : (
              cricketData.map((m, idx) => (
                <div key={idx} className="space-y-3">
                  <div
                    onClick={() => setSelectedMatch(m)}
                    className="p-4 rounded-2xl border border-zinc-800 bg-[#111114] hover:border-zinc-700 active:scale-[0.99] transition-all cursor-pointer space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-zinc-300 font-bold bg-zinc-800 px-1.5 py-0.2 rounded">
                        🏏 CRICKET
                      </span>
                      <span className="text-zinc-400 truncate max-w-[200px]">{m.status_text}</span>
                    </div>

                    <div className="text-sm font-bold text-white leading-snug">
                      {m.title}
                    </div>
                    {m.score && (
                      <div className="text-xs font-mono text-emerald-400 font-bold">
                        {m.score}
                      </div>
                    )}
                  </div>

                  {idx === 1 && (
                    <div className="pt-1">
                      <SlotAd sport="cricket" campaignIndex={2} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 3. BASKETBALL FEED ── */}
        {activeSport === "basketball" && !loading && (
          <div className="space-y-3">
            {basketballData.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500 font-mono">No active NBA fixtures right now.</div>
            ) : (
              basketballData.map((g, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-zinc-800 bg-[#111114] space-y-2 shadow-sm"
                >
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                    <span className="text-amber-400 font-bold">🏀 NBA</span>
                    <span>{g.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>{g.home_team?.full_name || "Home"} vs {g.visitor_team?.full_name || "Away"}</span>
                    <span className="font-mono text-amber-400">{g.home_team_score ?? 0} - {g.visitor_team_score ?? 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 4. F1 FEED ── */}
        {activeSport === "f1" && !loading && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-zinc-800 bg-[#111114] space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-red-400 font-bold">🏎️ FORMULA 1</span>
                <span className="text-zinc-400">Grand Prix Telemetry</span>
              </div>
              <div className="text-sm font-bold text-white">Live Grid Standings & Lap Times</div>
              <p className="text-xs text-zinc-400">Sector times, tire compound degradation & gap analysis.</p>
            </div>
            <SlotAd sport="f1" campaignIndex={3} />
          </div>
        )}

      </main>

      {/* ═════════════════════════════════════════════════════════
          NATIVE MOBILE BOTTOM NAVIGATION BAR
          ═════════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0d]/95 backdrop-blur-2xl border-t border-zinc-800 px-6 py-2.5 z-40 flex items-center justify-between text-xs font-mono">
        <button
          onClick={() => setActiveNav("scores")}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeNav === "scores" ? "text-emerald-400 font-bold" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <span className="text-base">⚡</span>
          <span className="text-[10px]">Scores</span>
        </button>

        <Link
          href="/#commentary"
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span className="text-base">🎙️</span>
          <span className="text-[10px]">Audio</span>
        </Link>

        <Link
          href="/news"
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span className="text-base">📰</span>
          <span className="text-[10px]">News</span>
        </Link>

        <Link
          href="/account"
          className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span className="text-base">👤</span>
          <span className="text-[10px]">Account</span>
        </Link>
      </nav>

      {/* Match Details Drawer on Click */}
      {selectedMatch && (
        <div
          onClick={() => setSelectedMatch(null)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#111114] border-t border-zinc-700 rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto" />
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
              <span className="text-emerald-400 font-bold">Match Telemetry</span>
              <button onClick={() => setSelectedMatch(null)} className="text-zinc-400 hover:text-white">✕ Close</button>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="text-base font-bold text-white">
                {selectedMatch.home_team ? `${selectedMatch.home_team} vs ${selectedMatch.away_team}` : selectedMatch.title}
              </div>
              <div className="text-xl font-bold font-mono text-emerald-400">
                {selectedMatch.home_score !== undefined ? `${selectedMatch.home_score} - ${selectedMatch.away_score}` : selectedMatch.score}
              </div>
            </div>

            <SlotAd />
          </div>
        </div>
      )}

    </div>
  );
}
