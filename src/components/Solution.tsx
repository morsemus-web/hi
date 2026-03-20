"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

const slides = [
  {
    sport: "Cricket",
    color: "bg-cyan-500",
    colorHex: "#6ba3be",
    barColor: "bg-cyan-500/60",
    barWidth: "w-[72%]",
    dot: "bg-sport-cricket",
    headline: "India vs Pakistan",
    detail: "IND 287/4 · PAK · 43.1 ov",
    alert: "SIX! Kohli launches it over long-on!",
    left: "IND",
    score: "287/4",
    right: "PAK",
    meta: "43.1 ov",
    bg: "vscode",
    bgLabel: "While you code",
  },
  {
    sport: "F1",
    color: "bg-red-500",
    colorHex: "#b85e5e",
    barColor: "bg-red-500/60",
    barWidth: "w-[44%]",
    dot: "bg-sport-f1",
    headline: "Melbourne Grand Prix",
    detail: "Lap 34/78 · Hamilton P4",
    alert: "OVERTAKE! Hamilton passes Norris for P4",
    left: "HAM",
    score: "P4",
    right: "LAP 34/78",
    meta: "1:19.442",
    bg: "meeting",
    bgLabel: "During meetings",
  },
  {
    sport: "Basketball",
    color: "bg-amber-500",
    colorHex: "#b8a45e",
    barColor: "bg-amber-500/60",
    barWidth: "w-[65%]",
    dot: "bg-sport-basketball",
    headline: "Lakers vs Celtics",
    detail: "Q3 · 4:21 · LAL 89 - 85 BOS",
    alert: "LeBron James drills a deep 3-pointer!",
    left: "LAL",
    score: "89-85",
    right: "BOS",
    meta: "Q3 4:21",
    bg: "spreadsheet",
    bgLabel: "In spreadsheets",
  },
  {
    sport: "Football",
    color: "bg-orange-500",
    colorHex: "#b8865e",
    barColor: "bg-orange-500/60",
    barWidth: "w-[82%]",
    dot: "bg-sport-football",
    headline: "Real Madrid vs Barcelona",
    detail: "78' · RMA 3 - 2 BAR",
    alert: "GOAL! Mbappe drills it in for a comeback!",
    left: "RMA",
    score: "3-2",
    right: "BAR",
    meta: "78'",
    bg: "browser",
    bgLabel: "While browsing",
  },
];

/* ── SVG mockup backgrounds ── */

function BgVSCode({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "#1e1e1e" : "#f3f3f3";
  const sidebar = isDark ? "#252526" : "#e8e8e8";
  const tab = isDark ? "#2d2d2d" : "#ffffff";
  const border = isDark ? "border-white/5" : "border-black/8";
  const txt = isDark ? "text-white" : "text-black";
  const fg = (o: number) => `${txt}/${o}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`h-8 bg-[${bg}] ${border} border-b flex items-center px-4 gap-1.5`} style={{ backgroundColor: bg }}>
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className={`ml-4 text-[9px] ${fg(40)} font-mono`}>app.tsx — ScoreDeck — Visual Studio Code</span>
      </div>
      <div className="flex h-[calc(100%-32px)]">
        <div className={`w-12 ${border} border-r flex flex-col items-center gap-4 pt-4`} style={{ backgroundColor: sidebar }}>
          <div className={`w-6 h-6 rounded ${isDark ? "bg-white/10" : "bg-black/8"}`} />
          <div className={`w-6 h-6 rounded ${isDark ? "bg-white/5" : "bg-black/5"}`} />
          <div className={`w-6 h-6 rounded ${isDark ? "bg-white/5" : "bg-black/5"}`} />
          <div className={`w-6 h-6 rounded ${isDark ? "bg-white/5" : "bg-black/5"}`} />
        </div>
        <div className={`w-44 ${border} border-r p-3`} style={{ backgroundColor: bg }}>
          <div className={`text-[8px] ${fg(30)} font-mono uppercase mb-3`}>Explorer</div>
          {["src/", "  App.tsx", "  index.ts", "  styles.css", "components/", "  Header.tsx", "  Sidebar.tsx", "  Modal.tsx", "utils/", "  api.ts"].map((f, i) => (
            <div key={i} className={`text-[8px] font-mono py-0.5 ${i === 1 ? `${fg(50)} ${isDark ? "bg-white/5" : "bg-black/5"} px-1 rounded` : fg(20)}`}>
              {f}
            </div>
          ))}
        </div>
        <div className="flex-1 p-4" style={{ backgroundColor: bg }}>
          <div className="flex gap-0.5 mb-3">
            <div className={`text-[8px] font-mono ${fg(40)} px-4 py-1.5 rounded-t border-t border-cyan-500/50`} style={{ backgroundColor: tab }}>App.tsx</div>
            <div className={`text-[8px] font-mono ${fg(20)} px-4 py-1.5`}>index.ts</div>
            <div className={`text-[8px] font-mono ${fg(15)} px-4 py-1.5`}>styles.css</div>
          </div>
          {[
            { num: 1, indent: 0, kw: "import", txt: " React from ", str: "'react'" },
            { num: 2, indent: 0, kw: "import", txt: " { useState, useEffect } from ", str: "'react'" },
            { num: 3, indent: 0, kw: "import", txt: " { ScoreCard } from ", str: "'./components'" },
            { num: 4, indent: 0, txt: "" },
            { num: 5, indent: 0, kw: "interface", txt: " MatchData {" },
            { num: 6, indent: 1, txt: "id: number" },
            { num: 7, indent: 1, txt: "score: string" },
            { num: 8, indent: 1, txt: "status: 'live' | 'finished'" },
            { num: 9, indent: 0, txt: "}" },
            { num: 10, indent: 0, txt: "" },
            { num: 11, indent: 0, kw: "export default function", txt: " App() {" },
            { num: 12, indent: 1, kw: "const", txt: " [matches, setMatches] = useState<MatchData[]>([])" },
            { num: 13, indent: 1, kw: "const", txt: " [loading, setLoading] = useState(true)" },
            { num: 14, indent: 1, txt: "" },
            { num: 15, indent: 1, kw: "useEffect", txt: "(() => {" },
            { num: 16, indent: 2, txt: "fetchLiveScores().then(setMatches)" },
            { num: 17, indent: 1, txt: "}, [])" },
            { num: 18, indent: 0, txt: "" },
            { num: 19, indent: 1, kw: "return", txt: " (" },
            { num: 20, indent: 2, txt: "<div className=\"app\">" },
          ].map((line) => (
            <div key={line.num} className="flex gap-3 text-[8px] font-mono leading-[2]">
              <span className={`${fg(15)} w-5 text-right select-none`}>{line.num}</span>
              <span style={{ paddingLeft: `${line.indent * 14}px` }}>
                {line.kw && <span className={isDark ? "text-purple-400/60" : "text-purple-600/70"}>{line.kw}</span>}
                <span className={fg(25)}>{line.txt}</span>
                {line.str && <span className={isDark ? "text-green-400/50" : "text-green-600/60"}>{line.str}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BgMeeting({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "#1a1a2e" : "#f0f0f8";
  const card = isDark ? "#2a2a3e" : "#e0e0f0";
  const border = isDark ? "border-white/5" : "border-black/8";
  const txt = isDark ? "text-white" : "text-black";
  const fg = (o: number) => `${txt}/${o}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`h-8 ${border} border-b flex items-center px-4 gap-1.5`} style={{ backgroundColor: bg }}>
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className={`ml-4 text-[9px] ${fg(40)}`}>Team Standup — Google Meet</span>
      </div>
      <div className="p-4 grid grid-cols-3 grid-rows-2 gap-3 h-[calc(100%-64px)]">
        {[
          { name: "You", speaking: false },
          { name: "Sarah K.", speaking: true },
          { name: "Mike R.", speaking: false },
          { name: "Alex C.", speaking: false },
          { name: "Lisa T.", speaking: false },
          { name: "Dan W.", speaking: false },
        ].map((p, i) => (
          <div key={i} className={`rounded-xl flex flex-col items-center justify-center border ${p.speaking ? "border-blue-400/30" : border}`} style={{ backgroundColor: card }}>
            <div className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/8"}`}>
              <span className={`text-[12px] ${fg(30)} font-medium`}>{p.name[0]}</span>
            </div>
            <span className={`text-[8px] ${fg(25)}`}>{p.name}</span>
            {p.speaking && <div className="mt-1 flex gap-0.5">{[1,2,3,4,5].map(j => <div key={j} className="w-0.5 bg-blue-400/50 rounded" style={{ height: `${4 + Math.sin(j) * 4}px` }} />)}</div>}
          </div>
        ))}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-12 ${border} border-t flex items-center justify-center gap-6 px-6`} style={{ backgroundColor: bg }}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/8"}`}><div className={`w-3.5 h-2.5 rounded-sm ${isDark ? "bg-white/20" : "bg-black/15"}`} /></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/8"}`}><div className={`w-2.5 h-3.5 rounded-sm ${isDark ? "bg-white/20" : "bg-black/15"}`} /></div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/8"}`}><div className={`w-3 h-3 rounded-sm ${isDark ? "bg-white/15" : "bg-black/10"}`} /></div>
        <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center"><div className={`w-4 h-1.5 rounded ${isDark ? "bg-white/30" : "bg-white/50"}`} /></div>
      </div>
    </div>
  );
}

function BgSpreadsheet({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "#1a2e1a" : "#f0f8f0";
  const toolbar = isDark ? "#1e2e1e" : "#e8f4e8";
  const border = isDark ? "border-white/5" : "border-black/8";
  const txt = isDark ? "text-white" : "text-black";
  const fg = (o: number) => `${txt}/${o}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`h-8 ${border} border-b flex items-center px-4 gap-1.5`} style={{ backgroundColor: bg }}>
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <span className={`ml-4 text-[9px] ${fg(40)}`}>Q4 Revenue Report — Google Sheets</span>
      </div>
      <div className={`h-6 ${border} border-b flex items-center px-3 gap-3`} style={{ backgroundColor: toolbar }}>
        {["B", "I", "U", "$", "%", "123"].map((b, i) => (
          <span key={i} className={`text-[8px] ${fg(20)} font-mono`}>{b}</span>
        ))}
        <div className={`ml-auto text-[8px] ${fg(15)} font-mono`}>fx =SUM(B2:B12)</div>
      </div>
      <div className="p-0">
        <div className={`flex ${border} border-b`}>
          <div className={`w-10 h-6 ${border} border-r`} />
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((c) => (
            <div key={c} className={`flex-1 h-6 ${border} border-r flex items-center justify-center`}>
              <span className={`text-[8px] ${fg(20)} font-mono`}>{c}</span>
            </div>
          ))}
        </div>
        {[
          ["Quarter", "Revenue", "Growth", "Users", "MRR", "Churn", "NPS", "ARR"],
          ["Q1 2025", "$142K", "+12%", "2,340", "$11.8K", "2.1%", "72", "$142K"],
          ["Q2 2025", "$168K", "+18%", "3,120", "$14.0K", "1.8%", "76", "$168K"],
          ["Q3 2025", "$195K", "+16%", "4,050", "$16.2K", "1.5%", "79", "$195K"],
          ["Q4 2025", "$234K", "+20%", "5,200", "$19.5K", "1.2%", "83", "$234K"],
          ["Total", "$739K", "+17%", "—", "—", "—", "—", "$739K"],
          ["", "", "", "", "", "", "", ""],
          ["", "", "", "", "", "", "", ""],
          ["Target", "$800K", "", "6,000", "$22K", "<2%", ">75", "$960K"],
          ["Delta", "-$61K", "", "-800", "-$2.5K", "", "", "-$221K"],
          ["", "", "", "", "", "", "", ""],
          ["Forecast", "$820K", "+11%", "6,400", "$23K", "1.1%", "85", "$984K"],
        ].map((row, ri) => (
          <div key={ri} className={`flex border-b ${isDark ? "border-white/[0.03]" : "border-black/[0.05]"}`}>
            <div className={`w-10 h-5 ${border} border-r flex items-center justify-center`}>
              <span className={`text-[7px] ${fg(15)} font-mono`}>{ri + 1}</span>
            </div>
            {row.map((cell, ci) => (
              <div key={ci} className={`flex-1 h-5 border-r ${isDark ? "border-white/[0.03]" : "border-black/[0.05]"} flex items-center px-1.5 ${ri === 0 ? (isDark ? "bg-white/[0.02]" : "bg-black/[0.03]") : ""} ${ri === 5 ? (isDark ? "bg-white/[0.01]" : "bg-black/[0.02]") : ""}`}>
                <span className={`text-[7px] font-mono ${ri === 0 ? `${fg(30)} font-bold` : ci === 2 && cell.startsWith("+") ? (isDark ? "text-green-400/50" : "text-green-600/60") : cell.startsWith("-") ? (isDark ? "text-red-400/50" : "text-red-600/60") : fg(20)}`}>
                  {cell}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BgBrowser({ isDark }: { isDark: boolean }) {
  const bg = isDark ? "#1e1e1e" : "#f5f5f5";
  const tabBar = isDark ? "#252525" : "#e8e8e8";
  const tabActive = isDark ? "#1e1e1e" : "#ffffff";
  const tabInactive = isDark ? "#2a2a2a" : "#e0e0e0";
  const urlBar = isDark ? "#2a2a2a" : "#ffffff";
  const video = isDark ? "#0f0f0f" : "#e0e0e0";
  const thumb = isDark ? "#1a1a1a" : "#e8e8e8";
  const border = isDark ? "border-white/5" : "border-black/8";
  const txt = isDark ? "text-white" : "text-black";
  const fg = (o: number) => `${txt}/${o}`;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`h-8 ${border} border-b flex items-center px-4 gap-1.5`} style={{ backgroundColor: bg }}>
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
      </div>
      <div className="h-6 flex items-end px-2 gap-1" style={{ backgroundColor: tabBar }}>
        <div className={`px-4 py-1.5 rounded-t text-[8px] ${fg(30)} font-mono`} style={{ backgroundColor: tabActive }}>YouTube</div>
        <div className={`px-4 py-1.5 rounded-t text-[8px] ${fg(15)} font-mono`} style={{ backgroundColor: tabInactive }}>Gmail</div>
        <div className={`px-4 py-1.5 rounded-t text-[8px] ${fg(15)} font-mono`} style={{ backgroundColor: tabInactive }}>Docs</div>
        <div className={`px-4 py-1.5 rounded-t text-[8px] ${fg(15)} font-mono`} style={{ backgroundColor: tabInactive }}>GitHub</div>
      </div>
      <div className={`h-8 ${border} border-b flex items-center px-4`} style={{ backgroundColor: bg }}>
        <div className="rounded-full flex-1 h-5 flex items-center px-4" style={{ backgroundColor: urlBar }}>
          <span className={`text-[8px] ${fg(20)} font-mono`}>youtube.com/watch?v=dQw4w9WgXcQ</span>
        </div>
      </div>
      <div className="p-4 flex gap-4" style={{ backgroundColor: bg }}>
        <div className="flex-1">
          <div className="aspect-video rounded-lg mb-3 flex items-center justify-center" style={{ backgroundColor: video }}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isDark ? "bg-white/10" : "bg-black/8"}`}>
              <div className={`w-0 h-0 border-l-[8px] border-y-[6px] border-y-transparent ml-1 ${isDark ? "border-l-white/30" : "border-l-black/20"}`} />
            </div>
          </div>
          <div className={`text-[9px] ${fg(30)} font-medium mb-1`}>How to Build a Startup in 2025 — Full Guide</div>
          <div className={`text-[7px] ${fg(15)}`}>1.2M views · 3 months ago</div>
          <div className={`mt-3 pt-3 ${border} border-t`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-full ${isDark ? "bg-white/10" : "bg-black/8"}`} />
              <div className={`text-[8px] ${fg(25)}`}>TechStartup Pro</div>
            </div>
            <div className={`text-[7px] ${fg(15)} leading-relaxed`}>In this video we cover everything you need to know about launching...</div>
          </div>
        </div>
        <div className="w-32 space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-16 h-9 rounded flex-shrink-0" style={{ backgroundColor: thumb }} />
              <div>
                <div className={`text-[6px] ${fg(20)} leading-tight`}>Video title here that wraps to two lines</div>
                <div className={`text-[5px] ${fg(10)} mt-0.5`}>Channel · 42K</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const bgComponents: Record<string, React.FC<{ isDark: boolean }>> = {
  vscode: BgVSCode,
  meeting: BgMeeting,
  spreadsheet: BgSpreadsheet,
  browser: BgBrowser,
};

export default function Solution() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const handleSelect = useCallback((i: number) => {
    setActive(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 10000);
  }, []);

  const slide = slides[active];

  // Theme-aware card styles
  const cardBg = isDark ? "rgba(10,10,10,0.92)" : "rgba(255,255,255,0.92)";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const scoreBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const scoreBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const toolbarBg = isDark ? "rgba(20,20,20,0.95)" : "rgba(245,245,245,0.95)";

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-8 border-t border-border overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Full-section background — cross-fade between work contexts */}
      {slides.map((s, i) => {
        const Bg = bgComponents[s.bg];
        return (
          <div
            key={s.bg}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === active ? (isDark ? 0.35 : 0.3) : 0 }}
          >
            <div className="absolute inset-0 scale-[1.4] origin-top-left">
              <Bg isDark={isDark} />
            </div>
          </div>
        );
      })}

      {/* Gradient overlays — lighter to show more background */}
      <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-r from-bg/50 via-transparent to-bg/30" : "bg-gradient-to-r from-bg/60 via-bg/10 to-bg/40"}`} />
      <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-t from-bg/40 via-transparent to-bg/30" : "bg-gradient-to-t from-bg/50 via-transparent to-bg/35"}`} />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-16 items-start">

          {/* ── Left panel: Header + Sport Switcher ── */}
          <div className="md:sticky md:top-32">
            <div className="text-center md:text-left mb-8 md:mb-10">
              <p className="text-[10px] font-light uppercase tracking-[0.25em] text-accent/60 mb-4">
                The solution
              </p>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-4 text-text-primary">
                Meet ScoreDeck
              </h2>
              <p className="text-text-dim text-sm font-light leading-relaxed max-w-md mx-auto md:mx-0">
                A lightweight overlay on your desktop. Live scores, key moments, zero interruptions.
              </p>
            </div>

            {/* Mobile: horizontal pills */}
            <div className="flex gap-2 justify-center mb-8 md:hidden">
              {slides.map((s, i) => (
                <button
                  key={s.sport}
                  onClick={() => handleSelect(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.1em] font-light transition-all duration-300 cursor-pointer ${
                    i === active
                      ? "bg-overlay-10 text-text-primary border border-overlay-15"
                      : "text-text-muted/50 border border-transparent hover:text-text-muted"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${i === active ? "opacity-100" : "opacity-40"}`} />
                  {s.sport}
                </button>
              ))}
            </div>

            {/* Desktop: vertical stacked buttons */}
            <div className="hidden md:flex flex-col gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.sport}
                  onClick={() => handleSelect(i)}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all duration-500 cursor-pointer ${
                    i === active
                      ? "bg-overlay-5 border border-overlay-10 shadow-lg backdrop-blur-sm"
                      : "bg-transparent border border-transparent hover:bg-overlay-2 hover:border-overlay-5"
                  }`}
                  style={i === active ? { boxShadow: `0 0 30px ${s.colorHex}15, 0 0 60px ${s.colorHex}08` } : undefined}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot} transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-30 group-hover:opacity-60"}`} />
                  <div className="flex-1">
                    <span className={`text-[11px] uppercase tracking-[0.15em] font-medium transition-colors duration-300 ${
                      i === active ? "text-text-primary" : "text-text-muted/40 group-hover:text-text-muted/70"
                    }`}>
                      {s.sport}
                    </span>
                    <p className={`text-[9px] mt-0.5 transition-all duration-300 ${
                      i === active ? "text-text-dim/60 opacity-100" : "text-text-muted/20 opacity-0 group-hover:opacity-60"
                    }`}>
                      {s.bgLabel}
                    </p>
                  </div>
                  <div className={`w-0.5 h-6 rounded-full transition-all duration-500 ${
                    i === active ? `${s.color} opacity-60` : "bg-overlay-5 opacity-0"
                  }`} />
                </button>
              ))}
            </div>
          </div>

          {/* ── Right panel: Score content ── */}
          <div className="flex items-center justify-center md:min-h-[420px]">
            <div className="w-full max-w-[560px]">
              {/* Context badge */}
              <div className="mb-5 flex justify-center md:justify-start">
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-text-muted/40 bg-overlay-5 px-3 py-1.5 rounded-lg border border-overlay-5 backdrop-blur-sm">
                  {slide.bgLabel}
                </span>
              </div>

              {/* Main score card */}
              <div
                className="backdrop-blur-xl rounded-2xl p-6 sm:p-8 transition-all duration-500"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                  boxShadow: `0 0 40px ${slide.colorHex}10, 0 4px 30px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                {/* Sport + Live badge */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${slide.dot}`} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted/50">
                    {slide.sport}
                  </span>
                  <span className="ml-auto flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.15em] text-red-400/60 font-medium">Live</span>
                  </span>
                </div>

                {/* Match headline */}
                <h3 className="text-xl sm:text-2xl font-semibold text-text-primary tracking-[-0.01em] mb-1">
                  {slide.headline}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-text-muted/50 font-light mb-6">
                  {slide.detail}
                </p>

                {/* Score display */}
                <div
                  className="flex items-center justify-between rounded-xl px-5 py-4 mb-5"
                  style={{ backgroundColor: scoreBg, border: `1px solid ${scoreBorder}` }}
                >
                  <span className="text-sm sm:text-base font-bold text-text-primary/80 tracking-wide">{slide.left}</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{slide.score}</span>
                  <span className="text-sm sm:text-base font-bold text-text-primary/80 tracking-wide">{slide.right}</span>
                </div>

                {/* Alert banner */}
                <div className="bg-accent/[0.06] border border-accent/[0.12] rounded-lg px-4 py-3 mb-5">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-accent/70 font-medium mb-1">
                    Key Event
                  </p>
                  <p className="text-[12px] sm:text-[13px] text-text-dim font-light leading-relaxed">
                    {slide.alert}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-text-muted/40 font-mono">{slide.meta}</span>
                  <div className="flex-1 h-[3px] bg-overlay-5 rounded-full overflow-hidden">
                    <div className={`h-full ${slide.barColor} rounded-full transition-all duration-700 ${slide.barWidth}`} />
                  </div>
                </div>
              </div>

              {/* Toolbar mockup below card */}
              <div className="mt-4 max-w-[360px] mx-auto">
                <div
                  className="backdrop-blur-xl rounded-lg px-4 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: toolbarBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${slide.dot}`} />
                    <span className="text-[11px] font-bold text-text-primary/90">{slide.left}</span>
                    <span className="text-[14px] font-extrabold text-text-primary">{slide.score}</span>
                    <span className="text-[11px] font-bold text-text-primary/90">{slide.right}</span>
                  </div>
                  <div className="w-px h-4 bg-overlay-10" />
                  <span className="text-[10px] text-text-muted/50 font-mono">{slide.meta}</span>
                  <div className="flex gap-1">
                    {slides.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === active ? "bg-text-primary/60" : "bg-text-primary/20"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-[2px] bg-overlay-5 rounded-b-md overflow-hidden">
                  <div className={`h-full ${slide.barColor} rounded-b-md transition-all duration-500 ${slide.barWidth}`} />
                </div>
                <p className="text-center text-[8px] text-text-muted/30 mt-2 font-mono uppercase tracking-[0.15em]">
                  Your taskbar toolbar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
