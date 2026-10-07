"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import ReportsView from "./ReportsView";

type Stats = {
  generatedAt: string;
  accounts: {
    total: number | null;
    last7d: number | null;
    last30d: number | null;
    paid: number | null;
    adsFree: number | null;
    tiers: Record<string, number>;
  };
  waitlist: { total: number | null; last7d: number | null };
  backers: { total: number | null };
  ads: { impressions7d: number | null; clicks7d: number | null; activeCampaigns: number | null };
  recentSignups: { email: string; tier: string; createdAt: string }[];
};

type LiveMatch = { id: string; sport: "Soccer" | "Cricket"; title: string; score: string; status: string };

const fmt = (n: number | null | undefined) => (n === null || n === undefined ? "—" : n.toLocaleString());

function Card({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-5 rounded-xl border border-zinc-800 bg-[#111114]">
      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="text-2xl font-bold font-mono text-white mt-1">{value}</div>
      {sub && <div className="text-[11px] text-zinc-400 mt-2 font-mono">{sub}</div>}
    </div>
  );
}

/* All figures come from /api/admin/stats (direct Supabase counts) and the
   public live-score APIs. Nothing on this page is estimated or simulated. */
export default function AdminDashboard({
  accessToken,
  email,
  onLogout,
}: {
  accessToken: string;
  email: string;
  onLogout: () => void;
}) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [tab, setTab] = useState<"overview" | "reports">("overview");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setStats(body);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [accessToken]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const live: LiveMatch[] = [];
      try {
        const s = await (await fetch("/api/soccer")).json();
        for (const l of s?.leagues ?? []) {
          for (const m of l.matches ?? []) {
            if (m.status !== "Live") continue;
            live.push({
              id: `s-${m.home_team}-${m.away_team}`,
              sport: "Soccer",
              title: `${m.home_team} vs ${m.away_team}`,
              score: `${m.home_score} - ${m.away_score}`,
              status: `${l.league_name ?? ""} · ${m.time ?? ""}`,
            });
          }
        }
      } catch {}
      try {
        const c = await (await fetch("/api/cricket")).json();
        for (const m of c?.matches ?? []) {
          const t = (m.status_text || "").toLowerCase();
          if (/won|beat|draw|tied|completed|abandoned|starts|preview|upcoming/.test(t)) continue;
          live.push({ id: `c-${m.id}`, sport: "Cricket", title: m.title, score: m.score, status: m.status_text });
        }
      } catch {}
      setMatches(live);
    })();
  }, []);

  const a = stats?.accounts;
  const ctr =
    stats?.ads.impressions7d && stats.ads.clicks7d !== null
      ? `${((stats.ads.clicks7d / stats.ads.impressions7d) * 100).toFixed(2)}% CTR`
      : undefined;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 antialiased font-sans print:bg-white print:text-black">
      <header className="border-b border-zinc-800/80 bg-[#0a0a0c]/90 backdrop-blur sticky top-0 z-30 px-6 py-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">ScoreDeck Admin</h1>
            <p className="text-[11px] text-zinc-400 font-mono">
              {email}
              {stats && ` · updated ${new Date(stats.generatedAt).toLocaleTimeString()}`}
            </p>
          </div>
          <nav className="flex items-center gap-1">
            {(["overview", "reports"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md capitalize ${
                  tab === t ? "bg-zinc-100 text-zinc-900" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={load} className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-800/50">
              Refresh
            </button>
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-md hover:bg-zinc-800/50">
              Exit to Site
            </Link>
            <button
              onClick={onLogout}
              className="text-xs text-zinc-400 hover:text-red-400 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {tab === "reports" ? (
        <main className="max-w-7xl mx-auto px-6 py-8">
          <ReportsView accessToken={accessToken} />
        </main>
      ) : (
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl border border-red-900/60 bg-red-950/30 text-sm text-red-300">
            {error === "Not an admin" ? "This account is not authorised for the admin dashboard." : error}
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card label="Accounts" value={fmt(a?.total)} sub={`+${fmt(a?.last7d)} in 7d · +${fmt(a?.last30d)} in 30d`} />
          <Card label="Paid accounts" value={fmt(a?.paid)} sub={`${fmt(a?.adsFree)} currently ads-free`} />
          <Card label="Founding backers" value={fmt(stats?.backers.total)} />
          <Card label="Waitlist" value={fmt(stats?.waitlist.total)} sub={`+${fmt(stats?.waitlist.last7d)} in 7d`} />
          <Card
            label="Ads · last 7 days"
            value={fmt(stats?.ads.impressions7d)}
            sub={`${fmt(stats?.ads.clicks7d)} clicks${ctr ? ` · ${ctr}` : ""} · ${fmt(stats?.ads.activeCampaigns)} active`}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#111114]">
            <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-zinc-800 pb-3 mb-3">
              Paid accounts by tier
            </h2>
            {a && Object.keys(a.tiers).length > 0 ? (
              <ul className="space-y-2 text-sm font-mono">
                {Object.entries(a.tiers).map(([tier, n]) => (
                  <li key={tier} className="flex justify-between text-zinc-300">
                    <span className="capitalize">{tier}</span>
                    <span className="text-white">{n.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500 font-mono">No paid accounts yet.</p>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-[#111114] overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-[#141417] flex justify-between items-center">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Recent signups</h3>
              <span className="text-[10px] font-mono text-zinc-400">Latest 25 · emails masked</span>
            </div>
            <div className="divide-y divide-zinc-800/50 max-h-[320px] overflow-y-auto">
              {(stats?.recentSignups ?? []).length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-500 font-mono">No signups yet</div>
              )}
              {stats?.recentSignups.map((r, i) => (
                <div key={i} className="px-4 py-3 flex justify-between text-xs">
                  <span className="font-mono text-zinc-300 truncate">{r.email}</span>
                  <span className="font-mono text-zinc-500 shrink-0 ml-3">
                    {r.tier} · {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-[#111114] overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-[#141417] flex justify-between items-center">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">Live matches on the platform</h3>
            <span className="text-[10px] font-mono text-zinc-400">{matches.length} live</span>
          </div>
          <div className="divide-y divide-zinc-800/50 max-h-[360px] overflow-y-auto">
            {matches.length === 0 && (
              <div className="py-8 text-center text-xs text-zinc-500 font-mono">No live matches right now</div>
            )}
            {matches.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <div className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1 truncate">
                    {m.sport} · {m.status}
                  </div>
                  <div className="text-sm font-semibold text-zinc-100 truncate">{m.title}</div>
                </div>
                <div className="text-sm font-mono text-white shrink-0">{m.score}</div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-[11px] text-zinc-500 font-mono">
          App usage, ad performance and system health for any date range are in the Reports tab.
        </p>
      </main>
      )}
    </div>
  );
}
