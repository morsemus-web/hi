"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

export interface HouseCampaign {
  id: number;
  tag: string;
  headline: string;
  subline: string;
  ctaText: string;
  ctaHref: string;
  badge?: string;
  icon?: string;
  accentColor?: string;
}

export const HOUSE_CAMPAIGNS: HouseCampaign[] = [
  {
    id: 1,
    tag: "DESKTOP OVERLAY",
    headline: "Track live scores while you code or work in spreadsheets",
    subline: "Stealth desktop widget pinned above your taskbar. Zero distraction, 100% real-time.",
    ctaText: "Download for Windows & Mac",
    ctaHref: "/download",
    badge: "Free Download",
    icon: "🖥️",
    accentColor: "emerald",
  },
  {
    id: 2,
    tag: "ANDROID APK",
    headline: "Live match activity & goal alerts on your phone lock-screen",
    subline: "Direct lightweight .apk install. No app store bloat, zero delay telemetry.",
    ctaText: "Get Android APK (v1.0.2)",
    ctaHref: "/download",
    badge: "Direct APK",
    icon: "📱",
    accentColor: "cyan",
  },
  {
    id: 3,
    tag: "SCOREDECK PRO",
    headline: "Go Pro: every sport, no ads",
    subline: "From $5/month, billed quarterly. Cancel anytime.",
    ctaText: "See Pro plans",
    ctaHref: "/#pricing",
    badge: "Ad-free",
    icon: "⚡",
    accentColor: "amber",
  },
  {
    id: 4,
    tag: "MULTILINGUAL COMMENTARY",
    headline: "Listen to Live Audio Commentary in 4 Languages",
    subline: "Stream ball-by-ball commentary in English, Hindi, Spanish, and German in the background.",
    ctaText: "Listen Live",
    ctaHref: "/#commentary",
    badge: "Live Audio",
    icon: "🎙️",
    accentColor: "purple",
  },
];

interface HouseAdViewProps {
  variant?: "banner" | "inline" | "pill" | "card";
  sport?: string;
  campaignIndex?: number;
  className?: string;
}

export default function HouseAdView({
  variant = "banner",
  sport,
  campaignIndex,
  className = "",
}: HouseAdViewProps) {
  const [campaign, setCampaign] = useState<HouseCampaign>(
    campaignIndex !== undefined && HOUSE_CAMPAIGNS[campaignIndex]
      ? HOUSE_CAMPAIGNS[campaignIndex]
      : HOUSE_CAMPAIGNS[0]
  );

  useEffect(() => {
    if (campaignIndex === undefined) {
      // Pick random house campaign
      const randomIdx = Math.floor(Math.random() * HOUSE_CAMPAIGNS.length);
      setCampaign(HOUSE_CAMPAIGNS[randomIdx]);
    }
  }, [campaignIndex]);

  // House ads promote ScoreDeck itself; they are not paid campaigns, so
  // nothing is logged to ad_events (see AdUnit for sponsor tracking).

  /* ── Pill Variant (for floating overlays, menu bars, widgets) ── */
  if (variant === "pill") {
    return (
      <Link
        href={campaign.ctaHref}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-[10px] font-mono text-zinc-300 hover:text-white transition-all backdrop-blur ${className}`}
      >
        <span>{campaign.icon}</span>
        <span className="font-semibold text-emerald-400">{campaign.badge || "HOUSE"}:</span>
        <span className="truncate max-w-[200px]">{campaign.headline}</span>
        <span className="text-zinc-500">→</span>
      </Link>
    );
  }

  /* ── Inline Match Card Variant (between match feeds) ── */
  if (variant === "inline") {
    return (
      <div
        className={`rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-900/90 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur ${className}`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg shrink-0">
            {campaign.icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                {campaign.tag}
              </span>
              {campaign.badge && (
                <span className="text-[9px] font-mono text-zinc-400">
                  {campaign.badge}
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
              {campaign.headline}
            </h4>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
              {campaign.subline}
            </p>
          </div>
        </div>

        <Link
          href={campaign.ctaHref}
            className="shrink-0 w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold font-mono tracking-tight transition-all shadow-sm"
        >
          {campaign.ctaText} →
        </Link>
      </div>
    );
  }

  /* ── Full Banner Variant (for top strips & platform previews) ── */
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-[#111114] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden ${className}`}
    >
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-2xl shrink-0">
          {campaign.icon}
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800/70 px-2 py-0.5 rounded">
              {campaign.tag}
            </span>
            {campaign.badge && (
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                {campaign.badge}
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {campaign.headline}
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl">
            {campaign.subline}
          </p>
        </div>
      </div>

      <Link
        href={campaign.ctaHref}
        className="shrink-0 w-full md:w-auto text-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold font-mono tracking-tight transition-all shadow-lg hover:shadow-emerald-500/20"
      >
        {campaign.ctaText} →
      </Link>
    </div>
  );
}
