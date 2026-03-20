"use client";

import { useEffect, useRef, useState } from "react";

const sports = [
  { id: "football", label: "Football", icon: "⚽", accent: "#f97316" },
  { id: "cricket", label: "Cricket", icon: "🏏", accent: "#06b6d4" },
  { id: "f1", label: "Formula 1", icon: "🏎", accent: "#ef4444" },
] as const;

type SportId = (typeof sports)[number]["id"];

// Team colors for F1
const teamColors: Record<string, string> = {
  "Red Bull": "#3671C6",
  McLaren: "#FF8000",
  Ferrari: "#E8002D",
  Mercedes: "#27F4D2",
  Williams: "#64C4FF",
};

const drivers = [
  { name: "VER", team: "Red Bull", pos: 1 },
  { name: "NOR", team: "McLaren", pos: 2 },
  { name: "LEC", team: "Ferrari", pos: 3 },
  { name: "HAM", team: "Mercedes", pos: 4 },
  { name: "PIA", team: "McLaren", pos: 5 },
  { name: "SAI", team: "Williams", pos: 6 },
];

function FootballViz({ tick }: { tick: number }) {
  const ballX = 50 + Math.sin(tick * 0.15) * 35 + Math.cos(tick * 0.08) * 10;
  const ballY = 50 + Math.cos(tick * 0.12) * 30 + Math.sin(tick * 0.2) * 8;
  const bx = Math.max(5, Math.min(95, ballX));
  const by = Math.max(5, Math.min(95, ballY));

  const actions = [
    "MUN building up from midfield",
    "Throw-in for ARS",
    "MUN pressing high up the pitch",
    "Corner kick awarded to ARS",
    "Counter-attack by MUN!",
    "Foul — Free kick to ARS",
    "MUN keeps possession in ARS half",
  ];

  return (
    <>
      <svg viewBox="0 0 300 200" className="w-full h-full">
        {/* Pitch */}
        <rect x="10" y="10" width="280" height="180" rx="4" fill="#1a3a1a" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="150" y1="10" x2="150" y2="190" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle cx="150" cy="100" r="25" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <circle cx="150" cy="100" r="2" fill="rgba(255,255,255,0.2)" />
        <rect x="10" y="55" width="45" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="245" y="55" width="45" height="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="10" y="75" width="20" height="50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <rect x="270" y="75" width="20" height="50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

        {/* Heat zone */}
        <circle cx={bx * 2.8 + 10} cy={by * 1.8 + 10} r="30" fill="rgba(255,165,0,0.12)">
          <animate attributeName="r" values="25;35;25" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Ball */}
        <circle cx={bx * 2.8 + 10} cy={by * 1.8 + 10} r="4" fill="white" style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.6))" }} />
        <circle cx={bx * 2.8 + 10} cy={by * 1.8 + 10} r="8" fill="none" stroke="rgba(255,165,0,0.4)" strokeWidth="1">
          <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 font-mono">{actions[tick % actions.length]}</span>
          <span className="text-[9px] text-orange-400/60 font-mono">{67 + (tick % 23)}&apos;</span>
        </div>
      </div>
    </>
  );
}

function CricketViz({ tick }: { tick: number }) {
  const pitchX = 0.3 + ((tick * 7) % 5) * 0.08;
  const pitchY = 0.2 + ((tick * 13) % 7) * 0.1;

  // Generate wagon wheel shots
  const shots = Array.from({ length: Math.min(tick, 8) }, (_, i) => ({
    angle: ((i * 47 + tick * 3) % 360) * (Math.PI / 180),
    dist: 0.3 + ((i * 11 + tick) % 7) * 0.1,
  }));

  const deliveries = [
    "Cummins bowls short, pulled for 4!",
    "Full delivery, driven through covers",
    "Dot ball! Beats the outside edge",
    "Single taken, rotates strike",
    "Yorker! Well dug out for 1",
    "FOUR! Swept fine to the boundary",
    "Defended solidly, no run",
  ];

  return (
    <>
      <svg viewBox="0 0 300 220" className="w-full h-full">
        {/* Stadium stands (outer ring) */}
        <ellipse cx="150" cy="110" rx="140" ry="100" fill="rgba(40,40,40,0.4)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* Stand sections */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          const x1 = 150 + Math.cos(angle) * 128;
          const y1 = 110 + Math.sin(angle) * 92;
          const x2 = 150 + Math.cos(angle) * 140;
          const y2 = 110 + Math.sin(angle) * 100;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />;
        })}

        {/* Stand labels */}
        <text x="150" y="8" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="5" fontFamily="monospace">PAVILION END</text>
        <text x="150" y="218" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontSize="5" fontFamily="monospace">STADIUM END</text>

        {/* Boundary rope */}
        <ellipse cx="150" cy="110" rx="120" ry="86" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeDasharray="6,3" />

        {/* Outfield grass */}
        <ellipse cx="150" cy="110" rx="118" ry="84" fill="rgba(26,60,26,0.45)" />

        {/* 30-yard circle */}
        <ellipse cx="150" cy="110" rx="55" ry="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,4" />

        {/* Inner ring / close-in fielding circle */}
        <ellipse cx="150" cy="110" rx="28" ry="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="2,3" />

        {/* Pitch strip (22 yards) */}
        <rect x="145" y="82" width="10" height="56" rx="1.5" fill="rgba(194,178,128,0.35)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />

        {/* Crease lines */}
        <line x1="141" y1="88" x2="159" y2="88" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        <line x1="141" y1="132" x2="159" y2="132" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        {/* Popping crease */}
        <line x1="143" y1="91" x2="157" y2="91" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <line x1="143" y1="129" x2="157" y2="129" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        {/* Stumps */}
        <rect x="148" y="86" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.25)" />
        <rect x="148" y="131" width="4" height="3" rx="0.5" fill="rgba(255,255,255,0.25)" />

        {/* Fielder positions (dots) */}
        {[
          [90, 70], [210, 70], [80, 140], [220, 140], [150, 45],
          [100, 110], [200, 110], [120, 155], [180, 155],
        ].map(([fx, fy], i) => (
          <circle key={`f${i}`} cx={fx} cy={fy} r="2" fill="rgba(255,255,255,0.12)" />
        ))}

        {/* Ball pitch marker */}
        <circle cx={145 + pitchX * 10} cy={88 + pitchY * 40} r="2.5" fill="rgba(255,50,50,0.8)" style={{ filter: "drop-shadow(0 0 3px rgba(255,50,50,0.5))" }} />
        <circle cx={145 + pitchX * 10} cy={88 + pitchY * 40} r="5" fill="none" stroke="rgba(255,50,50,0.3)" strokeWidth="0.8">
          <animate attributeName="r" values="3;7;3" dur="1.5s" repeatCount="indefinite" />
        </circle>

        {/* Wagon wheel shot lines */}
        {shots.map((shot, i) => {
          const endX = 150 + Math.cos(shot.angle) * shot.dist * 110;
          const endY = 110 + Math.sin(shot.angle) * shot.dist * 78;
          const isBoundary = shot.dist > 0.7;
          return (
            <g key={i}>
              <line x1="150" y1="110" x2={endX} y2={endY} stroke={`rgba(0,200,255,${0.15 + (i / shots.length) * 0.5})`} strokeWidth={isBoundary ? 1.5 : 0.8} />
              <circle cx={endX} cy={endY} r={isBoundary ? 3 : 1.5} fill={`rgba(0,200,255,${0.3 + (i / shots.length) * 0.5})`} />
              {isBoundary && (
                <text x={endX} y={endY - 5} textAnchor="middle" fill="rgba(0,200,255,0.4)" fontSize="5" fontFamily="monospace">4</text>
              )}
            </g>
          );
        })}

        {/* Batsman */}
        <circle cx="150" cy="128" r="2.5" fill="rgba(255,255,255,0.7)" />
        {/* Non-striker */}
        <circle cx="150" cy="90" r="2" fill="rgba(255,255,255,0.35)" />

        {/* Field position labels */}
        <text x="85" y="65" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">POINT</text>
        <text x="215" y="65" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">COVER</text>
        <text x="75" y="145" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">FINE LEG</text>
        <text x="225" y="145" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">SQUARE</text>
        <text x="150" y="40" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">LONG OFF</text>
        <text x="120" y="165" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">MID-WICKET</text>
        <text x="180" y="165" textAnchor="middle" fill="rgba(255,255,255,0.1)" fontSize="4.5" fontFamily="monospace">LONG ON</text>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 font-mono">{deliveries[tick % deliveries.length]}</span>
          <span className="text-[9px] text-cyan-400/60 font-mono">45.{tick % 6} ov</span>
        </div>
      </div>
    </>
  );
}

// Las Vegas GP circuit — actual SVG path from track map
const vegasPathD = "M44.554 308.699c5.621 2.881 52.896 30.75 61.836 35.774 7.261 4.082 18.085 9.124 31.856 14.165 21.976 8.045 37.495 12.32 56.449 15.126 21.08 3.122 32.091 4.52 44.738 5.282 7.963.48 26.891.171 58.557.96 57.855 1.441 148.06 2.882 150.61 2.882 1.873 0 3.123-.801 3.279-4.322.19-4.316 1.534-7.813 4.216-10.564 2.681-2.75 7.964-8.563 7.964-11.284 0-8.248.702-133.012.937-151.02.148-11.395-2.811-30.251-16.865-41.536-7.364-5.914-39.35-33.613-46.612-40.575-3.316-3.18-9.106-1.364-11.711 2.64-4.685 7.203-4.758 15.367 6.324 27.131 6.559 6.963 12.184 12.623 7.73 23.53-4.216 10.323-13.351 20.648-37.711 20.648-13.743 0-151.305.48-159.745.48-3.747 0-9.135-5.509-9.135-9.364 0-4.162-.234-19.048-.234-31.212 0-13.605-11.009-40.096-35.368-40.096-4.222 0-9.37-1.2-9.135 4.562.331 8.16-5.856 9.844-11.712 7.203-4.23-1.908-8.891-4.78-11.946-6.723-6.075-3.864-10.956 2.726-11.243 12.965-.61 21.762-2.012 52.195-2.576 64.345-1.171 25.21-10.557 39.821-32.09 44.658-24.09 5.41-34.476 14.223-40.025 26.134-4.714 10.12-6.23 20.945-7.742 29.763-1.655 9.648 7.227 7.357 9.354 8.448z";

function F1Viz({ tick }: { tick: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [driverPts, setDriverPts] = useState<{ name: string; team: string; pos: number; cx: number; cy: number }[]>([]);

  const lap = 20 + (tick % 30);
  const totalLaps = 50;
  const isCaution = lap % 15 < 3;

  // Get path length on mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Animate driver positions along the path
  useEffect(() => {
    if (!pathLength || !pathRef.current) return;
    const path = pathRef.current;
    const pts = drivers.map((d) => {
      const offset = (d.pos - 1) * 0.06;
      const progress = ((tick * 0.018 - offset) % 1 + 1) % 1;
      const pt = path.getPointAtLength(progress * pathLength);
      return { ...d, cx: pt.x, cy: pt.y };
    });
    setDriverPts(pts);
  }, [tick, pathLength]);

  // Sector lengths (approximate thirds of the circuit)
  const s1Len = pathLength * 0.35;
  const s2Len = pathLength * 0.35;
  const s3Len = pathLength * 0.30;

  const actions = [
    `Lap ${lap}/${totalLaps} — VER maintaining the gap`,
    "Pit window open — McLaren considering options",
    "DRS enabled — NOR closing in on VER",
    `Lap ${lap}/${totalLaps} — LEC pushing hard in sector 2`,
    "HAM sets fastest lap — 1:12.301",
    "PIA closing the gap to the podium positions",
  ];

  return (
    <>
      <svg viewBox="0 75 480 320" className="w-full h-full">
        {/* Hidden path for measurements */}
        <path ref={pathRef} d={vegasPathD} fill="none" stroke="none" />

        {/* Track background */}
        <path d={vegasPathD} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="24" strokeLinejoin="round" />

        {/* Sector 1: Yellow */}
        <path d={vegasPathD} fill="none" stroke="rgba(234,179,8,0.25)" strokeWidth="20" strokeLinejoin="round" strokeDasharray={`${s1Len} ${pathLength}`} strokeDashoffset="0" />
        {/* Sector 2: Red */}
        <path d={vegasPathD} fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="20" strokeLinejoin="round" strokeDasharray={`${s2Len} ${pathLength}`} strokeDashoffset={-s1Len} />
        {/* Sector 3: Cyan */}
        <path d={vegasPathD} fill="none" stroke="rgba(0,210,210,0.2)" strokeWidth="20" strokeLinejoin="round" strokeDasharray={`${s3Len} ${pathLength}`} strokeDashoffset={-(s1Len + s2Len)} />

        {/* Track center line */}
        <path d={vegasPathD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeLinejoin="round" />

        {/* Start/Finish marker */}
        <line x1="39" y1="305" x2="50" y2="312" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        <text x="30" y="300" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontWeight="bold" fontFamily="monospace">S/F</text>

        {/* Sector labels */}
        <text x="390" y="150" textAnchor="middle" fill="rgba(234,179,8,0.5)" fontSize="12" fontWeight="bold" fontFamily="monospace">S1</text>
        <text x="120" y="180" textAnchor="middle" fill="rgba(239,68,68,0.5)" fontSize="12" fontWeight="bold" fontFamily="monospace">S2</text>
        <text x="250" y="375" textAnchor="middle" fill="rgba(0,180,220,0.5)" fontSize="12" fontWeight="bold" fontFamily="monospace">S3</text>

        {/* Caution zone */}
        {isCaution && (
          <path d={vegasPathD} fill="none" stroke="rgba(255,200,0,0.15)" strokeWidth="24" strokeDasharray="30,80" strokeDashoffset={tick * 10} strokeLinejoin="round" />
        )}

        {/* Driver dots on track */}
        {driverPts.map((d) => {
          const color = teamColors[d.team] || "#888";
          return (
            <g key={d.name}>
              <circle cx={d.cx} cy={d.cy} r={d.pos <= 3 ? 8 : 5.5} fill={color} stroke={d.pos === 1 ? "white" : "none"} strokeWidth={d.pos === 1 ? 2 : 0} style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "cx 0.8s ease, cy 0.8s ease" }} />
              {d.pos <= 4 && (
                <text x={d.cx} y={d.cy - 12} textAnchor="middle" fill={color} fontSize="11" fontWeight="bold" fontFamily="monospace">
                  {d.name}
                </text>
              )}
            </g>
          );
        })}

        {/* Compact leaderboard */}
        <g transform="translate(10, 90)">
          {drivers.slice(0, 5).map((d, i) => {
            const color = teamColors[d.team] || "#888";
            return (
              <g key={d.name} transform={`translate(0, ${i * 22})`}>
                <rect x="0" y="0" width="90" height="18" rx="3" fill="rgba(0,0,0,0.5)" />
                <rect x="0" y="0" width="4" height="18" rx="1" fill={color} />
                <text x="12" y="13" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace">P{d.pos}</text>
                <text x="36" y="13" fill="rgba(255,255,255,0.8)" fontSize="10" fontWeight="bold" fontFamily="monospace">{d.name}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 font-mono">
            {isCaution ? "⚠ Yellow flag — caution in sector 2" : actions[tick % actions.length]}
          </span>
          <span className="text-[9px] text-red-400/60 font-mono">L{lap}/{totalLaps}</span>
        </div>
      </div>
    </>
  );
}

export default function LiveTracker() {
  const [active, setActive] = useState<SportId>("football");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(timer);
  }, []);

  const activeSport = sports.find((s) => s.id === active)!;

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-accent/60 mb-4">
            Popout Live Tracker
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-text-primary mb-4">
            A live game, in your corner.
          </h2>
          <p className="text-text-dim text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
            Detach a floating PiP widget that shows the spatial flow of the game in real-time.
            Always on top. Never in the way.
          </p>
        </div>

        {/* Sport tabs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-10 px-2">
          {sports.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[10px] sm:text-[11px] uppercase tracking-[0.08em] sm:tracking-[0.12em] font-medium transition-all duration-300 cursor-pointer border ${
                s.id === active
                  ? "border-overlay-15 bg-overlay-5 text-text-primary"
                  : "border-border text-text-muted/50 hover:border-border-hover hover:text-text-muted"
              }`}
            >
              <span className="text-xs sm:text-sm">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Popout widget mockup */}
        <div className="max-w-[400px] mx-auto">
          <div className="rounded-xl overflow-hidden bg-[rgba(10,10,10,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.06)]" style={{ borderColor: `${activeSport.accent}15` }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-sm"
                style={{ background: `${activeSport.accent}15` }}
              >
                {activeSport.icon}
              </div>
              <div>
                <p className="text-[12px] font-bold text-white/90 tracking-wide">
                  {active === "football" ? "MUN 2-1 ARS" : active === "cricket" ? "IND 210/3 vs AUS" : "Las Vegas GP — Lap 34/50"}
                </p>
                <p className="text-[9px] text-white/40 font-mono uppercase tracking-wider">
                  {active === "football" ? "67' • 2nd Half" : active === "cricket" ? "Day 2 • 45.2 ov" : "VER P1 • +1.2s NOR"}
                </p>
              </div>
              <div className="ml-auto flex gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse" />
                <span className="text-[8px] text-white/30 uppercase font-mono">Live</span>
              </div>
            </div>

            {/* Visualization area */}
            <div className="relative aspect-[3/2] bg-black/30">
              {active === "football" && <FootballViz tick={tick} />}
              {active === "cricket" && <CricketViz tick={tick} />}
              {active === "f1" && <F1Viz tick={tick} />}
            </div>
          </div>

          {/* Caption */}
          <p className="text-center text-[10px] text-text-muted/40 mt-4 font-light">
            Floating widget • Always on top • Draggable
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-12 max-w-[600px] mx-auto">
          {[
            { label: "Mini Pitch", desc: "Ball & zone tracking", icon: "⚽" },
            { label: "Wagon Wheel", desc: "Every delivery mapped", icon: "🏏" },
            { label: "Track Map", desc: "Live driver positions", icon: "🏎" },
          ].map((f) => (
            <div key={f.label} className="text-center p-4 rounded-lg bg-overlay-2 border border-border">
              <span className="text-xl mb-2 block">{f.icon}</span>
              <p className="text-[11px] font-medium text-text-primary/80 mb-0.5">{f.label}</p>
              <p className="text-[9px] text-text-muted/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
