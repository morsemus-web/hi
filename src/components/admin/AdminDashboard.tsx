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
  { id: "SD-901", name: "Aryan Sharma", email: "aryan.s@gmail.com", region: "India", session: "4h 12m", status: "Online" },
  { id: "SD-902", name: "James Wilson", email: "j.wilson92@hotmail.com", region: "UK", session: "1d 5h", status: "Online" },
  { id: "SD-903", name: "David Chen", email: "dchen.sports@yahoo.com", region: "Australia", session: "Last active: 2h ago", status: "Offline" },
  { id: "SD-904", name: "Rahul Desai", email: "rahuld88@gmail.com", region: "India", session: "6h 45m", status: "Online" },
  { id: "SD-905", name: "Sarah Jenkins", email: "s.jenkins.tx@gmail.com", region: "US", session: "11h 20m", status: "Online" },
  { id: "SD-906", name: "Ahmed Al-Fayed", email: "ahmed.alf@outlook.com", region: "UAE", session: "Last active: 5h ago", status: "Offline" },
  { id: "SD-907", name: "Marcus Rossi", email: "mrossi1999@gmail.com", region: "Italy", session: "2d 4h", status: "Online" },
  { id: "SD-908", name: "Priya Patel", email: "priya.p.90@yahoo.com", region: "India", session: "8h 30m", status: "Online" },
  { id: "SD-909", name: "Liam O'Connor", email: "liam.oconnor.ire@gmail.com", region: "Ireland", session: "5h 15m", status: "Online" },
  { id: "SD-910", name: "Oliver Smith", email: "osmith.sports@gmail.com", region: "UK", session: "Last active: 1d ago", status: "Offline" },
];

/* ========================================================
   MAIN COMPONENT
   ======================================================== */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [baseBrowsingUsers, setBaseBrowsingUsers] = useState(2450);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);

  // Cohort Simulator State
  const [selectedCohortSize, setSelectedCohortSize] = useState<number>(1000);

  // Calculate total active users based on live match viewers + base browsing users
  const activeUsers = baseBrowsingUsers + 
    cricketMatches.reduce((sum, m) => sum + m.viewers, 0) + 
    soccerMatches.reduce((sum, m) => sum + m.viewers, 0);

  // Real-time animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate the base browsing users slightly and smoothly
      setBaseBrowsingUsers(prev => getFluctuatingUsers(2450, 15, prev));

      setCricketMatches(matches => matches.map(m => {
        if (Math.random() > 0.4) return m; // Updates less frequently
        return { ...m, viewers: Math.max(0, m.viewers + Math.floor(Math.random() * 80) - 25) };
      }));
      setSoccerMatches(matches => matches.map(m => {
        if (Math.random() > 0.4) return m;
        return { ...m, viewers: Math.max(0, m.viewers + Math.floor(Math.random() * 120) - 40) };
      }));
    }, 8000); // 8 seconds instead of 2.5s for realistic slow polling

    return () => clearInterval(interval);
  }, []);

  // Fetch real matches and assign mock viewers
  useEffect(() => {
    async function fetchRealMatches() {
      // Cricket
      try {
        const cRes = await fetch("/api/cricket");
        const cData = await cRes.json();
        if (cData.status === "success" && Array.isArray(cData.matches)) {
          const liveC = cData.matches.filter((m: any) => m.status_text && (m.status_text.toLowerCase().includes("ov") || m.status_text.toLowerCase().includes("need")));
          const cMocks = liveC.map((m: any) => ({
            id: m.id,
            title: m.title,
            score: m.score,
            status: m.status_text,
            viewers: 25000 + Math.floor(Math.random() * 55000)
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
              viewers: 45000 + Math.floor(Math.random() * 80000)
            })));
          });
          setSoccerMatches(liveS);
        }
      } catch (e) {}
    }
    fetchRealMatches();
  }, []);

  // Members Table State
  const [displayedMembers, setDisplayedMembers] = useState([...MOCK_MEMBERS]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMoreMembers = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper", "Sebastian", "Camila", "Michael", "Gianna", "Ethan", "Abigail", "Daniel", "Luna", "Matthew", "Ella"];
      const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"];
      const regions = ["US East", "US West", "UK", "India", "Australia", "Brazil", "Germany", "Japan", "South Africa", "Canada"];
      const domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com"];
      
      const newMembers = Array.from({ length: 40 }).map((_, i) => {
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
          status: isOnline ? "Online" : "Offline"
        };
      });
      
      setDisplayedMembers(prev => [...prev, ...newMembers]);
      setIsLoadingMore(false);
    }, 600);
  };

  // Cohort math calculation
  const retainedCohort = Math.round(selectedCohortSize * 0.78);
  const churnedCohort = Math.round(selectedCohortSize * 0.22);

  return (
    // FORCED DARK MODE CONTAINER: bg-neutral-950, text-white
    <div className="min-h-screen font-sans bg-neutral-950 text-neutral-200">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Scoredeck Platform
            </h1>
            <p className="text-neutral-400 text-sm mt-1 uppercase tracking-widest font-mono">Live Telemetry & Retention Intelligence</p>
          </div>
          <div className="flex gap-4">
            <Link href="/" className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm font-medium hover:bg-neutral-800 hover:text-white transition-colors">
              Exit to Site
            </Link>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-red-950/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-medium hover:bg-red-900/40 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Executive KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* First-Cycle Retention */}
          <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">First-Cycle Retention</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">3-MONTH CYCLE</span>
            </div>
            <div className="text-4xl font-bold font-mono text-emerald-400 tracking-tight mb-2 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              78%
            </div>
            <p className="text-xs text-neutral-400">780 of 1,000 subscribers renew after first 3-month cycle</p>
          </div>

          {/* First-Cycle Churn */}
          <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 relative overflow-hidden group hover:border-rose-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">First-Cycle Churn</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-mono font-bold">RENEWAL LEAKAGE</span>
            </div>
            <div className="text-4xl font-bold font-mono text-rose-400 tracking-tight mb-2 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]">
              22%
            </div>
            <p className="text-xs text-neutral-400">220 of 1,000 subscribers drop off at 1st renewal ($15/qtr)</p>
          </div>

          {/* Activation Rate */}
          <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Activation Rate</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold">OPENED APP</span>
            </div>
            <div className="text-4xl font-bold font-mono text-blue-400 tracking-tight mb-2 drop-shadow-[0_0_12px_rgba(96,165,250,0.3)]">
              82%
            </div>
            <p className="text-xs text-neutral-400">18% never open app after install (Unactivated Users)</p>
          </div>

          {/* Monetization Conversion */}
          <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">Free → Paid Rate</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold">4.8 WKS AVG</span>
            </div>
            <div className="text-4xl font-bold font-mono text-amber-400 tracking-tight mb-2 drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
              ~5%
            </div>
            <p className="text-xs text-neutral-400">Modeled ARR: $152,727 across 3,376 paid subscribers</p>
          </div>

        </div>

        {/* Executive Retention & Customer Lifecycle Section */}
        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 space-y-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Updated Retention & Lifecycle Intelligence
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Customer Lifecycle Funnel & Retention Analysis
              </h2>
              <p className="text-neutral-400 text-xs mt-1">
                Distinct breakdown separating Activation Drop-off (unactivated signups) from Subscription Churn (paid cycle renewals).
              </p>
            </div>

            {/* Modeled ARR Summary Badge */}
            <div className="bg-neutral-950 px-5 py-3 rounded-xl border border-neutral-800 flex items-center gap-6 shrink-0">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">Modeled ARR</span>
                <span className="text-xl font-bold font-mono text-emerald-400">$152,727</span>
              </div>
              <div className="h-8 w-px bg-neutral-800" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">Subscriber Base</span>
                <span className="text-xs font-mono text-neutral-200">2,347 Qtr | 243 Ann | 786 Lifetime</span>
              </div>
            </div>
          </div>

          {/* Visual Funnel Component */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-mono mb-4">
              Complete Customer Funnel & Leakage Points
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Funnel Stage 1 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Stage 1</span>
                  <h4 className="text-sm font-bold text-white mb-2">Active User Base</h4>
                  <div className="text-2xl font-bold font-mono text-neutral-200 mb-2">124,779</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/60">
                  Organic acquisition base across web & desktop app
                </div>
              </div>

              {/* Funnel Stage 2 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-blue-900/40 relative flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block mb-1">Stage 2</span>
                  <h4 className="text-sm font-bold text-white mb-2">App Activation</h4>
                  <div className="text-2xl font-bold font-mono text-blue-400 mb-2">82%</div>
                </div>
                <div className="space-y-1.5 pt-3 border-t border-neutral-800/60">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Opened App:</span>
                    <span className="text-blue-300 font-mono font-bold">82%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-rose-400 font-medium">Never Opened:</span>
                    <span className="text-rose-400 font-mono font-bold">18%</span>
                  </div>
                </div>
              </div>

              {/* Funnel Stage 3 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-amber-900/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block mb-1">Stage 3</span>
                  <h4 className="text-sm font-bold text-white mb-2">Monetization</h4>
                  <div className="text-2xl font-bold font-mono text-amber-400 mb-2">~5%</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/60">
                  Free → Paid conversion rate (Avg <span className="text-amber-300 font-mono">4.8 wks</span> to convert)
                </div>
              </div>

              {/* Funnel Stage 4 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-emerald-900/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">Stage 4</span>
                  <h4 className="text-sm font-bold text-white mb-2">1st Cycle Retention</h4>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mb-2">78%</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/60">
                  3-Month logo retention rate (780 per 1k cohort stay)
                </div>
              </div>

              {/* Funnel Stage 5 */}
              <div className="bg-neutral-950 p-5 rounded-xl border border-rose-900/40 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block mb-1">Stage 5</span>
                  <h4 className="text-sm font-bold text-white mb-2">1st Cycle Churn</h4>
                  <div className="text-2xl font-bold font-mono text-rose-400 mb-2">22%</div>
                </div>
                <div className="text-[11px] text-neutral-400 pt-3 border-t border-neutral-800/60">
                  Primary recurring revenue leakage point ($15/qtr cycle)
                </div>
              </div>
            </div>
          </div>

          {/* Retention & Lifecycle Executive Report Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 font-mono mb-4">
              Retention & Lifecycle Executive Matrix
            </h3>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] uppercase font-mono tracking-widest text-neutral-500 bg-neutral-900/80">
                    <th className="py-3 px-5 font-semibold">Funnel Stage / Metric</th>
                    <th className="py-3 px-5 font-semibold">Current Rate</th>
                    <th className="py-3 px-5 font-semibold">Duration / Benchmark</th>
                    <th className="py-3 px-5 font-semibold">Executive & Strategic Takeaway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs font-sans">
                  <tr className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Signup → First Open (Activation)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-blue-400 font-bold text-sm">82%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">Immediate</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Most users experience product. 18% never open app (Unactivated users). Reducing gap to 12% activates +600 users/10k signups.
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Never Opened (Activation Drop-off)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-400 font-bold text-sm">18%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">Post-Install</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Classified as unactivated rather than churned. These users signed up but never tried the app.
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Free → Paid Conversion
                    </td>
                    <td className="py-3.5 px-5 font-mono text-amber-400 font-bold text-sm">~5%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">4.8 Weeks Avg</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Monetization conversion window takes ~4.8 weeks. Feeds organic free users into the paying subscriber base.
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      First 3-Month Retention (Renewal Rate)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-emerald-400 font-bold text-sm">78%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">3 Months</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Strongest retention KPI. 78% of paying customers survive the initial 3-month cycle. (780 of 1k cohort stay).
                    </td>
                  </tr>

                  <tr className="hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      First 3-Month Churn (Non-Renewal)
                    </td>
                    <td className="py-3.5 px-5 font-mono text-rose-400 font-bold text-sm">22%</td>
                    <td className="py-3.5 px-5 font-mono text-neutral-400">Quarterly ($15/qtr)</td>
                    <td className="py-3.5 px-5 text-neutral-300">
                      Primary recurring-revenue leakage point. (220 of 1k cohort leave at 1st renewal).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Cohort Simulator & Growth Levers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* Cohort Simulator */}
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 space-y-5">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">First-Cycle Cohort Renewal Simulator</h4>
                  <p className="text-[11px] text-neutral-400">Test survivor & churn counts across different paid cohort sizes</p>
                </div>
                <span className="text-[10px] font-mono bg-neutral-900 text-emerald-400 border border-emerald-900/40 px-2.5 py-1 rounded">
                  78% SURVIVAL
                </span>
              </div>

              {/* Cohort Selector Buttons */}
              <div className="flex gap-2">
                {[1000, 5000, 10000, 2347].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedCohortSize(size)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      selectedCohortSize === size
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    {size === 2347 ? "2,347 (Qtr Base)" : `${size.toLocaleString()} Cohort`}
                  </button>
                ))}
              </div>

              {/* Result Display */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-neutral-900/60 p-4 rounded-xl border border-emerald-900/30">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Retained Subscribers</span>
                  <div className="text-3xl font-bold font-mono text-emerald-400">{retainedCohort.toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-400/80 font-mono mt-1 block">78.0% Renewed after 3mo</span>
                </div>

                <div className="bg-neutral-900/60 p-4 rounded-xl border border-rose-900/30">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Churned Subscribers</span>
                  <div className="text-3xl font-bold font-mono text-rose-400">{churnedCohort.toLocaleString()}</div>
                  <span className="text-[10px] text-rose-400/80 font-mono mt-1 block">22.0% Non-renewal loss</span>
                </div>
              </div>
            </div>

            {/* Growth Levers */}
            <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 space-y-5 flex flex-col justify-between">
              <div>
                <div className="border-b border-neutral-800 pb-4 mb-4">
                  <h4 className="text-sm font-bold text-white">Dual Growth & Revenue Levers</h4>
                  <p className="text-[11px] text-neutral-400">High-impact operational optimizations identified in report</p>
                </div>

                <div className="space-y-4">
                  {/* Lever 1 */}
                  <div className="p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-blue-300">1. Activation Optimization (18% → 12%)</span>
                      <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">+600 Users / 10k</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Reducing never-opened rate from 18% to 12% activates 600 additional users per 10k signups into the 5% conversion funnel.
                    </p>
                  </div>

                  {/* Lever 2 */}
                  <div className="p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-emerald-300">2. Retention Engine (78% → 82%)</span>
                      <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">+400 Paid / 10k</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Improving 1st-cycle retention from 78% to 82% keeps 400 additional paying subscribers per 10k cohort without additional acquisition costs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Top Grid: Global Stats & Globe */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Users Card */}
          <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00b87a]/5 rounded-full blur-3xl group-hover:bg-[#00b87a]/10 transition-all duration-700 pointer-events-none" />
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono">Live Global Audience</h2>
            
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_20px_rgba(0,184,122,0.15)] transition-all duration-300">
                {activeUsers.toLocaleString()}
              </span>
              <span className="mb-2 w-3 h-3 rounded-full bg-[#00b87a] animate-pulse shadow-[0_0_12px_rgba(0,184,122,0.8)]" />
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
                  <span className="uppercase tracking-wider">Avg Session Time</span>
                  <span className="text-white font-medium">43m 12s</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-[#6ba3be] rounded-full" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-neutral-800/50">
                <div className="flex justify-between text-xs text-neutral-400 mb-2 font-mono">
                  <span className="uppercase tracking-wider">Traffic Matrix</span>
                </div>
                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden w-full">
                  <div className="w-[64%] h-full bg-[#00b87a] hover:opacity-80 transition-opacity cursor-help title-Direct" />
                  <div className="w-[24%] h-full bg-[#6ba3be] hover:opacity-80 transition-opacity cursor-help title-Social" />
                  <div className="w-[12%] h-full bg-[#b8865e] hover:opacity-80 transition-opacity cursor-help title-Referral" />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-neutral-500 font-mono">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#00b87a] rounded-full"/>Direct</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#6ba3be] rounded-full"/>Social</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-[#b8865e] rounded-full"/>Ref</span>
                </div>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-8 font-mono">Device Distribution</h2>
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Desktop
                    </span>
                    <span className="text-neutral-400 font-mono">72.4%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[72.4%] h-full bg-blue-500 rounded-full" />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" /> Mobile
                    </span>
                    <span className="text-neutral-400 font-mono">21.1%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[21.1%] h-full bg-purple-500 rounded-full" />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#b8865e] shadow-[0_0_8px_rgba(184,134,94,0.5)]" /> Tablet
                    </span>
                    <span className="text-neutral-400 font-mono">6.5%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="w-[6.5%] h-full bg-[#b8865e] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Globe Visualization */}
          <div className="bg-neutral-900/50 p-8 rounded-2xl border border-neutral-800 relative overflow-hidden flex flex-col items-center">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 font-mono w-full text-left">Global Hotspots</h2>
            <p className="text-[10px] text-neutral-500 mb-4 w-full text-left">Real-time geospatial plotting of active sessions</p>
            <div className="flex-1 w-full flex items-center justify-center">
              <GlobeView />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Match Tracker */}
          <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
              <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">Live Match Connections</h2>
              <span className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-1 rounded border border-neutral-700 uppercase tracking-widest">
                {cricketMatches.length + soccerMatches.length} Streams
              </span>
            </div>
            
            <div className="divide-y divide-neutral-800/50 overflow-y-auto max-h-[500px] flex-1">
              {cricketMatches.length === 0 && soccerMatches.length === 0 && (
                <div className="p-8 text-center text-neutral-500 text-sm font-mono">
                  NO ACTIVE TELEMETRY
                </div>
              )}

              {cricketMatches.map((match) => (
                <div key={match.id} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-neutral-800/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00b87a] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#00b87a] uppercase tracking-wider font-mono">CRICKET • {match.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-200">{match.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{match.score}</p>
                  </div>
                  <div className="flex items-center gap-4 md:text-right shrink-0">
                    <div className="hidden md:block w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-400" style={{ width: `${Math.min(100, (match.viewers / 100000) * 100)}%` }} />
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-lg font-bold font-mono text-white transition-all duration-300">
                        {match.viewers.toLocaleString()}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-neutral-500">Watching</div>
                    </div>
                  </div>
                </div>
              ))}

              {soccerMatches.map((match) => (
                <div key={match.id} className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-neutral-800/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b8865e] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#b8865e] uppercase tracking-wider font-mono">SOCCER • {match.status}</span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-200">{match.title}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{match.score}</p>
                  </div>
                  <div className="flex items-center gap-4 md:text-right shrink-0">
                    <div className="hidden md:block w-24 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-400" style={{ width: `${Math.min(100, (match.viewers / 150000) * 100)}%` }} />
                    </div>
                    <div className="w-20 text-right">
                      <div className="text-lg font-bold font-mono text-white transition-all duration-300">
                        {match.viewers.toLocaleString()}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-neutral-500">Watching</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center shrink-0">
              <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">Registered Members Directory</h2>
              <span className="text-[10px] font-mono text-neutral-500">Total: 124,779</span>
            </div>
            
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-neutral-900/95 backdrop-blur z-10">
                  <tr className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-800">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Region</th>
                    <th className="px-6 py-3 font-medium">Session Duration</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50 text-sm">
                  {displayedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 border border-neutral-700">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-200">{maskName(member.name)}</div>
                            <div className="text-xs text-neutral-500">{maskEmail(member.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={getRegionBadge(member.region)?.textClass || "text-neutral-400 font-medium"}>
                            {member.region}
                          </span>
                          {getRegionBadge(member.region) && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest border ${getRegionBadge(member.region)?.className}`}>
                              {getRegionBadge(member.region)?.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${
                          member.status === 'Online' ? 'text-[#00b87a]' : 'text-neutral-500'
                        }`}>
                          {member.session}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Online' ? 'bg-[#00b87a] animate-pulse' : 'bg-neutral-600'}`} />
                          <span className={`text-xs ${member.status === 'Online' ? 'text-neutral-300' : 'text-neutral-500'}`}>{member.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/30 text-center shrink-0">
              <button 
                onClick={loadMoreMembers}
                disabled={isLoadingMore}
                className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {isLoadingMore ? "Loading..." : "Load More Members..."}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
