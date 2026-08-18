"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";

const GlobeView = dynamic(() => import("./GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center text-zinc-600 font-mono text-xs">
      INITIALIZING TELEMETRY GLOBE...
    </div>
  ),
});

/* ========================================================
   HELPERS & MOCK DATA
   ======================================================== */
function getFluctuatingUsers(base: number, variance: number, current: number) {
  const drift = (base - current) * 0.05;
  const walk = (Math.random() - 0.5) * variance;
  return Math.floor(current + drift + walk);
}

function maskName(name: string) {
  return name.split(" ").map((part) => {
    if (part.length <= 1) return part;
    return part.charAt(0) + "•".repeat(part.length - 1);
  }).join(" ");
}

function maskEmail(email: string) {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const local = parts[0];
  const domain = parts[1];
  if (local.length <= 2) return `••@${domain}`;
  return `${local.charAt(0)}${"•".repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

const INITIAL_MEMBERS = [
  { id: "SD-901", name: "Aryan Sharma", email: "aryan.s@gmail.com", region: "India", session: "4h 12m", status: "Online", tier: "Quarterly" },
  { id: "SD-902", name: "James Wilson", email: "j.wilson92@hotmail.com", region: "UK", session: "1d 5h", status: "Online", tier: "Annual" },
  { id: "SD-903", name: "David Chen", email: "dchen.sports@yahoo.com", region: "Australia", session: "2h ago", status: "Offline", tier: "Lifetime" },
  { id: "SD-904", name: "Rahul Desai", email: "rahuld88@gmail.com", region: "India", session: "6h 45m", status: "Online", tier: "Quarterly" },
  { id: "SD-905", name: "Sarah Jenkins", email: "s.jenkins.tx@gmail.com", region: "US", session: "11h 20m", status: "Online", tier: "Quarterly" },
  { id: "SD-906", name: "Ahmed Al-Fayed", email: "ahmed.alf@outlook.com", region: "UAE", session: "5h ago", status: "Offline", tier: "Annual" },
  { id: "SD-907", name: "Marcus Rossi", email: "mrossi1999@gmail.com", region: "Italy", session: "2d 4h", status: "Online", tier: "Quarterly" },
  { id: "SD-908", name: "Priya Patel", email: "priya.p.90@yahoo.com", region: "India", session: "8h 30m", status: "Online", tier: "Lifetime" },
];

function getCricketMatchAudience(title: string, status: string): number {
  const t = (title + " " + status).toLowerCase();
  if (t.includes("ipl") || t.includes("world cup") || t.includes("india") || t.includes("ashes")) {
    return 650 + Math.floor(Math.random() * 850);
  }
  if (t.includes("bbl") || t.includes("psl") || t.includes("hundred") || t.includes("australia") || t.includes("england")) {
    return 140 + Math.floor(Math.random() * 220);
  }
  return 14 + Math.floor(Math.random() * 45);
}

function getSoccerMatchAudience(title: string, leagueName: string = ""): number {
  const t = (title + " " + leagueName).toLowerCase();
  if (t.includes("champions league") || t.includes("premier league") || t.includes("la liga") || t.includes("real madrid") || t.includes("barcelona")) {
    return 650 + Math.floor(Math.random() * 950);
  }
  if (t.includes("serie a") || t.includes("bundesliga") || t.includes("mls") || t.includes("europa")) {
    return 160 + Math.floor(Math.random() * 260);
  }
  return 12 + Math.floor(Math.random() * 40);
}

/* ========================================================
   ADMIN DASHBOARD COMPONENT
   ======================================================== */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [baseBrowsingUsers, setBaseBrowsingUsers] = useState(2850);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);
  const [displayedMembers, setDisplayedMembers] = useState(INITIAL_MEMBERS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const liveAudience = baseBrowsingUsers + 
    cricketMatches.reduce((sum, m) => sum + m.viewers, 0) + 
    soccerMatches.reduce((sum, m) => sum + m.viewers, 0);

  // Subtle real-time fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setBaseBrowsingUsers((prev) => getFluctuatingUsers(2850, 15, prev));
      setCricketMatches((matches) =>
        matches.map((m) => {
          if (Math.random() > 0.4) return m;
          const delta = m.viewers > 300 ? Math.floor(Math.random() * 16) - 8 : Math.floor(Math.random() * 4) - 2;
          return { ...m, viewers: Math.max(5, m.viewers + delta) };
        })
      );
      setSoccerMatches((matches) =>
        matches.map((m) => {
          if (Math.random() > 0.4) return m;
          const delta = m.viewers > 300 ? Math.floor(Math.random() * 16) - 8 : Math.floor(Math.random() * 4) - 2;
          return { ...m, viewers: Math.max(5, m.viewers + delta) };
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Fetch real match feeds
  useEffect(() => {
    async function fetchMatches() {
      // Cricket
      try {
        const cRes = await fetch("/api/cricket");
        const cData = await cRes.json();
        if (cData.status === "success" && Array.isArray(cData.matches)) {
          const liveC = cData.matches.filter((m: any) => {
            const t = (m.status_text || "").toLowerCase();
            const isCompleted = t.includes("won") || t.includes("beat") || t.includes("draw") || t.includes("tied") || t.includes("completed") || t.includes("abandoned");
            const isUpcoming = t.includes("starts at") || t.includes("starts in") || t.includes("preview") || t.includes("upcoming");
            return !isCompleted && !isUpcoming;
          });
          setCricketMatches(
            liveC.map((m: any) => ({
              id: m.id,
              title: m.title,
              score: m.score,
              status: m.status_text,
              viewers: getCricketMatchAudience(m.title, m.status_text),
            }))
          );
        }
      } catch {}

      // Soccer
      try {
        const sRes = await fetch("/api/soccer");
        const sData = await sRes.json();
        if (sData.status === "success" && Array.isArray(sData.leagues)) {
          const liveS: any[] = [];
          sData.leagues.forEach((l: any) => {
            const matches = l.matches.filter((m: any) => m.status === "Live");
            liveS.push(
              ...matches.map((m: any) => ({
                id: `${m.home_team}-${m.away_team}`,
                title: `${m.home_team} vs ${m.away_team}`,
                score: `${m.home_score} - ${m.away_score}`,
                status: m.time,
                viewers: getSoccerMatchAudience(`${m.home_team} vs ${m.away_team}`, l.league_name || ""),
              }))
            );
          });
          setSoccerMatches(liveS);
        }
      } catch {}
    }
    fetchMatches();
  }, []);

  const loadMoreMembers = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const names = ["Liam Smith", "Olivia Brown", "Noah Davis", "Emma Wilson", "Oliver Taylor", "Sophia Martinez"];
      const regions = ["US", "UK", "India", "Australia", "Germany", "Canada"];
      const tiers = ["Quarterly", "Quarterly", "Annual", "Lifetime"];
      const newItems = names.map((name, i) => ({
        id: `SD-${909 + displayedMembers.length + i}`,
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@gmail.com`,
        region: regions[i % regions.length],
        session: "Just now",
        status: i % 2 === 0 ? "Online" : "Offline",
        tier: tiers[i % tiers.length],
      }));
      setDisplayedMembers((prev) => [...prev, ...newItems]);
      setIsLoadingMore(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 antialiased font-sans">
      {/* Clean Top Navigation */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0a]/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Scoredeck Platform
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                Live Telemetry & Audience Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-800/50"
            >
              Exit to Site
            </Link>
            <button
              onClick={onLogout}
              className="text-xs font-medium text-zinc-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* Top 3-Card Row: Live Audience | Devices | Hotspots */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Live Global Audience */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-[#111113] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Global Audience
              </div>
              <div className="text-4xl font-bold font-mono text-white tracking-tight">
                {liveAudience.toLocaleString()}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/60 space-y-4">
              <div>
                <div className="flex justify-between text-xs text-zinc-400 mb-1 font-mono">
                  <span>Avg Session Time</span>
                  <span className="text-zinc-200 font-bold">43m 12s</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-zinc-300" />
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                  Traffic Matrix
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-zinc-300">Direct <strong className="text-white">64%</strong></span>
                  <span className="text-zinc-300">Social <strong className="text-white">24%</strong></span>
                  <span className="text-zinc-300">Ref <strong className="text-white">12%</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Device Distribution */}
          <div className="p-6 rounded-2xl border border-zinc-800/80 bg-[#111113] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                Device Distribution
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                72.4% <span className="text-sm font-normal text-zinc-400">Desktop Primary</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/60 space-y-3 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Desktop (Windows / Mac)</span>
                  <span className="text-white font-bold">72.4%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[72.4%] h-full bg-zinc-300" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Mobile (iOS / Android)</span>
                  <span className="text-white font-bold">21.1%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[21.1%] h-full bg-zinc-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-300 mb-1">
                  <span>Tablet / Web Embeds</span>
                  <span className="text-white font-bold">6.5%</span>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="w-[6.5%] h-full bg-zinc-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Geospatial Hotspots */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111113] overflow-hidden flex flex-col relative min-h-[260px]">
            <div className="p-4 border-b border-zinc-800/60 bg-[#141417] flex justify-between items-center z-10">
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                Global Hotspots
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Live Feed
              </span>
            </div>
            <div className="flex-1 w-full h-full relative">
              <GlobeView />
            </div>
          </div>

        </section>

        {/* Middle Section: Executive Retention & Revenue Telemetry */}
        <section className="p-6 rounded-2xl border border-zinc-800/80 bg-[#111113] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/80 pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Retention & Revenue Telemetry
              </h2>
              <p className="text-xs text-zinc-400">
                Active member pool: 124,779 registered users
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md">
                Modeled ARR: <strong className="text-white">$152,727</strong>
              </span>
            </div>
          </div>

          {/* 4 Core Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800/60 bg-[#16161a]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                1st-Cycle Retention
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                78.0%
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                780 / 1k 3-month cohort
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/60 bg-[#16161a]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                1st-Cycle Churn
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-200 mt-1">
                22.0%
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                220 drop at 1st renewal
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/60 bg-[#16161a]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Activation Rate
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-200 mt-1">
                82.0%
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                18% unactivated (never opened)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800/60 bg-[#16161a]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Free → Paid
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-200 mt-1">
                ~5.0%
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                4.8 weeks avg conversion
              </div>
            </div>
          </div>

          {/* Subscriber Breakdown Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-lg border border-zinc-800/50 bg-[#141417]">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Quarterly ($15/qtr)</span>
              <div className="text-lg font-bold font-mono text-white">2,347 Subscribers</div>
              <div className="text-[11px] text-zinc-400">1,831 renew (78%)</div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800/50 bg-[#141417]">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Annual ($49/yr)</span>
              <div className="text-lg font-bold font-mono text-white">243 Subscribers</div>
              <div className="text-[11px] text-zinc-400">Annual recurring core</div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800/50 bg-[#141417]">
              <span className="text-[10px] font-mono uppercase text-zinc-400">Founding Lifetime</span>
              <div className="text-lg font-bold font-mono text-white">786 Members</div>
              <div className="text-[11px] text-zinc-400">Early supporters</div>
            </div>
          </div>
        </section>

        {/* Bottom 2-Column: Live Matches & Members Directory */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Match Connections */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111113] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800/60 bg-[#141417] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                  Live Match Telemetry
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {cricketMatches.length + soccerMatches.length} Streams Active
              </span>
            </div>

            <div className="divide-y divide-zinc-800/50 max-h-[360px] overflow-y-auto">
              {cricketMatches.length === 0 && soccerMatches.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">
                  NO ACTIVE TELEMETRY STREAMS
                </div>
              )}

              {cricketMatches.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        CRICKET · {m.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-100 truncate">{m.title}</div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">{m.score}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-white">{m.viewers.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Watching</div>
                  </div>
                </div>
              ))}

              {soccerMatches.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                        SOCCER · {m.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-zinc-100 truncate">{m.title}</div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">{m.score}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-white">{m.viewers.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-mono">Watching</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members Directory */}
          <div className="rounded-2xl border border-zinc-800/80 bg-[#111113] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800/60 bg-[#141417] flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
                Registered Members Directory
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">
                Pool: 124,779
              </span>
            </div>

            <div className="divide-y divide-zinc-800/50 max-h-[300px] overflow-y-auto">
              {displayedMembers.map((m) => (
                <div key={m.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-800/20 transition-colors text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-zinc-300 text-[10px] shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-100 truncate">{maskName(m.name)}</div>
                      <div className="text-[11px] text-zinc-500 font-mono truncate">{maskEmail(m.email)}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-zinc-300 font-medium">{m.region}</div>
                    <div className="text-[10px] text-zinc-500">{m.tier} · <span className={m.status === "Online" ? "text-emerald-400" : "text-zinc-500"}>{m.status}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-zinc-800/60 bg-[#141417] text-center">
              <button
                onClick={loadMoreMembers}
                disabled={isLoadingMore}
                className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : "Load More Members"}
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
