"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

/* Reports for any date range (inclusive, Dubai time), computed on the server
   by admin_report() — see reporting-setup.sql and docs/REPORTING.md.
   Download as CSV/JSON, or print to PDF. */

type Row = Record<string, string | number | null>;
type Report = {
  range: { from: string; to: string; timezone: string };
  business: {
    totals: Record<string, number>;
    revenue: { provider: string; currency: string; amountMinor: number; payments: number }[];
    daily: Row[];
  };
  usage: {
    totals: Record<string, number>;
    daily: Row[];
    byPlatform: Row[];
    bySport: Row[];
    topLeagues: Row[];
    byCountry: Row[];
    byVersion: Row[];
  };
  retention: {
    cohorts: {
      cohortWeek: string; size: number;
      week1: number | null; week2: number | null; week4: number | null; week8: number | null;
    }[];
  };
  ads: { totals: Record<string, number>; byCampaign: Row[]; daily: Row[] };
  health: { totals: Record<string, number>; byFeed: Row[]; daily: Row[] };
};

const TZ = "Asia/Dubai";
const dubaiToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

function presets() {
  const today = dubaiToday();
  const [y, m] = today.split("-").map(Number);
  const firstThis = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastPrev = addDays(firstThis, -1);
  return [
    { label: "Last 7 days", from: addDays(today, -6), to: today },
    { label: "Last 30 days", from: addDays(today, -29), to: today },
    { label: "This month", from: firstThis, to: today },
    { label: "Last month", from: `${lastPrev.slice(0, 7)}-01`, to: lastPrev },
    { label: "Last 90 days", from: addDays(today, -89), to: today },
  ];
}

const n = (v: unknown) => (typeof v === "number" ? v.toLocaleString() : "—");
const pct = (a?: number, b?: number) => (a !== undefined && b ? `${((a / b) * 100).toFixed(2)}%` : "—");
const money = (minor: number, cur: string) => {
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: cur }).format(minor / 100);
  } catch {
    return `${(minor / 100).toFixed(2)} ${cur}`;
  }
};

// Retention share; null means that week hasn't happened yet.
const retPct = (n: number | null, size: number) => (n === null || !size ? null : `${Math.round((n / size) * 100)}%`);

/* ── CSV ─────────────────────────────────────────────────────────── */
function toCsv(rows: Row[]): string {
  if (rows.length === 0) return "(no data)\n";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

function reportCsv(r: Report): string {
  const totals = (o: Record<string, number>) => Object.entries(o).map(([metric, value]) => ({ metric, value }));
  const sections: [string, Row[]][] = [
    ["Business - totals", totals(r.business.totals)],
    ["Business - revenue", r.business.revenue.map((x) => ({ provider: x.provider, currency: x.currency, amount: x.amountMinor / 100, payments: x.payments }))],
    ["Business - daily", r.business.daily],
    ["Usage - totals", totals(r.usage.totals)],
    ["Usage - daily", r.usage.daily],
    ["Usage - by platform", r.usage.byPlatform],
    ["Usage - by sport", r.usage.bySport],
    ["Usage - top leagues", r.usage.topLeagues],
    ["Usage - by country", r.usage.byCountry],
    ["Usage - by app version", r.usage.byVersion],
    ["Retention - weekly cohorts (users active again N weeks later)", r.retention.cohorts.map((c) => ({
      cohort_week: c.cohortWeek, new_users: c.size,
      week1: c.week1, week1_pct: retPct(c.week1, c.size),
      week2: c.week2, week2_pct: retPct(c.week2, c.size),
      week4: c.week4, week4_pct: retPct(c.week4, c.size),
      week8: c.week8, week8_pct: retPct(c.week8, c.size),
    }))],
    ["Ads - totals", totals(r.ads.totals)],
    ["Ads - by campaign", r.ads.byCampaign],
    ["Ads - daily", r.ads.daily],
    ["System health - totals", totals(r.health.totals)],
    ["System health - by feed", r.health.byFeed],
    ["System health - daily", r.health.daily],
  ];
  const head = `ScoreDeck report,${r.range.from} to ${r.range.to} (${r.range.timezone})\nGenerated,${new Date().toISOString()}\n\n`;
  return head + sections.map(([title, rows]) => `${title}\n${toCsv(rows)}`).join("\n");
}

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Pieces ──────────────────────────────────────────────────────── */
function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-[#111114] print:border-zinc-300 print:bg-white">
      <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 print:text-zinc-600">{label}</div>
      <div className="text-xl font-bold font-mono text-white mt-1 print:text-black">{value}</div>
      {sub && <div className="text-[11px] text-zinc-400 mt-1 font-mono print:text-zinc-600">{sub}</div>}
    </div>
  );
}

function Table({ rows, columns }: { rows: Row[]; columns: { key: string; label: string; num?: boolean }[] }) {
  if (rows.length === 0) return <p className="text-xs text-zinc-500 font-mono py-3">No data for this range.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="text-[10px] uppercase text-zinc-400 border-b border-zinc-800 print:text-zinc-600 print:border-zinc-300">
            {columns.map((c) => (
              <th key={c.key} className={`py-2 font-medium ${c.num ? "text-right" : "text-left"}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60 print:divide-zinc-200">
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className={`py-2 text-zinc-200 print:text-black ${c.num ? "text-right" : ""}`}>
                  {c.num ? n(r[c.key]) : (r[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Single-series daily bar chart. One hue (validated on the #111114 surface),
   4px rounded data-ends on the baseline, 2px gaps, recessive axis, hover
   tooltip per bar, and the numbers available in the table below it. */
function DailyBars({ rows, field, label }: { rows: Row[]; field: string; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 160, PAD_L = 36, PAD_B = 20, PAD_T = 8;
  const vals = rows.map((r) => Number(r[field]) || 0);
  const max = Math.max(1, ...vals);
  const plotW = W - PAD_L, plotH = H - PAD_B - PAD_T;
  const slot = plotW / Math.max(1, rows.length);
  const barW = Math.max(1, slot - 2);
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH;

  return (
    <figure className="mt-3">
      <figcaption className="text-[11px] font-mono text-zinc-400 mb-1 print:text-zinc-600">{label} per day</figcaption>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${label} per day`}>
          <line x1={PAD_L} x2={W} y1={PAD_T + plotH} y2={PAD_T + plotH} stroke="#3f3f46" strokeWidth={1} />
          <line x1={PAD_L} x2={W} y1={PAD_T} y2={PAD_T} stroke="#27272a" strokeWidth={1} strokeDasharray="2 3" />
          <text x={PAD_L - 6} y={PAD_T + 4} textAnchor="end" fontSize={10} fill="#a1a1aa" fontFamily="monospace">{max.toLocaleString()}</text>
          <text x={PAD_L - 6} y={PAD_T + plotH} textAnchor="end" fontSize={10} fill="#a1a1aa" fontFamily="monospace">0</text>
          {vals.map((v, i) => {
            const x = PAD_L + i * slot + 1;
            const top = y(v);
            const h = PAD_T + plotH - top;
            const r = Math.min(4, barW / 2, h);
            const path = h <= 0 ? "" :
              `M${x},${PAD_T + plotH} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${PAD_T + plotH} Z`;
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={plotH} fill="transparent" />
                {path && <path d={path} fill="#3987e5" opacity={hover === null || hover === i ? 1 : 0.55} />}
              </g>
            );
          })}
          {rows.length > 0 && (
            <>
              <text x={PAD_L} y={H - 4} fontSize={10} fill="#a1a1aa" fontFamily="monospace">{String(rows[0].day)}</text>
              <text x={W} y={H - 4} textAnchor="end" fontSize={10} fill="#a1a1aa" fontFamily="monospace">{String(rows[rows.length - 1].day)}</text>
            </>
          )}
        </svg>
        {hover !== null && (() => {
          const leftPct = ((PAD_L + hover * slot + slot / 2) / W) * 100;
          // Anchor the tooltip's edge near the chart sides so it never overflows.
          const shift = leftPct < 20 ? "translate-x-0" : leftPct > 80 ? "-translate-x-full" : "-translate-x-1/2";
          return (
          <div
            className={`absolute pointer-events-none ${shift} -translate-y-full px-2 py-1 rounded-md bg-zinc-100 text-zinc-900 text-[11px] font-mono whitespace-nowrap shadow`}
            style={{ left: `${leftPct}%`, top: `${(y(vals[hover]) / H) * 100}%` }}
          >
            {String(rows[hover].day)} · {vals[hover].toLocaleString()} {label.toLowerCase()}
          </div>
          );
        })()}
      </div>
    </figure>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="p-6 rounded-2xl border border-zinc-800 bg-[#111114] space-y-4 break-inside-avoid print:border-zinc-300 print:bg-white">
      <h2 className="text-sm font-bold text-white uppercase font-mono border-b border-zinc-800 pb-3 print:text-black print:border-zinc-300">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DataTable({ rows, columns }: { rows: Row[]; columns: { key: string; label: string; num?: boolean }[] }) {
  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-zinc-400 font-mono print:hidden">Show daily table</summary>
      <Table rows={rows} columns={columns} />
    </details>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function ReportsView({ accessToken }: { accessToken: string }) {
  const initial = presets()[1];
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const presetList = useMemo(presets, []);

  const run = useCallback(async () => {
    if (!from || !to || to < from) {
      setError("Pick a start date on or before the end date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/report?from=${from}&to=${to}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      setReport(body);
    } catch (e) {
      setReport(null);
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [from, to, accessToken]);

  useEffect(() => {
    run();
  }, [run]);

  const fileBase = `scoredeck-report_${from}_to_${to}`;
  const b = report?.business, u = report?.usage, ad = report?.ads, h = report?.health;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 print:hidden">
        <label className="text-[11px] font-mono text-zinc-400">
          From
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)}
            className="block mt-1 px-2 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 [color-scheme:dark]" />
        </label>
        <label className="text-[11px] font-mono text-zinc-400">
          To
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)}
            className="block mt-1 px-2 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-100 [color-scheme:dark]" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {presetList.map((p) => (
            <button key={p.label} onClick={() => { setFrom(p.from); setTo(p.to); }}
              className={`text-[11px] font-mono px-2.5 py-1.5 rounded-md border ${
                from === p.from && to === p.to
                  ? "bg-zinc-100 text-zinc-900 border-white"
                  : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-600"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button disabled={!report} onClick={() => report && download(`${fileBase}.csv`, reportCsv(report), "text/csv")}
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-900 font-medium disabled:opacity-40">
            Download CSV
          </button>
          <button disabled={!report} onClick={() => report && download(`${fileBase}.json`, JSON.stringify(report, null, 2), "application/json")}
            className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-200 disabled:opacity-40">
            JSON
          </button>
          <button disabled={!report} onClick={() => window.print()}
            className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-200 disabled:opacity-40">
            Print / PDF
          </button>
        </div>
      </div>

      <div className="hidden print:block text-black">
        <h1 className="text-xl font-bold">ScoreDeck report</h1>
        <p className="text-sm">{from} to {to} (Dubai time) · Titan Orbyt Technologies LLC</p>
      </div>

      {loading && <p className="text-xs font-mono text-zinc-400">Loading report…</p>}
      {error && (
        <div className="p-4 rounded-xl border border-red-900/60 bg-red-950/30 text-sm text-red-300">{error}</div>
      )}

      {report && b && u && ad && h && (
        <>
          <Section title="Business">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <Tile label="New accounts" value={n(b.totals.newAccounts)} />
              <Tile label="Accounts at end" value={n(b.totals.accountsAtEnd)} />
              <Tile label="Paid accounts (now)" value={n(b.totals.paidAccountsNow)} />
              <Tile label="Payments" value={n(b.totals.payments)} />
              <Tile label="New backers" value={n(b.totals.newBackers)} />
              <Tile label="Waitlist joins" value={n(b.totals.waitlistJoins)} />
            </div>
            <div>
              <div className="text-[11px] font-mono text-zinc-400 mb-1 print:text-zinc-600">Revenue (successful payments)</div>
              {b.revenue.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono">No payments in this range.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {b.revenue.map((r) => (
                    <Tile key={`${r.provider}-${r.currency}`} label={`${r.currency} · ${r.provider}`} value={money(r.amountMinor, r.currency)} sub={`${r.payments} payments`} />
                  ))}
                </div>
              )}
            </div>
            <DailyBars rows={b.daily} field="newAccounts" label="New accounts" />
            <DataTable rows={b.daily} columns={[
              { key: "day", label: "Day" }, { key: "newAccounts", label: "Accounts", num: true },
              { key: "payments", label: "Payments", num: true }, { key: "newBackers", label: "Backers", num: true },
              { key: "waitlistJoins", label: "Waitlist", num: true },
            ]} />
          </Section>

          <Section title="App usage">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Tile label="Unique users" value={n(u.totals.uniqueUsers)} />
              <Tile label="Avg daily users" value={n(u.totals.avgDailyUsers)} />
              <Tile label="Sessions" value={n(u.totals.sessions)} />
              <Tile label="Match views" value={n(u.totals.matchViews)} />
              <Tile label="Active time" value={`${n(Math.round((u.totals.activeMinutes ?? 0) / 60))} h`} sub="approx., 5-min heartbeats" />
            </div>
            <DailyBars rows={u.daily} field="users" label="Active users" />
            <DataTable rows={u.daily} columns={[
              { key: "day", label: "Day" }, { key: "users", label: "Users", num: true },
              { key: "sessions", label: "Sessions", num: true }, { key: "activeMinutes", label: "Active min", num: true },
            ]} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-[11px] font-mono uppercase text-zinc-400 mb-1">By platform</h3>
                <Table rows={u.byPlatform} columns={[{ key: "platform", label: "Platform" }, { key: "users", label: "Users", num: true }, { key: "sessions", label: "Sessions", num: true }]} />
              </div>
              <div>
                <h3 className="text-[11px] font-mono uppercase text-zinc-400 mb-1">By sport (match views)</h3>
                <Table rows={u.bySport} columns={[{ key: "sport", label: "Sport" }, { key: "views", label: "Views", num: true }, { key: "users", label: "Users", num: true }]} />
              </div>
              <div>
                <h3 className="text-[11px] font-mono uppercase text-zinc-400 mb-1">Top leagues</h3>
                <Table rows={u.topLeagues} columns={[{ key: "league", label: "League" }, { key: "sport", label: "Sport" }, { key: "views", label: "Views", num: true }, { key: "users", label: "Users", num: true }]} />
              </div>
              <div>
                <h3 className="text-[11px] font-mono uppercase text-zinc-400 mb-1">By country</h3>
                <Table rows={u.byCountry} columns={[{ key: "country", label: "Country" }, { key: "users", label: "Users", num: true }]} />
              </div>
              <div>
                <h3 className="text-[11px] font-mono uppercase text-zinc-400 mb-1">App versions</h3>
                <Table rows={u.byVersion} columns={[{ key: "platform", label: "Platform" }, { key: "version", label: "Version" }, { key: "users", label: "Users", num: true }]} />
              </div>
            </div>
          </Section>

          <Section title="Retention">
            <p className="text-xs text-zinc-400 print:text-zinc-600">
              New users are grouped by the week they first opened ScoreDeck (weeks start Monday, Dubai time).
              Each column shows the share active again 1, 2, 4 and 8 weeks later. “—” means that week hasn’t happened yet.
            </p>
            <Table
              rows={report.retention.cohorts.map((c) => ({
                cohortWeek: c.cohortWeek,
                size: c.size,
                week1: retPct(c.week1, c.size),
                week2: retPct(c.week2, c.size),
                week4: retPct(c.week4, c.size),
                week8: retPct(c.week8, c.size),
              }))}
              columns={[
                { key: "cohortWeek", label: "First week" }, { key: "size", label: "New users", num: true },
                { key: "week1", label: "Week 1" }, { key: "week2", label: "Week 2" },
                { key: "week4", label: "Week 4" }, { key: "week8", label: "Week 8" },
              ]}
            />
          </Section>

          <Section title="Ad performance">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Tile label="Impressions" value={n(ad.totals.impressions)} />
              <Tile label="Clicks" value={n(ad.totals.clicks)} />
              <Tile label="CTR" value={pct(ad.totals.clicks, ad.totals.impressions)} />
            </div>
            <DailyBars rows={ad.daily} field="impressions" label="Impressions" />
            <Table
              rows={ad.byCampaign.map((c) => ({ ...c, ctr: pct(Number(c.clicks), Number(c.impressions)) }))}
              columns={[
                { key: "name", label: "Campaign" }, { key: "advertiser", label: "Advertiser" },
                { key: "impressions", label: "Impressions", num: true }, { key: "clicks", label: "Clicks", num: true },
                { key: "ctr", label: "CTR" },
              ]}
            />
          </Section>

          <Section title="System health">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <Tile label="Feed requests (server)" value={n(h.totals.requests)} sub="CDN cache hits not counted" />
              <Tile label="Server errors (5xx)" value={n(h.totals.errors)} />
              <Tile label="Error rate" value={pct(h.totals.errors, h.totals.requests)} />
            </div>
            <DailyBars rows={h.daily} field="errors" label="Server errors" />
            <Table rows={h.byFeed} columns={[
              { key: "feed", label: "Feed" }, { key: "provider", label: "Provider" },
              { key: "requests", label: "Requests", num: true }, { key: "errors", label: "5xx", num: true },
              { key: "clientErrors", label: "4xx", num: true }, { key: "avgMs", label: "Avg ms", num: true },
              { key: "p95Ms", label: "p95 ms", num: true },
            ]} />
          </Section>
        </>
      )}
    </div>
  );
}
