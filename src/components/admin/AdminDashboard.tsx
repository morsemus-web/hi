"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

function getFluctuatingUsers(base: number, variance: number, current: number) {
  // Drift slowly towards base if too far, otherwise random walk
  const drift = (base - current) * 0.05;
  const walk = (Math.random() - 0.5) * variance;
  return Math.floor(current + drift + walk);
}

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeUsers, setActiveUsers] = useState(122374);
  const [cricketMatches, setCricketMatches] = useState<any[]>([]);
  const [soccerMatches, setSoccerMatches] = useState<any[]>([]);

  // Real-time animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate active users by ~50 around the 122k mark every 2 seconds
      setActiveUsers(prev => {
        let next = getFluctuatingUsers(122374, 150, prev);
        // Add commas to make it look nice later
        return next;
      });

      // Fluctuate viewers
      setCricketMatches(matches => matches.map(m => {
        if (Math.random() > 0.6) return m;
        return { ...m, viewers: Math.max(0, m.viewers + Math.floor(Math.random() * 300) - 100) };
      }));
      setSoccerMatches(matches => matches.map(m => {
        if (Math.random() > 0.6) return m;
        return { ...m, viewers: Math.max(0, m.viewers + Math.floor(Math.random() * 400) - 150) };
      }));
    }, 2500);

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
    <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text-primary to-text-muted">
            Scoredeck Analytics
          </h1>
          <p className="text-text-dim text-sm mt-1">Real-time performance and audience metrics</p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 bg-overlay-5 border border-border rounded-lg text-sm font-medium hover:bg-overlay transition-colors">
            Exit to Site
          </Link>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Active Users Card */}
        <div className="glass-card p-8 rounded-2xl border border-sport-football/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sport-football/5 rounded-full blur-3xl group-hover:bg-sport-football/10 transition-all duration-700" />
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-2">Live Audience</h2>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-6xl font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300">
              {activeUsers.toLocaleString()}
            </span>
            <span className="mb-2 w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-text-dim mb-1">
                <span>Avg Session Time</span>
                <span className="text-text-primary font-mono font-medium">43m 12s</span>
              </div>
              <div className="w-full h-1.5 bg-overlay rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-sport-cricket rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-text-dim mb-1">
                <span>Bounce Rate</span>
                <span className="text-text-primary font-mono font-medium">12.4%</span>
              </div>
              <div className="w-full h-1.5 bg-overlay rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-red-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="glass-card p-8 rounded-2xl border border-border flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-6">Device Distribution</h2>
            <div className="space-y-5">
              
              <div className="relative">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-primary font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Desktop
                  </span>
                  <span className="text-text-dim font-mono">72.4%</span>
                </div>
                <div className="w-full h-2 bg-overlay rounded-full overflow-hidden">
                  <div className="w-[72.4%] h-full bg-blue-500 rounded-full" />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-primary font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Mobile
                  </span>
                  <span className="text-text-dim font-mono">21.1%</span>
                </div>
                <div className="w-full h-2 bg-overlay rounded-full overflow-hidden">
                  <div className="w-[21.1%] h-full bg-purple-500 rounded-full" />
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-primary font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sport-football" /> Tablet
                  </span>
                  <span className="text-text-dim font-mono">6.5%</span>
                </div>
                <div className="w-full h-2 bg-overlay rounded-full overflow-hidden">
                  <div className="w-[6.5%] h-full bg-sport-football rounded-full" />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="glass-card p-8 rounded-2xl border border-border relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-all duration-700" />
          <h2 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-6">Traffic Sources</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-overlay-2 rounded-xl border border-border/50">
              <span className="text-sm font-medium">Direct / Organic</span>
              <span className="font-mono text-sm text-sport-cricket">64%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-overlay-2 rounded-xl border border-border/50">
              <span className="text-sm font-medium">Social (Twitter/X)</span>
              <span className="font-mono text-sm text-sport-cricket">24%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-overlay-2 rounded-xl border border-border/50">
              <span className="text-sm font-medium">Referral (Sports Blogs)</span>
              <span className="font-mono text-sm text-sport-football">12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Match Tracker */}
      <div className="glass-card rounded-2xl border border-border overflow-hidden">
        <div className="px-8 py-5 border-b border-border bg-overlay-2/50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Live Match Connections</h2>
          <span className="text-[10px] font-mono bg-sport-cricket/15 text-sport-cricket px-2 py-1 rounded border border-sport-cricket/20 uppercase tracking-widest">
            {cricketMatches.length + soccerMatches.length} Active Streams
          </span>
        </div>
        
        <div className="divide-y divide-border/50">
          {cricketMatches.length === 0 && soccerMatches.length === 0 && (
            <div className="p-8 text-center text-text-dim text-sm">
              No live matches currently broadcasting telemetry.
            </div>
          )}

          {cricketMatches.map((match) => (
            <div key={match.id} className="p-6 md:px-8 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-overlay-5 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono">Cricket • {match.status}</span>
                </div>
                <h3 className="text-base font-bold text-text-primary">{match.title}</h3>
                <p className="text-xs text-text-dim mt-1">{match.score}</p>
              </div>
              <div className="flex items-center gap-4 md:text-right">
                <div className="hidden md:block w-32 h-1 bg-overlay rounded-full overflow-hidden">
                  <div className="h-full bg-accent animate-pulse" style={{ width: `${Math.min(100, (match.viewers / 100000) * 100)}%` }} />
                </div>
                <div className="w-24">
                  <div className="text-xl font-bold font-mono text-accent transition-all duration-300">
                    {match.viewers.toLocaleString()}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-text-dim">Concurrents</div>
                </div>
              </div>
            </div>
          ))}

          {soccerMatches.map((match) => (
            <div key={match.id} className="p-6 md:px-8 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-overlay-5 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono">Soccer • {match.status}</span>
                </div>
                <h3 className="text-base font-bold text-text-primary">{match.title}</h3>
                <p className="text-xs text-text-dim mt-1">{match.score}</p>
              </div>
              <div className="flex items-center gap-4 md:text-right">
                <div className="hidden md:block w-32 h-1 bg-overlay rounded-full overflow-hidden">
                  <div className="h-full bg-sport-football animate-pulse" style={{ width: `${Math.min(100, (match.viewers / 150000) * 100)}%` }} />
                </div>
                <div className="w-24">
                  <div className="text-xl font-bold font-mono text-sport-football transition-all duration-300">
                    {match.viewers.toLocaleString()}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-text-dim">Concurrents</div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
