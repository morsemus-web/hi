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

const MOCK_MEMBERS = [
  { id: "SD-901", name: "Aryan Sharma", email: "aryan.s@gmail.com", region: "India", session: "45m 12s", status: "Online" },
  { id: "SD-902", name: "James Wilson", email: "j.wilson92@hotmail.com", region: "UK", session: "1h 12m", status: "Online" },
  { id: "SD-903", name: "David Chen", email: "dchen.sports@yahoo.com", region: "Australia", session: "Last active: 2h ago", status: "Offline" },
  { id: "SD-904", name: "Rahul Desai", email: "rahuld88@gmail.com", region: "India", session: "12m 04s", status: "Online" },
  { id: "SD-905", name: "Sarah Jenkins", email: "s.jenkins.tx@gmail.com", region: "US", session: "05m 55s", status: "Online" },
  { id: "SD-906", name: "Ahmed Al-Fayed", email: "ahmed.alf@outlook.com", region: "UAE", session: "Last active: 5h ago", status: "Offline" },
  { id: "SD-907", name: "Marcus Rossi", email: "mrossi1999@gmail.com", region: "Italy", session: "33m 21s", status: "Online" },
  { id: "SD-908", name: "Priya Patel", email: "priya.p.90@yahoo.com", region: "India", session: "1h 40m", status: "Online" },
  { id: "SD-909", name: "Liam O'Connor", email: "liam.oconnor.ire@gmail.com", region: "Ireland", session: "21m 15s", status: "Online" },
  { id: "SD-910", name: "Oliver Smith", email: "osmith.sports@gmail.com", region: "UK", session: "Last active: 1d ago", status: "Offline" },
];

/* ========================================================
   MAIN COMPONENT
   ======================================================== */
export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [baseBrowsingUsers, setBaseBrowsingUsers] = useState(2450);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);

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

  return (
    // FORCED DARK MODE CONTAINER: bg-neutral-950, text-white
    <div className="min-h-screen font-sans bg-neutral-950 text-neutral-200">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Scoredeck Platform
            </h1>
            <p className="text-neutral-400 text-sm mt-1 uppercase tracking-widest font-mono">Live Telemetry & Audience Matrix</p>
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
            
            <div className="divide-y divide-neutral-800/50 overflow-y-auto max-h-[400px] flex-1">
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
            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900 flex justify-between items-center">
              <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">Registered Members Directory</h2>
              <span className="text-[10px] font-mono text-neutral-500">Total: 122,374</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/50 text-[10px] uppercase tracking-widest text-neutral-500 font-mono border-b border-neutral-800">
                    <th className="px-6 py-3 font-medium">User</th>
                    <th className="px-6 py-3 font-medium">Region</th>
                    <th className="px-6 py-3 font-medium">Session Duration</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50 text-sm">
                  {MOCK_MEMBERS.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400 border border-neutral-700">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-200">{member.name}</div>
                            <div className="text-xs text-neutral-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-neutral-400">{member.region}</td>
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
            
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/30 text-center">
              <button className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 hover:text-white transition-colors">
                Load More Members...
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
