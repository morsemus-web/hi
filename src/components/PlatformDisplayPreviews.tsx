"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

type NavTab = "all" | "web" | "desktop" | "mobile";

export default function PlatformDisplayPreviews() {
  const [activeTab, setActiveTab] = useState<NavTab>("all");
  const [desktopOpacity, setDesktopOpacity] = useState<number>(90);
  const [selectedAdIndex, setSelectedAdIndex] = useState<number>(0);
  const [mobileMode, setMobileMode] = useState<"lockscreen" | "inapp">("lockscreen");

  const houseAds = [
    {
      title: "Multilingual Live Commentary 🎙️",
      desc: "Stream live audio in English, Hindi, Spanish & German in the background.",
      cta: "Listen Live",
      href: "/#commentary",
    },
    {
      title: "ScoreDeck Pro ⚡",
      desc: "Every sport, no ads. From $5/month, billed quarterly. Cancel anytime.",
      cta: "See Pro plans",
      href: "/#pricing",
    },
    {
      title: "Download Android APK (v1.0.2) 📱",
      desc: "Get direct lock-screen match alerts on your phone without app store bloat.",
      cta: "Download APK",
      href: "/download",
    },
  ];

  return (
    <section id="platform-previews" className="py-20 md:py-28 px-6 md:px-8 border-t border-border bg-[#070709] text-zinc-100 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto space-y-10">
        
        {/* ════════════════════════════════════════════════════
           TOP NAVIGATION BAR FOR SWITCHING VIEWS
           ════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Interactive Display Navigator
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              Navigate Platform & Ad Views
            </h2>
            <p className="text-zinc-400 text-xs md:text-sm font-light mt-1">
              Select a single platform to focus or view all 3 side-by-side.
            </p>
          </div>

          {/* Quick Switcher Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 text-xs font-mono">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "all"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All 3 Views
            </button>
            <button
              onClick={() => setActiveTab("web")}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "web"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🌐 Website
            </button>
            <button
              onClick={() => setActiveTab("desktop")}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "desktop"
                  ? "bg-emerald-400 text-zinc-950 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              🖥️ Overlay + Ad
            </button>
            <button
              onClick={() => setActiveTab("mobile")}
              className={`px-3.5 py-2 rounded-lg transition-all ${
                activeTab === "mobile"
                  ? "bg-zinc-100 text-zinc-950 font-bold shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              📱 Mobile
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
           VIEWS CONTAINER
           ════════════════════════════════════════════════════ */}
        <div className={`grid gap-8 items-stretch ${
          activeTab === "all" ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 max-w-2xl mx-auto"
        }`}>
          
          {/* ──────────────────────────────────────────────────
              VIEW 1: THE WEBSITE VIEW
              ────────────────────────────────────────────────── */}
          {(activeTab === "all" || activeTab === "web") && (
            <div className="rounded-3xl border border-zinc-800 bg-[#0d0d11] p-6 flex flex-col justify-between shadow-2xl relative group hover:border-zinc-700 transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">1. Website View</h3>
                      <p className="text-[10px] font-mono text-zinc-400">tryscoredeck.pro / Live Web Feed</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Web Scoreboard
                  </span>
                </div>

                {/* Web Browser Mockup Frame */}
                <div className="rounded-xl border border-zinc-700/60 bg-gradient-to-b from-[#14151c] to-[#0d0d12] p-3.5 space-y-3 shadow-inner">
                  {/* Browser URL Bar */}
                  <div className="h-6 rounded bg-zinc-900/90 border border-zinc-800 flex items-center px-3 text-[10px] font-mono text-zinc-400 truncate">
                    🔒 tryscoredeck.pro/soccer
                  </div>

                  {/* Match Card: Soccer Flagship */}
                  <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/95 p-3.5 space-y-2 backdrop-blur shadow">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-emerald-400 font-bold">⚽ PREMIER LEAGUE · LIVE</span>
                      <span className="text-zinc-400">Emirates Stadium</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Arsenal vs Chelsea</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">2 - 1</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 truncate">
                      ⚡ 64&apos; Saka curling finish into top corner
                    </div>
                  </div>

                  {/* Match Card: Cricket Flagship */}
                  <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/95 p-3.5 space-y-2 backdrop-blur shadow">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-emerald-400 font-bold">🏏 CRICKET · LIVE</span>
                      <span className="text-zinc-400">43.1 Ovs</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">India vs Pakistan</span>
                      <span className="font-mono font-bold text-white text-sm">287/4</span>
                    </div>
                  </div>

                  {/* Web Inline House Ad View */}
                  <div className="pt-1">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 flex items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>⚡</span>
                        <span className="text-[10px] text-emerald-400 font-bold truncate">ScoreDeck Pro: from $5/month</span>
                      </div>
                      <Link href="/#pricing" className="text-[9px] px-2 py-0.5 rounded bg-emerald-400 text-zinc-950 font-bold shrink-0">
                        Claim →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-1 text-xs text-zinc-400 font-mono">
                  <p>✓ Responsive real-time score scraper</p>
                  <p>✓ Zero delay web telemetry</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800">
                <Link
                  href="/soccer"
                  className="w-full block text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold font-mono transition-all"
                >
                  Open Live Web Scoreboard →
                </Link>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────
              VIEW 2: THE DESKTOP OVERLAY (WITH AD)
              ────────────────────────────────────────────────── */}
          {(activeTab === "all" || activeTab === "desktop") && (
            <div className="rounded-3xl border border-emerald-500/40 bg-[#0d0d11] p-6 flex flex-col justify-between shadow-2xl relative group hover:border-emerald-500/60 transition-all ring-1 ring-emerald-500/20">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🖥️</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">2. Desktop Overlay</h3>
                      <p className="text-[10px] font-mono text-zinc-400">Windows & Mac Stealth Bar</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-bold">
                    ★ With House Ad
                  </span>
                </div>

                {/* Desktop Interactive Demo Controls */}
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[10px]">Opacity:</span>
                    <input
                      type="range"
                      min="40"
                      max="100"
                      value={desktopOpacity}
                      onChange={(e) => setDesktopOpacity(Number(e.target.value))}
                      className="w-20 accent-emerald-400 cursor-pointer"
                    />
                    <span className="text-white font-bold text-[10px]">{desktopOpacity}%</span>
                  </div>

                  {/* Ad Message Switcher */}
                  <button
                    onClick={() => setSelectedAdIndex((prev) => (prev + 1) % houseAds.length)}
                    className="text-[10px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    Switch Ad ({selectedAdIndex + 1}/{houseAds.length}) ↻
                  </button>
                </div>

                {/* Floating Overlay Window Frame */}
                <div
                  className="rounded-xl border border-zinc-700/60 bg-gradient-to-b from-[#181a24] to-[#0c0d12] p-4 space-y-3 shadow-2xl transition-opacity"
                  style={{ opacity: desktopOpacity / 100 }}
                >
                  {/* Overlay Window Title */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-white font-bold">ScoreDeck Overlay (Always-On-Top)</span>
                    </div>
                    <div className="flex gap-2 text-zinc-500">
                      <span>—</span>
                      <span>▢</span>
                      <span>✕</span>
                    </div>
                  </div>

                  {/* Real-time Match Ticker */}
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900/95 p-3 space-y-1.5 backdrop-blur shadow">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-emerald-400 font-bold">⚽ UCL · 78&apos; LIVE</span>
                      <span className="text-zinc-400">Bernabéu</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Real Madrid vs Barcelona</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">3 - 2</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 truncate">
                      ⚡ 74&apos; GOAL! Mbappe strikes bottom corner
                    </div>
                  </div>

                  {/* ════════════════════════════════════════════════
                     THE HOUSE AD VIEW INSIDE THE OVERLAY
                     ════════════════════════════════════════════════ */}
                  <div className="p-3 rounded-xl border border-emerald-500/40 bg-zinc-900/95 shadow-lg space-y-1.5 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                        SPONSORED · HOUSE AD
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500">ScoreDeck Pro</span>
                    </div>
                    <div className="text-xs font-bold text-white">
                      {houseAds[selectedAdIndex].title}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      {houseAds[selectedAdIndex].desc}
                    </p>
                    <div className="pt-1 flex justify-end">
                      <Link
                        href={houseAds[selectedAdIndex].href}
                        className="text-[9px] font-mono px-3 py-1 rounded bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all"
                      >
                        {houseAds[selectedAdIndex].cta} →
                      </Link>
                    </div>
                  </div>

                  {/* Taskbar indicator */}
                  <div className="text-[9px] font-mono text-zinc-500 text-center pt-1">
                    Pinned above taskbar while coding or in meetings
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-1 text-xs text-zinc-400 font-mono">
                  <p>✓ 40%–100% customizable opacity</p>
                  <p>✓ Discrete non-intrusive ad placement</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800">
                <Link
                  href="/download"
                  className="w-full block text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-mono transition-all shadow-lg"
                >
                  Download Desktop Overlay (Setup.exe) →
                </Link>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────
              VIEW 3: THE MOBILE VIEW
              ────────────────────────────────────────────────── */}
          {(activeTab === "all" || activeTab === "mobile") && (
            <div className="rounded-3xl border border-zinc-800 bg-[#0d0d11] p-6 flex flex-col justify-between shadow-2xl relative group hover:border-zinc-700 transition-all">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">3. Mobile View</h3>
                      <p className="text-[10px] font-mono text-zinc-400">Android APK & iOS Mobile Web</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                    Lock-Screen APK
                  </span>
                </div>

                {/* Mobile View Toggle Buttons */}
                <div className="flex gap-2 text-xs font-mono justify-center">
                  <button
                    onClick={() => setMobileMode("lockscreen")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      mobileMode === "lockscreen"
                        ? "bg-zinc-100 text-zinc-950 font-bold"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                    }`}
                  >
                    Lock-Screen Mode
                  </button>
                  <button
                    onClick={() => setMobileMode("inapp")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      mobileMode === "inapp"
                        ? "bg-zinc-100 text-zinc-950 font-bold"
                        : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                    }`}
                  >
                    In-App Feed Mode
                  </button>
                </div>

                {/* Mobile Phone Mockup Frame */}
                <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-950 p-4 space-y-3 shadow-2xl max-w-[260px] mx-auto w-full">
                  {/* Phone Notch */}
                  <div className="w-12 h-2 bg-zinc-800 rounded-full mx-auto" />

                  {mobileMode === "lockscreen" ? (
                    <>
                      {/* Phone Clock */}
                      <div className="text-center py-0.5">
                        <div className="text-xl font-bold font-mono text-white">22:42</div>
                        <div className="text-[9px] text-zinc-400">Friday, August 29</div>
                      </div>

                      {/* Mobile Lockscreen Live Activity Card */}
                      <div className="rounded-xl border border-emerald-500/40 bg-zinc-900/95 p-3 space-y-1.5 shadow-lg">
                        <div className="flex items-center justify-between text-[9px] font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold text-white">ScoreDeck Mobile</span>
                          </div>
                          <span className="text-emerald-400 font-bold">78&apos;</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white">Real Madrid</div>
                            <div className="font-bold text-zinc-300">Barcelona</div>
                          </div>
                          <div className="text-right font-mono font-bold text-base text-emerald-400">
                            <div>3</div>
                            <div className="text-zinc-300">2</div>
                          </div>
                        </div>

                        <div className="text-[9px] text-zinc-400 pt-1 border-t border-zinc-800 truncate">
                          ⚡ Mbappe (74&apos;) · 2 SOT
                        </div>
                      </div>

                      {/* Mobile House Ad Card */}
                      <div className="p-2.5 rounded-xl border border-zinc-700/60 bg-zinc-900/90 text-center space-y-1">
                        <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                          PROMO · ScoreDeck Desktop
                        </div>
                        <div className="text-[10px] text-zinc-200 font-medium">
                          Try ScoreDeck on your PC/Mac
                        </div>
                        <Link
                          href="/download"
                          className="block text-[8px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                        >
                          Get Desktop App →
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* In-App Header */}
                      <div className="text-xs font-mono font-bold text-emerald-400 flex justify-between items-center border-b border-zinc-800 pb-1">
                        <span>ScoreDeck App</span>
                        <span>LIVE</span>
                      </div>

                      {/* Match row 1 */}
                      <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                        <div className="flex justify-between text-[9px] font-mono text-emerald-400">
                          <span>⚽ PREMIER LEAGUE</span>
                          <span>64&apos;</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-white">
                          <span>Arsenal vs Chelsea</span>
                          <span className="font-mono text-emerald-400">2 - 1</span>
                        </div>
                      </div>

                      {/* In-App House Ad */}
                      <div className="p-2 rounded-lg border border-emerald-500/40 bg-emerald-950/20 text-[9px] font-mono text-center">
                        <span className="text-emerald-400 font-bold">⚡ Go Pro: no ads, every sport</span>
                      </div>
                    </>
                  )}

                  {/* Phone Home Bar */}
                  <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto mt-1" />
                </div>

                {/* Highlights */}
                <div className="space-y-1 text-xs text-zinc-400 font-mono">
                  <p>✓ Direct .apk install without app store</p>
                  <p>✓ Native lock-screen activity alerts</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800">
                <Link
                  href="/download"
                  className="w-full block text-center py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-mono transition-all shadow"
                >
                  Download Android APK (.apk) →
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
