"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";

const GlobeView = dynamic(() => import("./GlobeView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[220px] flex items-center justify-center text-zinc-600 font-mono text-xs">
      INITIALIZING GEOSPATIAL DATA...
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
  { id: "SD-903", name: "David Chen", email: "dchen.sports@yahoo.com", region: "Australia", session: "2h ago", status: "Offline", tier: "Founding Lifetime" },
  { id: "SD-904", name: "Rahul Desai", email: "rahuld88@gmail.com", region: "India", session: "6h 45m", status: "Online", tier: "Quarterly" },
  { id: "SD-905", name: "Sarah Jenkins", email: "s.jenkins.tx@gmail.com", region: "US", session: "11h 20m", status: "Online", tier: "Quarterly" },
  { id: "SD-906", name: "Ahmed Al-Fayed", email: "ahmed.alf@outlook.com", region: "UAE", session: "5h ago", status: "Offline", tier: "Annual" },
  { id: "SD-907", name: "Marcus Rossi", email: "mrossi1999@gmail.com", region: "Italy", session: "2d 4h", status: "Online", tier: "Quarterly" },
  { id: "SD-908", name: "Priya Patel", email: "priya.p.90@yahoo.com", region: "India", session: "8h 30m", status: "Online", tier: "Founding Lifetime" },
  { id: "SD-909", name: "Liam O'Connor", email: "liam.oconnor.ire@gmail.com", region: "Ireland", session: "5h 15m", status: "Online", tier: "Quarterly" },
  { id: "SD-910", name: "Oliver Smith", email: "osmith.sports@gmail.com", region: "UK", session: "1d ago", status: "Offline", tier: "Quarterly" },
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
   EXECUTIVE ADMIN DASHBOARD
   ======================================================== */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [baseBrowsingUsers, setBaseBrowsingUsers] = useState(2850);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);
  const [displayedMembers, setDisplayedMembers] = useState(INITIAL_MEMBERS);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedCohortSize, setSelectedCohortSize] = useState<number>(1000);

  const liveAudience = baseBrowsingUsers + 
    cricketMatches.reduce((sum, m) => sum + m.viewers, 0) + 
    soccerMatches.reduce((sum, m) => sum + m.viewers, 0);

  // Smooth periodic audience fluctuation
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

  const loadMoreMembers = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const names = ["Liam Smith", "Olivia Brown", "Noah Davis", "Emma Wilson", "Oliver Taylor", "Sophia Martinez", "Lucas Garcia", "Evelyn White"];
      const regions = ["US", "UK", "India", "Australia", "Germany", "Canada", "UAE", "Italy"];
      const tiers = ["Quarterly", "Quarterly", "Annual", "Founding Lifetime"];
      const newItems = names.map((name, i) => ({
        id: `SD-${911 + displayedMembers.length + i}`,
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

  // Cohort simulator calculation
  const simRetained = Math.round(selectedCohortSize * 0.78);
  const simChurned = Math.round(selectedCohortSize * 0.22);
  const simQuarterlyRenewRevenue = simRetained * 15;
  const simAnnualizedRevenue = simQuarterlyRenewRevenue * 4;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 antialiased font-sans">
      
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-[#0a0a0c]/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Scoredeck Platform
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                Executive Retention & Telemetry Suite
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

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Section 1: 5 Clean Metric Cards (Flat, No Glow) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Modeled ARR */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#111114]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Modeled ARR</span>
              <span className="text-[9px] font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded">+24.8% YoY</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">$152,727</div>
            <div className="text-[11px] text-zinc-400 mt-2 font-mono flex items-center justify-between">
              <span>MRR: <strong className="text-zinc-200 font-medium">$12,727</strong></span>
              <span className="text-zinc-500">Run-Rate</span>
            </div>
          </div>

          {/* Card 2: Active User Base */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#111114]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Active User Base</span>
              <span className="text-[9px] font-mono font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">Organic</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">124,779</div>
            <div className="text-[11px] text-zinc-400 mt-2 font-mono">
              <span className="text-zinc-200">82% Activated</span> · <span className="text-zinc-400">18% Unactivated</span>
            </div>
          </div>

          {/* Card 3: 1st-Cycle Retention */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#111114]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">1st-Cycle Retention</span>
              <span className="text-[9px] font-mono font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">3-Mo Logo</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">78.0%</div>
            <div className="text-[11px] text-zinc-400 mt-2 font-mono">
              <span className="text-zinc-200">780 / 1k Retained</span> · <span className="text-zinc-400">22% Churn</span>
            </div>
          </div>

          {/* Card 4: Paid Subscribers */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#111114]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Paid Subscribers</span>
              <span className="text-[9px] font-mono font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">3,376 Total</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">3,376</div>
            <div className="text-[11px] text-zinc-400 mt-2 font-mono">
              <span>2,347 Qtr · 243 Ann · 786 Life</span>
            </div>
          </div>

          {/* Card 5: Monetization Rate */}
          <div className="p-5 rounded-xl border border-zinc-800 bg-[#111114]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Monetization Rate</span>
              <span className="text-[9px] font-mono font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">4.8 Wks Avg</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">~5.0%</div>
            <div className="text-[11px] text-zinc-400 mt-2 font-mono">
              <span className="text-zinc-400">Conversion Window: </span><span className="text-zinc-200">4.8 Weeks</span>
            </div>
          </div>

        </section>

        {/* Section 2: Top Visual Telemetry Row (Live Audience | Devices | Globe) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Live Global Audience */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Global Audience
              </div>
              <div className="text-4xl font-bold font-mono text-white tracking-tight">
                {liveAudience.toLocaleString()}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-4">
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
          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
                Device Distribution
              </div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                72.4% <span className="text-sm font-normal text-zinc-400">Desktop Primary</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800/80 space-y-3 text-xs font-mono">
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
          <div className="rounded-2xl border border-zinc-800 bg-[#111114] overflow-hidden flex flex-col relative min-h-[260px]">
            <div className="p-4 border-b border-zinc-800/80 bg-[#141417] flex justify-between items-center z-10">
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

        {/* Section 3: Customer Lifecycle Funnel Visualizer (Stages 1-5) */}
        <section className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-2">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                Customer Lifecycle Funnel Matrix
              </h2>
              <p className="text-xs text-zinc-400">
                End-to-end user conversion, activation, and renewal retention flow
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded">
              Active Pool: <strong className="text-white">124,779</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            
            {/* Stage 1 */}
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418] space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-400">1. Total Signups</div>
              <div className="text-xl font-bold font-mono text-white">124,779</div>
              <div className="text-[11px] text-zinc-400">Total registered pool</div>
            </div>

            {/* Stage 2 */}
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418] space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-400">2. Activated (Opened)</div>
              <div className="text-xl font-bold font-mono text-white">82.0%</div>
              <div className="text-[11px] text-zinc-400">102,318 opened app (18% never opened)</div>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418] space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-400">3. Free → Paid Rate</div>
              <div className="text-xl font-bold font-mono text-white">~5.0%</div>
              <div className="text-[11px] text-zinc-400">4.8 weeks avg time to convert</div>
            </div>

            {/* Stage 4 */}
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418] space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-400">4. 1st-Cycle Retention</div>
              <div className="text-xl font-bold font-mono text-emerald-400">78.0%</div>
              <div className="text-[11px] text-zinc-400">780 of 1k cohort renew after 3-mo cycle</div>
            </div>

            {/* Stage 5 */}
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418] space-y-2">
              <div className="text-[10px] font-mono uppercase text-zinc-400">5. 1st-Cycle Churn</div>
              <div className="text-xl font-bold font-mono text-zinc-300">22.0%</div>
              <div className="text-[11px] text-zinc-400">220 leave at 1st quarterly renewal</div>
            </div>

          </div>
        </section>

        {/* Section 4: 2-Column Split: Detailed Retention Matrix & Cohort Simulator */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Full Retention & Churn Table (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                  Retention & Churn Report Data
                </h2>
                <span className="text-xs font-mono text-zinc-400">1st Cycle (3 Months)</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                      <th className="pb-2.5 font-medium">Metric</th>
                      <th className="pb-2.5 font-medium text-right">Rate</th>
                      <th className="pb-2.5 font-medium text-right">Per 1,000 Cohort</th>
                      <th className="pb-2.5 font-medium">Metric Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono">
                    <tr>
                      <td className="py-3 font-sans font-medium text-white">First-cycle retention</td>
                      <td className="py-3 text-right text-emerald-400 font-bold">78.0%</td>
                      <td className="py-3 text-right text-zinc-200">780</td>
                      <td className="py-3 font-sans text-zinc-400">Paid subscribers renewing after 3 months</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-sans font-medium text-white">First-cycle drop/churn</td>
                      <td className="py-3 text-right text-zinc-300 font-bold">22.0%</td>
                      <td className="py-3 text-right text-zinc-200">220</td>
                      <td className="py-3 font-sans text-zinc-400">Paid drop-off at first $15 renewal</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-sans font-medium text-white">First-cycle duration</td>
                      <td className="py-3 text-right text-zinc-200">3 Months</td>
                      <td className="py-3 text-right text-zinc-400">Quarterly</td>
                      <td className="py-3 font-sans text-zinc-400">Standard quarterly billing period</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-sans font-medium text-white">Never opened after install</td>
                      <td className="py-3 text-right text-zinc-300">18.0%</td>
                      <td className="py-3 text-right text-zinc-200">180</td>
                      <td className="py-3 font-sans text-zinc-400">Activation drop-off (not churn)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-sans font-medium text-white">Opened app at least once</td>
                      <td className="py-3 text-right text-zinc-200">82.0%</td>
                      <td className="py-3 text-right text-zinc-200">820</td>
                      <td className="py-3 font-sans text-zinc-400">Activated user pool</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-sans font-medium text-white">Free → Paid conversion</td>
                      <td className="py-3 text-right text-zinc-200">~5.0%</td>
                      <td className="py-3 text-right text-zinc-200">~50</td>
                      <td className="py-3 font-sans text-zinc-400">Converted within 4.8 weeks</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Strategic Insights */}
              <div className="pt-3 border-t border-zinc-800 text-xs space-y-2 text-zinc-300">
                <p>
                  <strong className="text-white">What this means:</strong> Out of every 1,000 users who enter the first-cycle cohort, <strong>780 remain</strong> after the first 3-month cycle, and <strong>220 leave</strong>.
                </p>
                <p className="text-zinc-400">
                  Separately, approximately <strong>180 per 1,000 never open the app at all</strong>. This 18% figure is activation drop-off, not subscription churn.
                </p>
              </div>
            </div>

            {/* Subscriber Distribution & Revenue Matrix */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] space-y-4">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono border-b border-zinc-800 pb-3">
                Paid Subscriber Distribution
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418]">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Quarterly ($15/qtr)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">2,347</div>
                  <div className="text-[11px] text-zinc-400 mt-1">1,831 renew (78% retention)</div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418]">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Annual ($49/yr)</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">243</div>
                  <div className="text-[11px] text-zinc-400 mt-1">High annual retention</div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#141418]">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Founding Lifetime</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">786</div>
                  <div className="text-[11px] text-zinc-400 mt-1">$29 founding base</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Cohort Simulator & Strategic Levers (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interactive Cohort Simulator */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
                  Cohort Renewal Simulator
                </h2>
                <span className="text-xs font-mono text-emerald-400">78% Retention</span>
              </div>

              {/* Cohort Size Buttons */}
              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
                  Select Cohort Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1000, 2347, 5000, 10000].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedCohortSize(size)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-colors border ${
                        selectedCohortSize === size
                          ? "bg-zinc-100 text-zinc-900 font-bold border-white"
                          : "bg-zinc-900/80 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {size.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Projection Results */}
              <div className="space-y-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-lg border border-zinc-800/80 bg-[#141418] flex justify-between items-center">
                  <span className="text-zinc-400 font-sans">Retained Subscribers (78%):</span>
                  <span className="text-emerald-400 font-bold text-sm">{simRetained.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-lg border border-zinc-800/80 bg-[#141418] flex justify-between items-center">
                  <span className="text-zinc-400 font-sans">Churned Subscribers (22%):</span>
                  <span className="text-zinc-300 font-bold text-sm">{simChurned.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-lg border border-zinc-800/80 bg-[#141418] flex justify-between items-center">
                  <span className="text-zinc-400 font-sans">Quarterly Renewal Revenue:</span>
                  <span className="text-white font-bold text-sm">${simQuarterlyRenewRevenue.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-lg border border-zinc-800/80 bg-[#141418] flex justify-between items-center">
                  <span className="text-zinc-400 font-sans">Annualized Cohort Run-Rate:</span>
                  <span className="text-white font-bold text-sm">${simAnnualizedRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Strategic Growth Levers */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] space-y-3">
              <h2 className="text-sm font-bold text-white tracking-tight uppercase font-mono border-b border-zinc-800 pb-2.5">
                Executive Recommendations
              </h2>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="p-3 rounded-lg border border-zinc-800/70 bg-[#141418]">
                  <strong className="text-white block mb-1">1. Activation Campaign (18% Opportunity)</strong>
                  <p className="text-zinc-400">
                    Recovering even 6% of unactivated users adds <strong>+600 active users</strong> per 10k cohort into the 5% conversion funnel.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-zinc-800/70 bg-[#141418]">
                  <strong className="text-white block mb-1">2. Day 75 Pre-Renewal Push (22% Churn)</strong>
                  <p className="text-zinc-400">
                    Targeted renewal campaigns 15 days before the first 3-month cycle can boost retention from 78% to 82% with $0 CAC.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* Section 5: Bottom Row: Live Match Streams & Registered Members Directory */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Match Telemetry Streams */}
          <div className="rounded-2xl border border-zinc-800 bg-[#111114] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 bg-[#141417] flex justify-between items-center">
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
          <div className="rounded-2xl border border-zinc-800 bg-[#111114] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 bg-[#141417] flex justify-between items-center">
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

            <div className="p-3 border-t border-zinc-800 bg-[#141417] text-center">
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
