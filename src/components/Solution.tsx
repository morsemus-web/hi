"use client";

import { useEffect, useState, useCallback } from "react";

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

function BgVSCode() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="h-8 bg-[#1e1e1e] border-b border-white/5 flex items-center px-4 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/40" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
        <div className="w-3 h-3 rounded-full bg-green-500/40" />
        <span className="ml-4 text-[9px] text-white/40 font-mono">app.tsx — ScoreDeck — Visual Studio Code</span>
      </div>
      <div className="flex h-[calc(100%-32px)]">
        <div className="w-12 bg-[#252526] border-r border-white/5 flex flex-col items-center gap-4 pt-4">
          <div className="w-6 h-6 rounded bg-white/10" />
          <div className="w-6 h-6 rounded bg-white/5" />
          <div className="w-6 h-6 rounded bg-white/5" />
          <div className="w-6 h-6 rounded bg-white/5" />
        </div>
        <div className="w-44 bg-[#1e1e1e] border-r border-white/5 p-3">
          <div className="text-[8px] text-white/30 font-mono uppercase mb-3">Explorer</div>
          {["src/", "  App.tsx", "  index.ts", "  styles.css", "components/", "  Header.tsx", "  Sidebar.tsx", "  Modal.tsx", "utils/", "  api.ts"].map((f, i) => (
            <div key={i} className={`text-[8px] font-mono py-0.5 ${i === 1 ? "text-white/50 bg-white/5 px-1 rounded" : "text-white/20"}`}>
              {f}
            </div>
          ))}
        </div>
        <div className="flex-1 bg-[#1e1e1e] p-4">
          <div className="flex gap-0.5 mb-3">
            <div className="text-[8px] font-mono text-white/40 bg-[#2d2d2d] px-4 py-1.5 rounded-t border-t border-cyan-500/50">App.tsx</div>
            <div className="text-[8px] font-mono text-white/20 px-4 py-1.5">index.ts</div>
            <div className="text-[8px] font-mono text-white/15 px-4 py-1.5">styles.css</div>
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
              <span className="text-white/15 w-5 text-right select-none">{line.num}</span>
              <span style={{ paddingLeft: `${line.indent * 14}px` }}>
                {line.kw && <span className="text-purple-400/60">{line.kw}</span>}
                <span className="text-white/25">{line.txt}</span>
                {line.str && <span className="text-green-400/50">{line.str}</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BgMeeting() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="h-8 bg-[#1a1a2e] border-b border-white/5 flex items-center px-4 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/40" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
        <div className="w-3 h-3 rounded-full bg-green-500/40" />
        <span className="ml-4 text-[9px] text-white/40">Team Standup — Google Meet</span>
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
          <div key={i} className={`rounded-xl bg-[#2a2a3e] flex flex-col items-center justify-center border ${p.speaking ? "border-blue-400/30" : "border-white/5"}`}>
            <div className="w-12 h-12 rounded-full bg-white/10 mb-2 flex items-center justify-center">
              <span className="text-[12px] text-white/30 font-medium">{p.name[0]}</span>
            </div>
            <span className="text-[8px] text-white/25">{p.name}</span>
            {p.speaking && <div className="mt-1 flex gap-0.5">{[1,2,3,4,5].map(j => <div key={j} className="w-0.5 h-2 bg-blue-400/40 rounded" style={{ height: `${4 + Math.sin(j) * 4}px` }} />)}</div>}
          </div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1a1a2e] border-t border-white/5 flex items-center justify-center gap-6 px-6">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><div className="w-3.5 h-2.5 bg-white/20 rounded-sm" /></div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><div className="w-2.5 h-3.5 bg-white/20 rounded-sm" /></div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><div className="w-3 h-3 bg-white/15 rounded-sm" /></div>
        <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center"><div className="w-4 h-1.5 bg-white/30 rounded" /></div>
      </div>
    </div>
  );
}

function BgSpreadsheet() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="h-8 bg-[#1a2e1a] border-b border-white/5 flex items-center px-4 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/40" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
        <div className="w-3 h-3 rounded-full bg-green-500/40" />
        <span className="ml-4 text-[9px] text-white/40">Q4 Revenue Report — Google Sheets</span>
      </div>
      <div className="h-6 bg-[#1e2e1e] border-b border-white/5 flex items-center px-3 gap-3">
        {["B", "I", "U", "$", "%", "123"].map((b, i) => (
          <span key={i} className="text-[8px] text-white/20 font-mono">{b}</span>
        ))}
        <div className="ml-auto text-[8px] text-white/15 font-mono">fx =SUM(B2:B12)</div>
      </div>
      <div className="p-0">
        <div className="flex border-b border-white/5">
          <div className="w-10 h-6 border-r border-white/5" />
          {["A", "B", "C", "D", "E", "F", "G", "H"].map((c) => (
            <div key={c} className="flex-1 h-6 border-r border-white/5 flex items-center justify-center">
              <span className="text-[8px] text-white/20 font-mono">{c}</span>
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
          <div key={ri} className="flex border-b border-white/[0.03]">
            <div className="w-10 h-5 border-r border-white/5 flex items-center justify-center">
              <span className="text-[7px] text-white/15 font-mono">{ri + 1}</span>
            </div>
            {row.map((cell, ci) => (
              <div key={ci} className={`flex-1 h-5 border-r border-white/[0.03] flex items-center px-1.5 ${ri === 0 ? "bg-white/[0.02]" : ""} ${ri === 5 ? "bg-white/[0.01]" : ""}`}>
                <span className={`text-[7px] font-mono ${ri === 0 ? "text-white/30 font-bold" : ci === 2 && cell.startsWith("+") ? "text-green-400/40" : cell.startsWith("-") ? "text-red-400/40" : "text-white/20"}`}>
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

function BgBrowser() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="h-8 bg-[#1e1e1e] border-b border-white/5 flex items-center px-4 gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/40" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
        <div className="w-3 h-3 rounded-full bg-green-500/40" />
      </div>
      <div className="h-6 bg-[#252525] flex items-end px-2 gap-1">
        <div className="bg-[#1e1e1e] px-4 py-1.5 rounded-t text-[8px] text-white/30 font-mono">YouTube</div>
        <div className="bg-[#2a2a2a] px-4 py-1.5 rounded-t text-[8px] text-white/15 font-mono">Gmail</div>
        <div className="bg-[#2a2a2a] px-4 py-1.5 rounded-t text-[8px] text-white/15 font-mono">Docs</div>
        <div className="bg-[#2a2a2a] px-4 py-1.5 rounded-t text-[8px] text-white/15 font-mono">GitHub</div>
      </div>
      <div className="h-8 bg-[#1e1e1e] border-b border-white/5 flex items-center px-4">
        <div className="bg-[#2a2a2a] rounded-full flex-1 h-5 flex items-center px-4">
          <span className="text-[8px] text-white/20 font-mono">youtube.com/watch?v=dQw4w9WgXcQ</span>
        </div>
      </div>
      <div className="p-4 flex gap-4">
        <div className="flex-1">
          <div className="aspect-video bg-[#0f0f0f] rounded-lg mb-3 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-white/30 border-y-[6px] border-y-transparent ml-1" />
            </div>
          </div>
          <div className="text-[9px] text-white/30 font-medium mb-1">How to Build a Startup in 2025 — Full Guide</div>
          <div className="text-[7px] text-white/15">1.2M views · 3 months ago</div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-white/10" />
              <div className="text-[8px] text-white/25">TechStartup Pro</div>
            </div>
            <div className="text-[7px] text-white/15 leading-relaxed">In this video we cover everything you need to know about launching...</div>
          </div>
        </div>
        <div className="w-32 space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-16 h-9 bg-[#1a1a1a] rounded flex-shrink-0" />
              <div>
                <div className="text-[6px] text-white/20 leading-tight">Video title here that wraps to two lines</div>
                <div className="text-[5px] text-white/10 mt-0.5">Channel · 42K</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const bgComponents: Record<string, () => JSX.Element> = {
  vscode: BgVSCode,
  meeting: BgMeeting,
  spreadsheet: BgSpreadsheet,
  browser: BgBrowser,
};

export default function Solution() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

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

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-8 border-t border-border overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Full-section background — cross-fade between work contexts */}
      {slides.map((s, i) => {
        const Bg = bgComponents[s.bg];
        return (
          <div
            key={s.bg}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === active ? 0.18 : 0 }}
          >
            <div className="absolute inset-0 scale-[1.8] origin-top-left">
              <Bg />
            </div>
          </div>
        );
      })}

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto">
        {/* Desktop: 2-column layout | Mobile: stacked */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 md:gap-16 items-start">

          {/* ── Left panel: Header + Sport Switcher ── */}
          <div className="md:sticky md:top-32">
            {/* Header — left-aligned on desktop, centered on mobile */}
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

            {/* Sport switcher — vertical stack on desktop, horizontal on mobile */}
            {/* Mobile: horizontal pills */}
            <div className="flex gap-2 justify-center mb-8 md:hidden">
              {slides.map((s, i) => (
                <button
                  key={s.sport}
                  onClick={() => handleSelect(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.1em] font-light transition-all duration-300 cursor-pointer ${
                    i === active
                      ? "bg-white/10 text-white border border-white/20"
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
                      ? "bg-white/[0.06] border border-white/[0.12] shadow-lg"
                      : "bg-transparent border border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]"
                  }`}
                  style={i === active ? { boxShadow: `0 0 30px ${s.colorHex}15, 0 0 60px ${s.colorHex}08` } : undefined}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot} transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-30 group-hover:opacity-60"}`} />
                  <div className="flex-1">
                    <span className={`text-[11px] uppercase tracking-[0.15em] font-medium transition-colors duration-300 ${
                      i === active ? "text-white" : "text-text-muted/40 group-hover:text-text-muted/70"
                    }`}>
                      {s.sport}
                    </span>
                    <p className={`text-[9px] mt-0.5 transition-all duration-300 ${
                      i === active ? "text-text-dim/60 opacity-100" : "text-text-muted/20 opacity-0 group-hover:opacity-60"
                    }`}>
                      {s.bgLabel}
                    </p>
                  </div>
                  {/* Active indicator bar */}
                  <div className={`w-0.5 h-6 rounded-full transition-all duration-500 ${
                    i === active ? `${s.color} opacity-60` : "bg-white/5 opacity-0"
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
                <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06] backdrop-blur-sm">
                  {slide.bgLabel}
                </span>
              </div>

              {/* Main score card */}
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 sm:p-8 transition-all duration-500" style={{ boxShadow: `0 0 40px ${slide.colorHex}10, 0 4px 30px rgba(0,0,0,0.3)` }}>
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
                <h3 className="text-xl sm:text-2xl font-semibold text-white/90 tracking-[-0.01em] mb-1">
                  {slide.headline}
                </h3>
                <p className="text-[11px] sm:text-[12px] text-text-muted/50 font-light mb-6">
                  {slide.detail}
                </p>

                {/* Score display */}
                <div className="flex items-center justify-between bg-white/[0.04] rounded-xl px-5 py-4 mb-5 border border-white/[0.06]">
                  <span className="text-sm sm:text-base font-bold text-white/80 tracking-wide">{slide.left}</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{slide.score}</span>
                  <span className="text-sm sm:text-base font-bold text-white/80 tracking-wide">{slide.right}</span>
                </div>

                {/* Alert banner */}
                <div className="bg-accent/[0.06] border border-accent/[0.12] rounded-lg px-4 py-3 mb-5">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-accent/70 font-medium mb-1">
                    Key Event
                  </p>
                  <p className="text-[12px] sm:text-[13px] text-white/75 font-light leading-relaxed">
                    {slide.alert}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-white/30 font-mono">{slide.meta}</span>
                  <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${slide.barColor} rounded-full transition-all duration-700 ${slide.barWidth}`} />
                  </div>
                </div>
              </div>

              {/* Toolbar mockup below card */}
              <div className="mt-4 max-w-[360px] mx-auto">
                <div className="bg-[rgba(20,20,20,0.95)] backdrop-blur-xl rounded-lg border border-white/10 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-1.5 rounded-full ${slide.dot}`} />
                    <span className="text-[11px] font-bold text-white/90">{slide.left}</span>
                    <span className="text-[14px] font-extrabold text-white">{slide.score}</span>
                    <span className="text-[11px] font-bold text-white/90">{slide.right}</span>
                  </div>
                  <div className="w-px h-4 bg-white/10" />
                  <span className="text-[10px] text-white/50 font-mono">{slide.meta}</span>
                  <div className="flex gap-1">
                    {slides.map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === active ? "bg-white/60" : "bg-white/20"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-[2px] bg-white/5 rounded-b-md overflow-hidden">
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
