"use client";

import { Link } from "@/i18n/navigation";
import HouseAdView from "./HouseAdView";

export default function PlatformDisplayPreviews() {
  return (
    <section className="py-20 md:py-28 px-6 md:px-8 border-t border-border bg-[#070709] text-zinc-100 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Platform Previews
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            ScoreDeck Across All 3 Platforms
          </h2>
          <p className="text-zinc-400 text-sm md:text-base font-light leading-relaxed">
            Real-time live scores rendered natively for Windows Desktop, macOS Menu Bar, and Android Mobile APK.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════
           TOP PROMO HOUSE CAMPAIGN AD VIEW
           ════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto">
          <HouseAdView variant="banner" campaignIndex={0} />
        </div>

        {/* ════════════════════════════════════════════════════
           GRID OF ALL 3 DISPLAY VIEWS
           ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* ──────────────────────────────────────────────────
              VIEW 1: WINDOWS DESKTOP OVERLAY
              ────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-zinc-800 bg-[#0d0d11] p-6 flex flex-col justify-between shadow-2xl relative group hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              {/* Platform Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🖥️</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Windows Overlay</h3>
                    <p className="text-[10px] font-mono text-zinc-400">ScoreDeck-Setup-1.0.4.exe</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  Stealth Pinned
                </span>
              </div>

              {/* Windows Window Frame */}
              <div className="rounded-xl border border-zinc-700/60 bg-gradient-to-b from-[#161820] to-[#0d0e14] p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-b border-zinc-800/80 pb-2">
                  <span className="text-zinc-300 font-bold">ScoreDeck Overlay</span>
                  <div className="flex gap-2 text-zinc-500">
                    <span>—</span>
                    <span>▢</span>
                    <span>✕</span>
                  </div>
                </div>

                {/* Match 1: Soccer Champions League */}
                <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 p-3 space-y-1.5 backdrop-blur shadow">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-emerald-400 font-bold">⚽ UCL · 78&apos; LIVE</span>
                    <span className="text-zinc-400">Bernabéu</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Real Madrid vs Barcelona</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">3 - 2</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate pt-1 border-t border-zinc-800">
                    ⚡ 74&apos; GOAL! Mbappe strikes bottom corner
                  </div>
                </div>

                {/* Match 2: Cricket Live */}
                <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/90 p-3 space-y-1.5 backdrop-blur shadow">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-emerald-400 font-bold">🏏 CRICKET · LIVE</span>
                    <span className="text-zinc-400">43.1 Ovs</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">IND vs PAK</span>
                    <span className="font-mono font-bold text-white">IND 287/4</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate pt-1 border-t border-zinc-800">
                    💥 SIX! Clean strike over long-off
                  </div>
                </div>

                {/* House Ad Pill Inside Desktop Overlay */}
                <div className="pt-1">
                  <HouseAdView variant="pill" campaignIndex={2} />
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Adjustable 40%–100% stealth opacity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Pins directly above Windows taskbar</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <Link
                href="/download"
                className="w-full block text-center py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-mono transition-all shadow"
              >
                Download for Windows (95 MB) →
              </Link>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────
              VIEW 2: MACOS MENU BAR & POPUP
              ────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-zinc-800 bg-[#0d0d11] p-6 flex flex-col justify-between shadow-2xl relative group hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              {/* Platform Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍏</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">macOS Menu Bar</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Universal .dmg / Intel & M-Series</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                  Menu Widget
                </span>
              </div>

              {/* macOS Mockup Frame */}
              <div className="rounded-xl border border-zinc-700/60 bg-gradient-to-b from-[#181822] to-[#0e0e16] p-4 space-y-3 shadow-inner">
                
                {/* Simulated macOS Menu Bar */}
                <div className="h-7 rounded bg-zinc-900/90 border border-zinc-700/60 flex items-center justify-between px-2.5 text-[10px] font-mono text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold"></span>
                    <span className="font-bold text-white">ScoreDeck</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-[10px] font-bold text-emerald-400">
                    <span>⚽ RMA 3-2 BAR (78&apos;)</span>
                  </div>
                  <span className="text-zinc-500">22:42</span>
                </div>

                {/* macOS Native Popover Card */}
                <div className="rounded-xl border border-zinc-700 bg-zinc-900/95 p-3.5 space-y-2 backdrop-blur shadow-xl">
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 border-b border-zinc-800 pb-1.5">
                    <span className="text-emerald-400 font-bold">CHAMPIONS LEAGUE</span>
                    <span>2nd Half</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">Real Madrid</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">3</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-300">Barcelona</span>
                    <span className="font-mono font-bold text-zinc-300 text-sm">2</span>
                  </div>

                  <div className="text-[10px] text-zinc-400 pt-1.5 border-t border-zinc-800 flex justify-between">
                    <span>Possession: 54% - 46%</span>
                    <span className="text-emerald-400">Live</span>
                  </div>
                </div>

                {/* House Ad Pill Inside Mac View */}
                <div className="pt-1">
                  <HouseAdView variant="pill" campaignIndex={3} />
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Lives in macOS top menu bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Instant goal audio alerts & notifications</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <Link
                href="/download"
                className="w-full block text-center py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold font-mono transition-all shadow"
              >
                Download for macOS (.dmg) →
              </Link>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────
              VIEW 3: ANDROID MOBILE APK
              ────────────────────────────────────────────────── */}
          <div className="rounded-3xl border border-zinc-800 bg-[#0d0d11] p-6 flex flex-col justify-between shadow-2xl relative group hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              {/* Platform Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">Android Mobile</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Direct ScoreDeck-1.0.2.apk</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  Direct APK
                </span>
              </div>

              {/* Android Phone Frame Mockup */}
              <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-950 p-4 space-y-3 shadow-2xl max-w-[260px] mx-auto w-full">
                {/* Phone Speaker Notch */}
                <div className="w-12 h-2.5 bg-zinc-800 rounded-full mx-auto" />

                {/* Clock */}
                <div className="text-center py-1">
                  <div className="text-xl font-bold font-mono text-white">22:42</div>
                  <div className="text-[9px] text-zinc-400">Friday, August 29</div>
                </div>

                {/* Lockscreen Live Activity Card */}
                <div className="rounded-xl border border-emerald-500/40 bg-zinc-900/95 p-3 space-y-2 shadow-lg">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-white">ScoreDeck Live</span>
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

                {/* Phone Home Bar */}
                <div className="w-16 h-1 bg-zinc-700 rounded-full mx-auto mt-2" />
              </div>

              {/* Feature Highlights */}
              <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Lockscreen live match activity card</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Instant APK install — zero store friction</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <Link
                href="/download"
                className="w-full block text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-mono transition-all shadow-lg"
              >
                Download Android APK (.apk) →
              </Link>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════
           BOTTOM INLINE HOUSE CAMPAIGN AD VIEW
           ════════════════════════════════════════════════════ */}
        <div className="max-w-4xl mx-auto pt-4">
          <HouseAdView variant="inline" campaignIndex={1} />
        </div>

      </div>
    </section>
  );
}
