"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";

/* ------------------------------- types -------------------------------- */

interface DriverStanding {
  position: string;
  driverId: string;
  name: string;
  code: string;
  number: string;
  points: string;
  wins: string;
  poles: string;
  podiums: string;
  flag: string;
  constructor: string;
  teamColor: string;
  image: string;
}

interface TeamStanding {
  position: string;
  name: string;
  teamColor: string;
  points: string;
  wins: string;
  poles: string;
  podiums: string;
}

interface Session {
  name: string;
  date: string;
  state: "pre" | "in" | "post";
  detail: string;
  available?: boolean;
}

interface Race {
  id: string;
  round: string;
  season: string;
  title: string;
  circuit: string;
  locality: string;
  country: string;
  flag: string;
  team1Full: string;
  status: "pre" | "in" | "post";
  isLive: boolean;
  startTime: string;
  sessions: Session[];
}

interface Row {
  pos: string;
  driver: string;
  code: string;
  number: string;
  team: string;
  teamColor: string;
  flag: string;
  laps: string;
  gap: string;
  time: string;
  q1: string;
  q2: string;
  q3: string;
  grid: string;
  points: string;
  status: string;
}

interface Detail {
  title: string;
  circuit: string;
  locality: string;
  country: string;
  flag: string;
  season: string;
  round: string;
  sessions: Session[];
  sessionDate: string | null;
  sessionState: string | null;
  results: Row[];
}

interface Laps {
  totalLaps: number;
  drivers: {
    driverId: string; code: string; name: string; number: string;
    team: string; teamColor: string; grid: number; finish: number;
  }[];
  laps: { number: number; positions: { driverId: string; position: number }[] }[];
}

interface Payload {
  season: string;
  standings: DriverStanding[];
  constructorStandings: TeamStanding[];
  matches: Race[];
}

/* ------------------------------- helpers ------------------------------ */

const GROUPS = [
  { key: "practice", label: "Free Practice", sessions: ["FP1", "FP2", "FP3"] },
  { key: "qualifying", label: "Qualifying", sessions: ["Qual"] },
  { key: "race", label: "Race", sessions: ["Race"] },
] as const;

type GroupKey = (typeof GROUPS)[number]["key"];

function fmt(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const now = new Date();
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return `Yesterday, ${time}`;
    return `${d.toLocaleDateString(undefined, { day: "numeric", month: "short" })} at ${time}`;
  } catch {
    return iso;
  }
}

/* ------------------------------ component ----------------------------- */

export default function LiveF1Client() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"results" | "flow" | "standings" | "calendar">("results");
  const [raceId, setRaceId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/f1");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.error || "F1 feed unavailable");
      setData(json);
      // Default to the live-or-next round, which the route sorts to the front.
      setRaceId((cur) => cur ?? json.matches?.[0]?.id ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch F1 data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 30000);
    return () => clearInterval(t);
  }, [fetchData]);

  const race = useMemo(
    () => data?.matches?.find((m) => m.id === raceId) ?? data?.matches?.[0] ?? null,
    [data, raceId],
  );

  return (
    <main className="min-h-screen bg-bg text-text-primary relative overflow-x-hidden">
      <div className="max-w-[1100px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        {/* Race header */}
        <div className="mt-8 mb-8 flex items-center gap-4">
          {race?.flag && (
            <img
              src={race.flag}
              alt={race.country}
              className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-xs text-text-muted">
              {race ? `${race.title} · ${race.season}` : "Formula 1"}
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Formula 1</h1>
              {race?.isLive && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-red-400">
                    Live
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Round picker */}
        {data && data.matches.length > 1 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {data.matches.map((m) => (
              <button
                key={m.id}
                onClick={() => setRaceId(m.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                  m.id === raceId
                    ? "bg-accent text-bg border-accent"
                    : "bg-overlay-1 text-text-dim border-border hover:text-text-primary"
                }`}
              >
                R{m.round} · {m.title.replace(/ Grand Prix$/, "")}
              </button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-border mb-6 overflow-x-auto scrollbar-none">
          {(
            [
              { key: "results", label: "Results" },
              { key: "flow", label: "Race flow" },
              { key: "standings", label: "Standings" },
              { key: "calendar", label: "Calendar" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 border-b-2 text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                tab === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-dim"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && !data && (
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-overlay-2 rounded-xl" />
            <div className="h-96 bg-overlay-2 rounded-2xl" />
          </div>
        )}

        {error && !data && (
          <div className="glass-card rounded-xl p-8 text-center max-w-2xl">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="px-6 py-2 bg-accent/15 text-accent rounded cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {data && race && (
          <>
            {tab === "results" && <ResultsTab raceId={race.id} sessions={race.sessions} />}
            {tab === "flow" && <RaceFlowTab raceId={race.id} />}
            {tab === "standings" && (
              <StandingsTab drivers={data.standings} teams={data.constructorStandings} />
            )}
            {tab === "calendar" && <CalendarTab races={data.matches} onPick={setRaceId} />}
          </>
        )}
      </div>
    </main>
  );
}

/* ------------------------------- results ------------------------------ */

function ResultsTab({ raceId, sessions }: { raceId: string; sessions: Session[] }) {
  const groups = useMemo(
    () =>
      GROUPS.map((g) => ({
        ...g,
        sessions: g.sessions.filter((s) => sessions.some((d) => d.name === s)),
      })).filter((g) => g.sessions.length > 0),
    [sessions],
  );

  const initial = useMemo(() => {
    const live = sessions.find((s) => s.state === "in");
    const done = [...sessions].reverse().find((s) => s.state === "post");
    const pick = live?.name ?? done?.name ?? sessions[0]?.name ?? "FP1";
    const g = GROUPS.find((x) => (x.sessions as readonly string[]).includes(pick));
    return { group: (g?.key ?? "practice") as GroupKey, session: pick };
  }, [sessions]);

  const [group, setGroup] = useState<GroupKey>(initial.group);
  const [session, setSession] = useState(initial.session);
  const [qualView, setQualView] = useState<"q1" | "q2" | "q3" | "total">("total");
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<{ date: string; state: string } | null>(null);
  const [busy, setBusy] = useState(true);

  // Re-anchor when the user switches to a different round.
  useEffect(() => {
    setGroup(initial.group);
    setSession(initial.session);
  }, [initial.group, initial.session]);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    (async () => {
      try {
        const res = await fetch(
          `/api/f1/details?id=${encodeURIComponent(raceId)}&session=${session}`,
        );
        const json: Detail = await res.json();
        if (!alive) return;
        setRows(json.results ?? []);
        setMeta({ date: json.sessionDate ?? "", state: json.sessionState ?? "" });
      } catch {
        if (alive) setRows([]);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [raceId, session]);

  const active = groups.find((g) => g.key === group) ?? groups[0];
  const isQual = session === "Qual";
  const isRace = session === "Race";

  function pickGroup(g: GroupKey) {
    setGroup(g);
    const first = GROUPS.find((x) => x.key === g)?.sessions[0];
    if (first) setSession(first);
  }

  return (
    <div className="space-y-5">
      {/* Segmented control */}
      <div className="inline-flex w-full rounded-full bg-overlay-1 border border-border p-1">
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => pickGroup(g.key)}
            className={`flex-1 px-4 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              g.key === group ? "bg-text-primary text-bg" : "text-text-dim hover:text-text-primary"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {active?.sessions.length > 1 && (
        <div className="flex gap-2">
          {active.sessions.map((sn) => (
            <Pill key={sn} label={sn} on={sn === session} onClick={() => setSession(sn)} />
          ))}
        </div>
      )}
      {isQual && (
        <div className="flex gap-2">
          {(["q1", "q2", "q3", "total"] as const).map((v) => (
            <Pill
              key={v}
              label={v === "total" ? "Total" : v.toUpperCase()}
              on={v === qualView}
              onClick={() => setQualView(v)}
            />
          ))}
        </div>
      )}

      {meta?.date && <p className="text-sm font-bold">{fmt(meta.date)}</p>}

      {busy ? (
        <div className="space-y-2 animate-pulse">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="h-12 bg-overlay-2 rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <p className="text-text-muted text-sm">
            {meta?.state === "pre"
              ? "This session hasn't run yet."
              : "No classification published for this session."}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-border/60 overflow-hidden">
          <div className="grid grid-cols-[44px_1fr_56px_92px_92px] gap-2 px-4 py-3 border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-muted">
            <span>Pos</span>
            <span>Driver</span>
            <span className="text-right">{isRace ? "GR" : isQual ? "" : "LP"}</span>
            <span className="text-right">{isRace || isQual ? "" : "Gap"}</span>
            <span className="text-right">Time</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={`${r.driver}-${i}`}
              className="relative grid grid-cols-[44px_1fr_56px_92px_92px] gap-2 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-overlay-2/30 transition-colors"
            >
              <span
                className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                style={{ backgroundColor: r.teamColor }}
              />
              <span className="font-mono font-bold">{r.pos || "-"}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-semibold truncate">{r.driver}</span>
                  {r.flag && (
                    <img src={r.flag} alt="" className="w-4 h-4 rounded-full shrink-0 object-cover" />
                  )}
                </span>
                <span className="block text-[11px] text-text-muted truncate">{r.team}</span>
              </span>
              <span className="text-right font-mono text-text-muted text-sm">
                {isRace ? r.grid || "-" : isQual ? "" : r.laps || "-"}
              </span>
              <span className="text-right font-mono text-text-muted text-sm">
                {isRace || isQual ? "" : i === 0 ? r.time || "-" : r.gap || "-"}
              </span>
              <span className="text-right font-mono text-sm font-semibold">
                {isQual
                  ? qualView === "q1" ? r.q1 || "-"
                    : qualView === "q2" ? r.q2 || "-"
                    : qualView === "q3" ? r.q3 || "-"
                    : r.time || "-"
                  : r.time || r.status || "-"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ race flow ----------------------------- */

function RaceFlowTab({ raceId }: { raceId: string }) {
  const [data, setData] = useState<Laps | null>(null);
  const [busy, setBusy] = useState(true);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    (async () => {
      try {
        const res = await fetch(`/api/f1/laps?id=${encodeURIComponent(raceId)}`);
        const json: Laps = await res.json();
        if (alive) setData(json);
      } catch {
        if (alive) setData(null);
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [raceId]);

  if (busy) return <div className="h-96 bg-overlay-2 rounded-2xl animate-pulse" />;

  if (!data || data.laps.length === 0) {
    return (
      <div className="glass-card rounded-xl p-10 text-center">
        <p className="text-text-muted text-sm">
          Lap-by-lap data appears once the race has run.
        </p>
      </div>
    );
  }

  const rows = data.drivers.length || 20;
  const W = 1000;
  const H = rows * 26;
  const lapX = (i: number) => (i / data.laps.length) * (W - 40) + 30;
  const posY = (p: number) => ((p - 0.5) / rows) * H;

  return (
    <div className="space-y-5">
      <div className="glass-card rounded-2xl border border-border/60 p-5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-4">
          Position by lap · {data.laps.length} laps
        </h3>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px]" style={{ height: H }}>
            {Array.from({ length: rows }, (_, i) => (
              <g key={i}>
                <line
                  x1={28} y1={posY(i + 1)} x2={W} y2={posY(i + 1)}
                  stroke="currentColor" strokeWidth={1}
                  className="text-border" strokeDasharray="3 4"
                />
                <text
                  x={16} y={posY(i + 1) + 4} textAnchor="middle"
                  className="fill-current text-text-muted" style={{ fontSize: 10 }}
                >
                  {i + 1}
                </text>
              </g>
            ))}

            {data.drivers.map((d) => {
              const pts: string[] = [];
              if (d.grid > 0) pts.push(`${lapX(0)},${posY(d.grid)}`);
              data.laps.forEach((lap, idx) => {
                const p = lap.positions.find((x) => x.driverId === d.driverId);
                if (p) pts.push(`${lapX(idx + 1)},${posY(p.position)}`);
              });
              if (pts.length < 2) return null;
              const dim = focus !== null && focus !== d.driverId;
              return (
                <polyline
                  key={d.driverId}
                  points={pts.join(" ")}
                  fill="none"
                  stroke={d.teamColor}
                  strokeWidth={focus === d.driverId ? 3 : 1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={dim ? 0.12 : 1}
                />
              );
            })}
          </svg>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-text-muted mt-2 px-7">
          <span>GRID</span>
          <span>LAP {data.laps.length}</span>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-border/60 p-4">
        <div className="flex flex-wrap gap-2">
          {data.drivers.map((d) => {
            const on = focus === d.driverId;
            return (
              <button
                key={d.driverId}
                onClick={() => setFocus(on ? null : d.driverId)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all cursor-pointer"
                style={{
                  borderColor: on ? d.teamColor : "transparent",
                  backgroundColor: on ? `${d.teamColor}22` : "rgba(255,255,255,0.04)",
                }}
              >
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[9px] text-white font-black"
                  style={{ backgroundColor: d.teamColor }}
                >
                  {d.number}
                </span>
                {d.code}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ standings ----------------------------- */

function StandingsTab({
  drivers,
  teams,
}: {
  drivers: DriverStanding[];
  teams: TeamStanding[];
}) {
  const [mode, setMode] = useState<"drivers" | "teams">("drivers");

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Pill label="Drivers" on={mode === "drivers"} onClick={() => setMode("drivers")} />
        <Pill label="Teams" on={mode === "teams"} onClick={() => setMode("teams")} />
      </div>

      <div className="glass-card rounded-2xl border border-border/60 overflow-hidden">
        <div className="grid grid-cols-[44px_1fr_48px_48px_56px_64px] gap-2 px-4 py-3 border-b border-border text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <span>Pos</span>
          <span>{mode === "drivers" ? "Driver" : "Team"}</span>
          <span className="text-right">W</span>
          <span className="text-right">PP</span>
          <span className="text-right">PDS</span>
          <span className="text-right">PTS</span>
        </div>

        {mode === "drivers"
          ? drivers.map((d) => (
              <div
                key={d.position}
                className="relative grid grid-cols-[44px_1fr_48px_48px_56px_64px] gap-2 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-overlay-2/30 transition-colors items-center"
              >
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                  style={{ backgroundColor: d.teamColor }}
                />
                <span className="font-mono font-bold">{d.position}</span>
                <span className="flex items-center gap-3 min-w-0">
                  <img
                    src={d.image || "https://a.espncdn.com/i/headshots/nophoto.png"}
                    alt={d.name}
                    onError={(e) => {
                      e.currentTarget.src = "https://a.espncdn.com/i/headshots/nophoto.png";
                    }}
                    className="w-8 h-8 rounded-full object-cover bg-overlay-2 shrink-0 border border-border/30"
                  />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-semibold truncate">{d.name}</span>
                      {d.flag && (
                        <img src={d.flag} alt="" className="w-4 h-4 rounded-full shrink-0 object-cover" />
                      )}
                    </span>
                    <span className="block text-[11px] text-text-muted truncate">
                      {d.constructor}
                    </span>
                  </span>
                </span>
                <span className="text-right font-mono text-text-muted text-sm">{d.wins}</span>
                <span className="text-right font-mono text-text-muted text-sm">{d.poles}</span>
                <span className="text-right font-mono text-text-muted text-sm">{d.podiums}</span>
                <span className="text-right font-mono font-bold text-accent">{d.points}</span>
              </div>
            ))
          : teams.map((t) => (
              <div
                key={t.position}
                className="relative grid grid-cols-[44px_1fr_48px_48px_56px_64px] gap-2 px-4 py-3 border-b border-border/30 last:border-0 hover:bg-overlay-2/30 transition-colors items-center"
              >
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r"
                  style={{ backgroundColor: t.teamColor }}
                />
                <span className="font-mono font-bold">{t.position}</span>
                <span className="font-semibold truncate">{t.name}</span>
                <span className="text-right font-mono text-text-muted text-sm">{t.wins}</span>
                <span className="text-right font-mono text-text-muted text-sm">{t.poles}</span>
                <span className="text-right font-mono text-text-muted text-sm">{t.podiums}</span>
                <span className="text-right font-mono font-bold text-accent">{t.points}</span>
              </div>
            ))}
      </div>
    </div>
  );
}

/* ------------------------------ calendar ------------------------------ */

function CalendarTab({ races, onPick }: { races: Race[]; onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {races.map((r) => (
        <button
          key={r.id}
          onClick={() => onPick(r.id)}
          className={`text-left rounded-xl border p-4 transition-colors cursor-pointer ${
            r.isLive
              ? "border-red-500/30 bg-red-500/5"
              : r.status === "post"
                ? "border-border/40 bg-overlay-1 opacity-70 hover:opacity-100"
                : "border-border/60 bg-overlay-1 hover:border-accent/40"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted">
              Round {r.round}
            </span>
            {r.isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          </div>
          <div className="flex items-center gap-2">
            {r.flag && <img src={r.flag} alt="" className="w-5 h-5 rounded-full object-cover" />}
            <p className="text-sm font-semibold truncate">{r.title}</p>
          </div>
          <p className="text-[11px] text-text-muted truncate mt-0.5">
            {r.locality}
            {r.country ? `, ${r.country}` : ""}
          </p>
          {r.team1Full && (
            <p className="text-[11px] text-accent mt-1.5 truncate">🏆 {r.team1Full}</p>
          )}
        </button>
      ))}
    </div>
  );
}

function Pill({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
        on ? "bg-accent text-bg" : "bg-overlay-1 text-text-dim border border-border hover:text-text-primary"
      }`}
    >
      {label}
    </button>
  );
}
