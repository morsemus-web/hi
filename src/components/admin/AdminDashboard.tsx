"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import dynamic from "next/dynamic";

// Dynamically import the Globe with SSR disabled to prevent hydration or mounting errors
const GlobeView = dynamic(() => import("./GlobeView"), { 
  ssr: false, 
  loading: () => (
    <div className="w-[400px] h-[400px] max-w-full flex items-center justify-center text-neutral-600 font-mono text-sm animate-pulse">
      INITIALIZING GEOSPATIAL DATA...
    </div>
  ) 
});

/* ========================================================
   MOCK DATA GENERATORS
   ======================================================== */
function getFluctuatingUsers(base: number, variance: number, current: number) {
  const drift = (base - current) * 0.05;
  const walk = (Math.random() - 0.5) * variance;
  return Math.floor(current + drift + walk);
}

function maskName(name: string) {
  return name.split(' ').map(part => {
    if (part.length <= 1) return part;
    return part.charAt(0) + '•'.repeat(part.length - 1);
  }).join(' ');
}

function maskEmail(email: string) {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const local = parts[0];
  const domain = parts[1];
  if (local.length <= 2) return `••@${domain}`;
  return `${local.charAt(0)}${'•'.repeat(local.length - 2)}${local.slice(-1)}@${domain}`;
}

function getRegionBadge(region: string) {
  const t1 = ['US', 'US East', 'US West', 'UK', 'Italy', 'Ireland', 'Germany', 'France', 'Spain', 'Canada'];
  const t2 = ['India', 'Japan', 'Australia', 'UAE', 'Singapore'];
  const t3 = ['South Africa', 'Nigeria', 'Brazil', 'Argentina'];
  
  if (t1.includes(region)) return { label: "Tier 1", className: "bg-blue-500/20 text-blue-300 border-blue-500/30", textClass: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" };
  if (t2.includes(region)) return { label: "Tier 2", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", textClass: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" };
  if (t3.includes(region)) return { label: "Tier 3", className: "bg-purple-500/20 text-purple-300 border-purple-500/30", textClass: "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" };
  return null;
}

const MOCK_MEMBERS = [
  { id: "SD-901", name: "Aryan Sharma", email: "aryan.s@gmail.com", region: "India", session: "4h 12m", status: "Online", tier: "Quarterly" },
  { id: "SD-902", name: "James Wilson", email: "j.wilson92@hotmail.com", region: "UK", session: "1d 5h", status: "Online", tier: "Annual" },
  { id: "SD-903", name: "David Chen", email: "dchen.sports@yahoo.com", region: "Australia", session: "Last active: 2h ago", status: "Offline", tier: "Founding Lifetime" },
  { id: "SD-904", name: "Rahul Desai", email: "rahuld88@gmail.com", region: "India", session: "6h 45m", status: "Online", tier: "Quarterly" },
  { id: "SD-905", name: "Sarah Jenkins", email: "s.jenkins.tx@gmail.com", region: "US", session: "11h 20m", status: "Online", tier: "Quarterly" },
  { id: "SD-906", name: "Ahmed Al-Fayed", email: "ahmed.alf@outlook.com", region: "UAE", session: "Last active: 5h ago", status: "Offline", tier: "Annual" },
  { id: "SD-907", name: "Marcus Rossi", email: "mrossi1999@gmail.com", region: "Italy", session: "2d 4h", status: "Online", tier: "Quarterly" },
  { id: "SD-908", name: "Priya Patel", email: "priya.p.90@yahoo.com", region: "India", session: "8h 30m", status: "Online", tier: "Founding Lifetime" },
  { id: "SD-909", name: "Liam O'Connor", email: "liam.oconnor.ire@gmail.com", region: "Ireland", session: "5h 15m", status: "Online", tier: "Quarterly" },
  { id: "SD-910", name: "Oliver Smith", email: "osmith.sports@gmail.com", region: "UK", session: "Last active: 1d ago", status: "Offline", tier: "Quarterly" },
];

function getCricketMatchAudience(title: string, status: string): number {
  const t = (title + " " + status).toLowerCase();
  
  // Tier 1: Major Internationals & Premier Franchise Leagues (IPL, World Cup, IND vs PAK, etc.)
  if (
    t.includes("ipl") || 
    t.includes("indian premier league") || 
    t.includes("world cup") || 
    t.includes("india vs") || 
    t.includes("vs india") || 
    t.includes("ashes") || 
    t.includes("australia vs england") || 
    t.includes("pakistan vs india")
  ) {
    return 650 + Math.floor(Math.random() * 950); // 650 - 1,600 viewers
  }
  
  // Tier 2: Established Leagues & Full-Member Series (BBL, PSL, CPL, SA20, Hundred, AUS, ENG, SA, etc.)
  if (
    t.includes("bbl") || 
    t.includes("psl") || 
    t.includes("cpl") || 
    t.includes("sa20") || 
    t.includes("the hundred") || 
    t.includes("blast") || 
    t.includes("england") || 
    t.includes("australia") || 
    t.includes("south africa") || 
    t.includes("new zealand") || 
    t.includes("pakistan") || 
    t.includes("west indies") || 
    t.includes("sri lanka") || 
    t.includes("bangladesh") || 
    t.includes("afghanistan")
  ) {
    return 140 + Math.floor(Math.random() * 260); // 140 - 400 viewers
  }

  // Tier 3: Smaller State/Regional/Domestic/Associate Leagues (TNPL, ECS, KPL, local leagues)
  return 14 + Math.floor(Math.random() * 55); // 14 - 69 viewers
}

function getSoccerMatchAudience(title: string, leagueName: string = ""): number {
  const t = (title + " " + leagueName).toLowerCase();
  
  // Tier 1: Top European Leagues & Champions League (UCL, Premier League, La Liga, Real Madrid, etc.)
  if (
    t.includes("champions league") || 
    t.includes("premier league") || 
    t.includes("la liga") || 
    t.includes("real madrid") || 
    t.includes("barcelona") || 
    t.includes("manchester") || 
    t.includes("arsenal") || 
    t.includes("liverpool") || 
    t.includes("bayern") || 
    t.includes("psg")
  ) {
    return 700 + Math.floor(Math.random() * 1100); // 700 - 1,800 viewers
  }

  // Tier 2: Major Secondary Leagues (Serie A, Bundesliga, MLS, Saudi Pro League, Europa League)
  if (
    t.includes("serie a") || 
    t.includes("bundesliga") || 
    t.includes("ligue 1") || 
    t.includes("europa") || 
    t.includes("mls") || 
    t.includes("saudi") || 
    t.includes("inter miami") || 
    t.includes("al hilal") || 
    t.includes("al nassr")
  ) {
    return 180 + Math.floor(Math.random() * 320); // 180 - 500 viewers
  }

  // Tier 3: Lower divisions, local cups, friendlies, reserve matches
  return 12 + Math.floor(Math.random() * 45); // 12 - 57 viewers
}

/* ========================================================
   MAIN EXECUTIVE DASHBOARD COMPONENT
   ======================================================== */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  // Base live browsing audience (concurrent online users)
  const [baseBrowsingUsers, setBaseBrowsingUsers] = useState(2850);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);

  // Interactive Cohort Simulator State
  const [selectedCohortSize, setSelectedCohortSize] = useState<number>(1000);

  // Live active concurrent audience calculation
  const activeUsers = baseBrowsingUsers + 
    cricketMatches.reduce((sum, m) => sum + m.viewers, 0) + 
    soccerMatches.reduce((sum, m) => sum + m.viewers, 0);

  // Real-time smooth fluctuation animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBaseBrowsingUsers(prev => getFluctuatingUsers(2850, 20, prev));

      setCricketMatches(matches => matches.map(m => {
        if (Math.random() > 0.4) return m;
        const delta = m.viewers > 500 ? Math.floor(Math.random() * 30) - 15 : (m.viewers > 100 ? Math.floor(Math.random() * 12) - 6 : Math.floor(Math.random() * 4) - 2);
        return { ...m, viewers: Math.max(5, m.viewers + delta) };
      }));
      setSoccerMatches(matches => matches.map(m => {
        if (Math.random() > 0.4) return m;
        const delta = m.viewers > 500 ? Math.floor(Math.random() * 30) - 15 : (m.viewers > 100 ? Math.floor(Math.random() * 12) - 6 : Math.floor(Math.random() * 4) - 2);
        return { ...m, viewers: Math.max(5, m.viewers + delta) };
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Fetch live matches
  useEffect(() => {
    async function fetchRealMatches() {
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
          const cMocks = liveC.map((m: any) => ({
            id: m.id,
            title: m.title,
            score: m.score,
            status: m.status_text,
            viewers: getCricketMatchAudience(m.title, m.status_text)
          }));
          setCricketMatches(cMocks);
        }
      } catch (e) {}

      // Soccer
      try {
        const sRes = await fetch("/api/soccer");
        const sData = await sRes.json();
        if (sData.status === "success" && Array.isArray(sData.leagues)) {
          let liveS: any[] = [];
          sData.leagues.forEach((l: any) => {
            const liveMatches = l.matches.filter((m: any) => m.status === "Live");
            liveS.push(...liveMatches.map((m: any) => ({
              id: `${m.home_team}-${m.away_team}`,
              title: `${m.home_team} vs ${m.away_team}`,
              score: `${m.home_score} - ${m.away_score}`,
              status: m.time,
              viewers: getSoccerMatchAudience(`${m.home_team} vs ${m.away_team}`, l.league_name || "")
            })));
          });
          setSoccerMatches(liveS);
        }
      } catch (e) {}
    }
    fetchRealMatches();
  }, []);

  // Members Directory State
  const [displayedMembers, setDisplayedMembers] = useState([...MOCK_MEMBERS]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreMembers = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper", "Sebastian", "Camila", "Michael", "Gianna", "Ethan", "Abigail", "Daniel", "Luna", "Matthew", "Ella"];
      const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
      const regions = ["US East", "US West", "UK", "India", "Australia", "Brazil", "Germany", "Japan", "South Africa", "Canada"];
      const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com"];
      const tiers = ["Quarterly", "Quarterly", "Quarterly", "Annual", "Founding Lifetime"];

      const newMembers = Array.from({ length: 30 }).map((_, i) => {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)];
        const last = lastNames[Math.floor(Math.random() * lastNames.length)];
        const isOnline = Math.random() > 0.3;
        const sessionHours = Math.floor(Math.random() * 48);
        const sessionMins = Math.floor(Math.random() * 60);
        
        return {
          id: `SD-${911 + displayedMembers.length + i}`,
          name: `${first} ${last}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
          region: regions[Math.floor(Math.random() * regions.length)],
          session: isOnline ? `${sessionHours > 0 ? `${sessionHours}h ` : ''}${sessionMins}m` : `Last active: ${Math.floor(Math.random() * 5) + 1}d ago`,
          status: isOnline ? "Online" : "Offline",
          tier: tiers[Math.floor(Math.random() * tiers.length)]
        };
      });
      
      setDisplayedMembers(prev => [...prev, ...newMembers]);
      setIsLoadingMore(false);
    }, 600);
  };

  // Cohort math calculation
  const retainedCohort = Math.round(selectedCohortSize * 0.78);
  const churnedCohort = Math.round(selectedCohortSize * 0.22);
  const quarterlyRevenueRetained = retainedCohort * 15;

  return (
    <div className="min-h-screen font-sans bg-[#09090b] text-neutral-200 antialiased selection:bg-emerald-500/30">
      
      {/* Top Fixed Executive Header */}
      <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-neutral-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              SD
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono">
                  SCOREDECK EXECUTIVE COMMAND CENTER
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  $1M ARR SUITE
                </span>
              </div>
              <p className="text-neutral-400 text-xs mt-0.5 font-mono">Real-Time SaaS Revenue, Cohort Retention & Telemetry Matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span className="text-neutral-500">SYSTEM TIME:</span>
              <span className="text-white font-bold">2026-08-18 UTC</span>
            </div>
            <Link 
              href="/" 
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all shadow-sm"
            >
              Exit to Site
            </Link>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-rose-950/40 text-rose-400 border border-rose-900/50 rounded-lg text-xs font-mono font-bold hover:bg-rose-900/50 transition-all shadow-sm"
            >
              End Session
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Executive KPI Cards Header Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          
          {/* Card 1: Modeled ARR */}
          <div className="bg-[#0c0c0e] p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-[0_0_30px_rgba(16,185,129,0.05)]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Modeled ARR</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">+24.8% YoY</span>
            </div>
            <div className="text-3xl font-bold font-mono text-emerald-400 tracking-tight mb-1 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              $152,727
            </div>
            <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-800/80">
              <span>MRR: <strong className="text-white">$12,727</strong></span>
              <span>Run-Rate</span>
            </div>
          </div>

          {/* Card 2: Active User Base */}
          <div className="bg-[#0c0c0e] p-6 rounded-2xl border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-500/60 transition-all shadow-[0_0_30px_rgba(6,182,212,0.05)]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Active User Base</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold border border-cyan-500/30">ORGANIC</span>
            </div>
            <div className="text-3xl font-bold font-mono text-cyan-400 tracking-tight mb-1 drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
              124,779
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-neutral-800/80">
              <span className="text-cyan-300 font-semibold">82% Activated</span>
              <span className="text-rose-400 font-medium">18% Unactivated</span>
            </div>
          </div>

          {/* Card 3: First-Cycle Retention */}
          <div className="bg-[#0c0c0e] p-6 rounded-2xl border border-violet-500/30 relative overflow-hidden group hover:border-violet-500/60 transition-all shadow-[0_0_30px_rgba(139,92,246,0.05)]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all pointer-events-none" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">1st-Cycle Retention</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono font-bold border border-violet-500/30">3-MO LOGO</span>
            </div>
            <div className="text-3xl font-bold font-mono text-violet-400 tracking-tight mb-1 drop-shadow-[0_0_12px_rgba(167,139,250,0.4)]">
              78.0%
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-neutral-800/80">
              <span className="text-violet-300">780 / 1k Retained</span>
              <span className="text-rose-400 font-medium">22% Churn</span>
            </div>
          </div>

          {/* Card 4: Paid Subscriber Base */}
          <div className="bg-[#0c0c0e] p-6 rounded-2xl border border-blue-500/30 relative overflow-hidden group hover:border-blue-500/60 transition-all shadow-[0_0_30px_rgba(59,130,246,0.05)]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Paid Subscribers</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-bold border border-blue-500/30">3,376 TOTAL</span>
            </div>
            <div className="text-3xl font-bold font-mono text-blue-400 tracking-tight mb-1 drop-shadow-[0_0_12px_rgba(96,165,250,0.4)]">
              3,376
            </div>
            <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-800/80">
              <span>2,347 Qtr</span>
              <span>243 Ann</span>
              <span>786 Life</span>
            </div>
          </div>

          {/* Card 5: Free -> Paid Conversion */}
          <div className="bg-[#0c0c0e] p-6 rounded-2xl border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-[0_0_30px_rgba(245,158,11,0.05)]">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Monetization Rate</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold border border-amber-500/30">4.8 WKS AVG</span>
            </div>
            <div className="text-3xl font-bold font-mono text-amber-400 tracking-tight mb-1 drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]">
              ~5.0%
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-neutral-800/80">
              <span className="text-amber-300">Conversion Window</span>
              <span className="text-neutral-400">4.8 Weeks</span>
            </div>
          </div>

        </section>

        {/* Section 1: Executive Customer Lifecycle & Retention Intelligence */}
        <section className="bg-[#0c0c0e] p-8 rounded-2xl border border-neutral-800/90 space-y-8 relative overflow-hidden shadow-xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Executive Retention & Lifecycle Report
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Customer Lifecycle Funnel & Retention Intelligence
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                Precision separation of Activation Drop-off (unactivated signups) from Subscription Churn (first 3-month cycle non-renewals).
              </p>
            </div>

            <div className="bg-[#141417] px-5 py-3 rounded-xl border border-neutral-800 flex items-center gap-6 shrink-0 shadow-inner">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Modeled ARR Run-Rate</span>
                <span className="text-xl font-bold font-mono text-emerald-400">$152,727</span>
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">Paid Subscriber Breakdown</span>
                <span className="text-xs font-mono text-neutral-200">2,347 Quarterly ($15/qtr) | 243 Annual | 786 Lifetime</span>
              </div>
            </div>
          </div>

          {/* Visual Step-by-Step Funnel Flow */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Complete Customer Lifecycle Funnel Architecture
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Funnel Stage 1 */}
              <div className="bg-[#141417] p-5 rounded-xl border border-neutral-800 flex flex-col justify-between hover:border-neutral-700 transition-all">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Stage 1 — Acquisition</span>
                  <h4 className="text-sm font-bold text-white mb-2">Active User Base</h4>
                  <div className="text-2xl font-bold font-mono text-neutral-100 mb-2">124,779</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/80">
                  Organic acquisition base across web & desktop apps
                </div>
              </div>

              {/* Funnel Stage 2 */}
              <div className="bg-[#141417] p-5 rounded-xl border border-blue-900/40 flex flex-col justify-between hover:border-blue-700/60 transition-all">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block mb-1">Stage 2 — Activation</span>
                  <h4 className="text-sm font-bold text-white mb-2">App Activation</h4>
                  <div className="text-2xl font-bold font-mono text-blue-400 mb-2">82%</div>
                </div>
                <div className="space-y-1.5 pt-3 border-t border-neutral-800/80">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Opened App:</span>
                    <span className="text-blue-300 font-mono font-bold">82% (102,318)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-rose-400 font-medium">Never Opened:</span>
                    <span className="text-rose-400 font-mono font-bold">18% (22,461)</span>
                  </div>
                </div>
              </div>

              {/* Funnel Stage 3 */}
              <div className="bg-[#141417] p-5 rounded-xl border border-amber-900/40 flex flex-col justify-between hover:border-amber-700/60 transition-all">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">Stage 3 — Monetization</span>
                  <h4 className="text-sm font-bold text-white mb-2">Free → Paid Conversion</h4>
                  <div className="text-2xl font-bold font-mono text-amber-400 mb-2">~5.0%</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/80">
                  Conversion duration takes <strong className="text-amber-300 font-mono">4.8 weeks</strong> on average
                </div>
              </div>

              {/* Funnel Stage 4 */}
              <div className="bg-[#141417] p-5 rounded-xl border border-emerald-900/40 flex flex-col justify-between hover:border-emerald-700/60 transition-all">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">Stage 4 — Retention</span>
                  <h4 className="text-sm font-bold text-white mb-2">1st 3-Mo Retention</h4>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mb-2">78.0%</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/80">
                  <strong className="text-emerald-300 font-mono">780 of 1,000</strong> subscribers survive first 3-month renewal
                </div>
              </div>

              {/* Funnel Stage 5 */}
              <div className="bg-[#141417] p-5 rounded-xl border border-rose-900/40 flex flex-col justify-between hover:border-rose-700/60 transition-all">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block mb-1">Stage 5 — Churn</span>
                  <h4 className="text-sm font-bold text-white mb-2">1st 3-Mo Churn</h4>
                  <div className="text-2xl font-bold font-mono text-rose-400 mb-2">22.0%</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/80">
                  Primary recurring-revenue leakage point ($15/qtr cycle)
                </div>
              </div>
            </div>
          </div>

          {/* Retention & Lifecycle Executive Matrix Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-mono mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Executive Retention & Lifecycle Metric Matrix
            </h3>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-[#141417]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] uppercase font-mono tracking-widest text-neutral-400 bg-neutral-900/90">
                    <th className="py-3.5 px-5 font-semibold">Funnel Stage / Metric</th>
                    <th className="py-3.5 px-5 font-semibold">Current Rate</th>
                    <th className="py-3.5 px-5 font-semibold">Duration / Cycle</th>
                    <th className="py-3.5 px-5 font-semibold">Executive & Strategic Takeaway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70 text-xs font-sans">
                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Signup → First Open (Activation Rate)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-blue-400 font-bold text-sm">82%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">Immediate</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      82% of signups open the app. 18% never open (Unactivated Users). Reducing gap to 12% activates +600 users/10k signups into monetization.
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Never Opened (Activation Drop-off)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-400 font-bold text-sm">18%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">Post-Install</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Classified as unactivated rather than churned. These users installed but never opened the product experience.
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Free → Paid Monetization Conversion
                    </td>
                    <td className="py-3.5 px-5 font-mono text-amber-400 font-bold text-sm">~5.0%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">4.8 Weeks Avg</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Monetization conversion window spans ~4.8 weeks. Converts organic free users into the 3,376 paid subscriber base.
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      First 3-Month Retention (Renewal Rate)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-emerald-400 font-bold text-sm">78.0%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">3 Months</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Primary retention metric. 78% of paying customers survive the initial 3-month renewal cycle (780 of 1k cohort stay).
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      First 3-Month Churn (Non-Renewal)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-400 font-bold text-sm">22.0%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">Quarterly ($15/qtr)</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Primary recurring-revenue leakage point. 220 of 1k paid subscribers leave at 1st quarterly renewal ($15/qtr cycle).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Cohort Simulator & Growth Levers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Cohort Simulator */}
            <div className="bg-[#141417] p-6 rounded-xl border border-neutral-800 space-y-5">
              <div className="flex justify-between items-center border-b border-neutral-800/80 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">First-Cycle Cohort Renewal Simulator</h4>
                  <p className="text-[11px] text-neutral-400">Model subscriber retention & revenue survival across paid cohorts</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                  78.0% SURVIVAL
                </span>
              </div>

              {/* Cohort Selector Buttons */}
              <div className="flex flex-wrap gap-2">
                {[1000, 2347, 5000, 10000].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedCohortSize(size)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-all border ${
                      selectedCohortSize === size
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold shadow-[0_0_12px_rgba(52,211,153,0.25)]"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    {size === 2347 ? "2,347 (Current Qtr Base)" : `${size.toLocaleString()} Cohort`}
                  </button>
                ))}
              </div>

              {/* Result Display */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-neutral-900/80 p-4 rounded-xl border border-emerald-900/40">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Retained</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{retainedCohort.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">78% Renewed after 3mo</span>
                </div>

                <div className="bg-neutral-900/80 p-4 rounded-xl border border-rose-900/40">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Churned</span>
                  <div className="text-2xl font-bold font-mono text-rose-400">{churnedCohort.toLocaleString()}</div>
                  <span className="text-[10px] text-rose-400/80 font-mono mt-1 block">22% Non-renewal loss</span>
                </div>

                <div className="bg-neutral-900/80 p-4 rounded-xl border border-blue-900/40">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">Retained Qtr ARR</span>
                  <div className="text-2xl font-bold font-mono text-blue-400">${quarterlyRevenueRetained.toLocaleString()}</div>
                  <span className="text-[10px] text-blue-400/80 font-mono mt-1 block">$15/qtr renewal rate</span>
                </div>
              </div>
            </div>

            {/* Growth Levers */}
            <div className="bg-[#141417] p-6 rounded-xl border border-neutral-800 space-y-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-neutral-800/80 pb-4 mb-4">
                  <h4 className="text-sm font-bold text-white">Dual Executive Growth Levers</h4>
                  <p className="text-[11px] text-neutral-400">High-impact revenue & retention levers identified in executive analysis</p>
                </div>

                <div className="space-y-4">
                  {/* Lever 1 */}
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-blue-300">1. Activation Lever (18% → 12% Gap Reduction)</span>
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-bold">+600 Users / 10k</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Reducing the unactivated "never-opened" rate from 18% to 12% activates 600 additional users per 10k signups directly into the ~5% monetization funnel.
                    </p>
                  </div>

                  {/* Lever 2 */}
                  <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-emerald-300">2. Retention Engine (78% → 82% Renewal Boost)</span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">+400 Paid / 10k</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Improving 1st-cycle retention from 78% to 82% retains 400 additional paying subscribers per 10k cohort ($6,000+ quarterly ARR) without additional user acquisition spend.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Section 2: Live Global Telemetry & Audience Matrix Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Users Card */}
          <div className="bg-[#0c0c0e] p-8 rounded-2xl border border-neutral-800/90 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700 pointer-events-none" />
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 font-mono">Live Global Audience</h2>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
                {activeUsers.toLocaleString()}
              </span>
              <span className="mb-2 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
                  <span className="uppercase tracking-wider">Avg Session Time</span>
                  <span className="text-white font-medium">43m 12s</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800/90 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-cyan-500 rounded-full" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-800/60">
                <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
                  <span className="uppercase tracking-wider font-semibold">Traffic Matrix</span>
                </div>
                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden w-full">
                  <div className="w-[64%] h-full bg-emerald-500 hover:opacity-80 transition-opacity cursor-help" title="Direct 64%" />
                  <div className="w-[24%] h-full bg-cyan-500 hover:opacity-80 transition-opacity cursor-help" title="Social 24%" />
                  <div className="w-[12%] h-full bg-amber-500 hover:opacity-80 transition-opacity cursor-help" title="Referral 12%" />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-neutral-400 font-mono">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>Direct (64%)</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"/>Social (24%)</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full"/>Ref (12%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-[#0c0c0e] p-8 rounded-2xl border border-neutral-800/90 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-8 font-mono">Device & OS Distribution</h2>
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> Desktop (Windows / Mac)
                    </span>
                    <span className="text-neutral-300 font-mono font-bold">72.4%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[72.4%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" /> Mobile (iOS / Android)
                    </span>
                    <span className="text-neutral-300 font-mono font-bold">21.1%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[21.1%] h-full bg-purple-500 rounded-full" />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" /> Tablet & Web App
                    </span>
                    <span className="text-neutral-300 font-mono font-bold">6.5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[6.5%] h-full bg-amber-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800/80 text-[10px] text-neutral-400 font-mono flex justify-between">
              <span>Platform Specs: Windows 68% | Mac 18%</span>
              <span className="text-emerald-400">Optimal UX</span>
            </div>
          </div>

          {/* Globe Visualization */}
          <div className="bg-[#0c0c0e] p-8 rounded-2xl border border-neutral-800/90 relative overflow-hidden flex flex-col items-center">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 font-mono w-full text-left">Global Geospatial Hotspots</h2>
            <p className="text-[10px] text-neutral-400 mb-4 w-full text-left">Real-time geospatial plotting of active sessions across Tier 1, 2, and 3 markets</p>
            <div className="flex-1 w-full flex items-center justify-center">
              <GlobeView />
            </div>
          </div>
        </section>

        {/* Section 3: Operations & User Directory */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Match Tracker */}
          <div className="bg-[#0c0c0e] rounded-2xl border border-neutral-800/90 overflow-hidden flex flex-col shadow-lg">
            <div className="px-6 py-4 border-b border-neutral-800 bg-[#141417] flex justify-between items-center">
              <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Stream Connection Telemetry
              </h2>
              <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded border border-neutral-700 uppercase tracking-widest">
                {cricketMatches.length + soccerMatches.length} Streams Active
              </span>
            </div>
            
            <div className="divide-y divide-neutral-800/60 overflow-y-auto max-h-[500px] flex-1">
              {cricketMatches.length === 0 && soccerMatches.length === 0 && (
                <div className="p-8 text-center text-neutral-500 text-sm font-mono">
                  NO ACTIVE TELEMETRY STREAMS
                </div>
              )}

              {cricketMatches.map((match) => (
                <div key={match.id} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-neutral-800/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">CRICKET • {match.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-100">{match.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{match.score}</p>
                  </div>
                  <div className="flex items-center gap-4 md:text-right shrink-0">
                    <div className="hidden md:block w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, Math.max(5, (match.viewers / 1200) * 100))}%` }} />
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-lg font-bold font-mono text-white transition-all duration-300">
                        {match.viewers.toLocaleString()}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-neutral-400">Watching</div>
                    </div>
                  </div>
                </div>
              ))}

              {soccerMatches.map((match) => (
                <div key={match.id} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-neutral-800/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">SOCCER • {match.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-100">{match.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{match.score}</p>
                  </div>
                  <div className="flex items-center gap-4 md:text-right shrink-0">
                    <div className="hidden md:block w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, Math.max(5, (match.viewers / 1500) * 100))}%` }} />
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-lg font-bold font-mono text-white transition-all duration-300">
                        {match.viewers.toLocaleString()}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-neutral-400">Watching</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-[#0c0c0e] rounded-2xl border border-neutral-800/90 overflow-hidden flex flex-col shadow-lg">
            <div className="px-6 py-4 border-b border-neutral-800 bg-[#141417] flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xs font-bold text-neutral-200 uppercase tracking-widest font-mono">Registered Members Directory</h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded">
                Active Pool: 124,779
              </span>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#141417] backdrop-blur z-10">
                  <tr className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono border-b border-neutral-800">
                    <th className="px-6 py-3 font-medium">User Credentials</th>
                    <th className="px-6 py-3 font-medium">Region & Tier</th>
                    <th className="px-6 py-3 font-medium">Session & Plan</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-sm">
                  {displayedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-300 border border-neutral-700/80">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-100">{maskName(member.name)}</div>
                            <div className="text-xs text-neutral-400 font-mono">{maskEmail(member.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={getRegionBadge(member.region)?.textClass || "text-neutral-300 font-medium"}>
                            {member.region}
                          </span>
                          {getRegionBadge(member.region) && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest border font-mono ${getRegionBadge(member.region)?.className}`}>
                              {getRegionBadge(member.region)?.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="space-y-0.5">
                          <div className={`text-[10px] font-mono uppercase tracking-widest ${
                            member.status === 'Online' ? 'text-emerald-400 font-bold' : 'text-neutral-400'
                          }`}>
                            {member.session}
                          </div>
                          <div className="text-[9px] font-mono text-neutral-400">{member.tier}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Online' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                          <span className={`text-xs font-mono ${member.status === 'Online' ? 'text-emerald-400 font-bold' : 'text-neutral-400'}`}>{member.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-neutral-800 bg-[#141417] text-center shrink-0">
              <button 
                onClick={loadMoreMembers}
                disabled={isLoadingMore}
                className="text-[10px] uppercase tracking-widest font-mono text-neutral-300 hover:text-white transition-colors disabled:opacity-50 font-bold bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg"
              >
                {isLoadingMore ? "Loading Directory..." : "Load More Members..."}
              </button>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
