"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

/* ========================================================
   HELPERS & MOCK GENERATORS
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

const MOCK_MEMBERS = [
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
  if (
    t.includes("ipl") || 
    t.includes("indian premier league") || 
    t.includes("world cup") || 
    t.includes("india vs") || 
    t.includes("vs india") || 
    t.includes("ashes")
  ) {
    return 650 + Math.floor(Math.random() * 850);
  }
  if (
    t.includes("bbl") || 
    t.includes("psl") || 
    t.includes("cpl") || 
    t.includes("hundred") || 
    t.includes("blast") || 
    t.includes("australia") || 
    t.includes("england") || 
    t.includes("pakistan")
  ) {
    return 140 + Math.floor(Math.random() * 220);
  }
  return 14 + Math.floor(Math.random() * 45);
}

function getSoccerMatchAudience(title: string, leagueName: string = ""): number {
  const t = (title + " " + leagueName).toLowerCase();
  if (
    t.includes("champions league") || 
    t.includes("premier league") || 
    t.includes("la liga") || 
    t.includes("real madrid") || 
    t.includes("barcelona") || 
    t.includes("manchester")
  ) {
    return 650 + Math.floor(Math.random() * 950);
  }
  if (
    t.includes("serie a") || 
    t.includes("bundesliga") || 
    t.includes("mls") || 
    t.includes("saudi") || 
    t.includes("europa")
  ) {
    return 160 + Math.floor(Math.random() * 260);
  }
  return 12 + Math.floor(Math.random() * 40);
}

/* ========================================================
   EXECUTIVE DASHBOARD COMPONENT
   ======================================================== */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [baseBrowsingUsers, setBaseBrowsingUsers] = useState(2850);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);
  const [displayedMembers, setDisplayedMembers] = useState([...MOCK_MEMBERS]);

  // Live concurrent online audience
  const liveAudience = baseBrowsingUsers + 
    cricketMatches.reduce((sum, m) => sum + m.viewers, 0) + 
    soccerMatches.reduce((sum, m) => sum + m.viewers, 0);

  // Real-time subtle fluctuation
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

  // Fetch real matches
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

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 antialiased font-sans">
      {/* Clean Top Navigation Bar */}
      <header className="border-b border-zinc-800/70 bg-[#09090b]/80 backdrop-blur sticky top-0 z-30 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-semibold tracking-tight text-white font-mono">
              ScoreDeck Management
            </h1>
            <span className="text-xs text-zinc-500 font-mono">/</span>
            <span className="text-xs text-zinc-400 font-mono">Executive Overview</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-1.5 rounded-md hover:bg-zinc-800/60"
            >
              Exit to Site
            </Link>
            <button
              onClick={onLogout}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Top KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Modeled ARR */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#0f0f12]">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Modeled ARR
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              $152,727
            </div>
            <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
              <span className="text-emerald-400 font-mono font-medium">$12,727 MRR</span>
              <span>·</span>
              <span>3,376 Paid Subs</span>
            </div>
          </div>

          {/* Card 2: 1st-Cycle Retention */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#0f0f12]">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
              1st-Cycle Retention (3-Mo)
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              78.0%
            </div>
            <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
              <span className="text-zinc-300 font-mono">780 / 1k Retained</span>
              <span>·</span>
              <span className="text-zinc-400">22% Churn</span>
            </div>
          </div>

          {/* Card 3: Activation Rate */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#0f0f12]">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Activation Rate
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              82.0%
            </div>
            <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
              <span className="text-zinc-300 font-mono">102k Opened</span>
              <span>·</span>
              <span className="text-zinc-400">18% Unactivated</span>
            </div>
          </div>

          {/* Card 4: Live Concurrent Audience */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#0f0f12]">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Live Concurrent Users
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {liveAudience.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
              <span className="text-zinc-300 font-mono">124,779 Base</span>
              <span>·</span>
              <span>43m Avg Session</span>
            </div>
          </div>

        </section>

        {/* Main 2-Column Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Customer Lifecycle & Financial Matrix (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Retention & Funnel Matrix */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Customer Lifecycle & Retention Matrix
                </h2>
                <span className="text-xs font-mono text-zinc-400">Q3 2026</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <th className="pb-2 font-medium">Stage</th>
                      <th className="pb-2 font-medium">Rate</th>
                      <th className="pb-2 font-medium">Duration</th>
                      <th className="pb-2 font-medium">Operational Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr>
                      <td className="py-3 font-medium text-white">App Activation</td>
                      <td className="py-3 font-mono text-zinc-200">82.0%</td>
                      <td className="py-3 font-mono text-zinc-400">Immediate</td>
                      <td className="py-3 text-zinc-400">18% never open app (unactivated opportunity)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">Free → Paid Conversion</td>
                      <td className="py-3 font-mono text-zinc-200">~5.0%</td>
                      <td className="py-3 font-mono text-zinc-400">4.8 Weeks</td>
                      <td className="py-3 text-zinc-400">Average time for free users to convert</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">1st-Cycle Retention</td>
                      <td className="py-3 font-mono text-emerald-400 font-medium">78.0%</td>
                      <td className="py-3 font-mono text-zinc-400">3 Months</td>
                      <td className="py-3 text-zinc-400">780 of 1,000 paid subscribers survive first renewal</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-medium text-white">1st-Cycle Churn</td>
                      <td className="py-3 font-mono text-zinc-300">22.0%</td>
                      <td className="py-3 font-mono text-zinc-400">Quarterly</td>
                      <td className="py-3 text-zinc-400">Primary recurring-revenue leakage point ($15/qtr)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Subscriber Base & Revenue Model */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] space-y-4">
              <h2 className="text-sm font-semibold text-white tracking-tight border-b border-zinc-800/80 pb-3">
                Subscriber Distribution & ARR Model
              </h2>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Quarterly ($15)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">2,347</div>
                  <div className="text-[11px] text-zinc-400 mt-1">1,831 renew (78%)</div>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Annual ($49)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">243</div>
                  <div className="text-[11px] text-zinc-400 mt-1">High LTV segment</div>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-800/60 bg-zinc-900/30">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Founding Lifetime</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">786</div>
                  <div className="text-[11px] text-zinc-400 mt-1">$29 founding base</div>
                </div>
              </div>

              <div className="pt-2 text-xs text-zinc-400 space-y-1.5 border-t border-zinc-800/60">
                <p>
                  <strong className="text-zinc-200">Growth Lever 1:</strong> Reducing the unactivated rate from 18% to 12% activates +600 users per 10k signups into the 5% conversion funnel.
                </p>
                <p>
                  <strong className="text-zinc-200">Growth Lever 2:</strong> Improving first-cycle retention from 78% to 82% yields +400 retained subscribers per 10k cohort with zero additional acquisition cost.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Live Streams, Telemetry & Members (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Sports Stream Telemetry */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    Live Match Connections
                  </h2>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {cricketMatches.length + soccerMatches.length} Active
                </span>
              </div>

              <div className="divide-y divide-zinc-800/50 max-h-[300px] overflow-y-auto pr-1">
                {cricketMatches.length === 0 && soccerMatches.length === 0 && (
                  <div className="py-6 text-center text-xs text-zinc-500 font-mono">
                    No active match streams
                  </div>
                )}

                {cricketMatches.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-zinc-200 truncate">{m.title}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{m.score}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-medium text-zinc-200">{m.viewers.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">viewers</div>
                    </div>
                  </div>
                ))}

                {soccerMatches.map((m) => (
                  <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-zinc-200 truncate">{m.title}</div>
                      <div className="text-[11px] text-zinc-500 truncate">{m.score} · {m.status}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-medium text-zinc-200">{m.viewers.toLocaleString()}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">viewers</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform & Device Telemetry */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] space-y-4">
              <h2 className="text-sm font-semibold text-white tracking-tight border-b border-zinc-800/80 pb-3">
                Platform Breakdown
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                    <span>Desktop (Windows / macOS)</span>
                    <span>72.4%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[72.4%] h-full bg-zinc-400" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                    <span>Mobile (iOS / Android)</span>
                    <span>21.1%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[21.1%] h-full bg-zinc-400" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-zinc-300 mb-1 font-mono">
                    <span>Tablet & Web</span>
                    <span>6.5%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[6.5%] h-full bg-zinc-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Member Directory */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-[#0f0f12] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h2 className="text-sm font-semibold text-white tracking-tight">
                  Recent Members
                </h2>
                <span className="text-xs font-mono text-zinc-400">Total: 124,779</span>
              </div>

              <div className="divide-y divide-zinc-800/50 max-h-[220px] overflow-y-auto">
                {displayedMembers.map((m) => (
                  <div key={m.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-zinc-200">{maskName(m.name)}</div>
                      <div className="text-[11px] text-zinc-500 font-mono">{maskEmail(m.email)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-zinc-400">{m.region} · {m.tier}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}
