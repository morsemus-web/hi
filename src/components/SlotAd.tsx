"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ADSENSE_SLOT_INLINE } from "@/lib/adsense";
import AdUnit from "./AdUnit";
import HouseAdView from "./HouseAdView";

/*
 * One ad slot, filled in this order (see docs/ADS.md):
 *   1. nothing, for signed-in users with an active ad-free subscription
 *   2. a direct sponsor campaign from /api/ads/next (logged to ad_events)
 *   3. Google AdSense (NEXT_PUBLIC_ADSENSE_SLOT_INLINE), via the existing AdUnit
 *   4. a ScoreDeck house ad (not logged — it isn't a paid campaign)
 */

type Sponsor = { campaignId: number; creativeUrl: string; landingUrl: string };
type Fill = { kind: "loading" } | { kind: "none" } | { kind: "sponsor"; ad: Sponsor } | { kind: "adsense" } | { kind: "house" };

let adsFreePromise: Promise<boolean> | null = null;
function isAdsFree(): Promise<boolean> {
  if (!adsFreePromise) {
    adsFreePromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const { data } = await supabase.from("profiles").select("ads_free_until").eq("id", session.user.id).maybeSingle();
      return !!data?.ads_free_until && new Date(data.ads_free_until).getTime() > Date.now();
    })().catch(() => false);
  }
  return adsFreePromise;
}

function logEvent(campaignId: number, type: "impression" | "click", sport?: string) {
  fetch("/api/ads/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, type, sport: sport || "general" }),
    keepalive: true,
  }).catch(() => {});
}

export default function SlotAd({
  sport,
  campaignIndex,
  className = "",
}: {
  sport?: string;
  campaignIndex?: number;
  className?: string;
}) {
  const [fill, setFill] = useState<Fill>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (await isAdsFree()) return !cancelled && setFill({ kind: "none" });
      try {
        const params = new URLSearchParams({ variant: "inline", ...(sport ? { sport } : {}) });
        const ad = await (await fetch(`/api/ads/next?${params}`)).json();
        if (!ad.house && ad.campaignId > 0 && ad.creativeUrl && ad.landingUrl) {
          return !cancelled && setFill({ kind: "sponsor", ad });
        }
      } catch {
        // Fall through to network or house ad.
      }
      if (!cancelled) setFill(ADSENSE_SLOT_INLINE ? { kind: "adsense" } : { kind: "house" });
    })();
    return () => {
      cancelled = true;
    };
  }, [sport]);

  useEffect(() => {
    if (fill.kind === "sponsor") logEvent(fill.ad.campaignId, "impression", sport);
  }, [fill, sport]);

  if (fill.kind === "loading" || fill.kind === "none") return null;
  if (fill.kind === "house") return <HouseAdView variant="inline" sport={sport} campaignIndex={campaignIndex} className={className} />;
  // Existing AdSense unit: collapses itself if Google has no ad to show.
  if (fill.kind === "adsense") return <AdUnit slot={ADSENSE_SLOT_INLINE} format="auto" className={className} />;

  return (
    <a
      href={fill.ad.landingUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      onClick={() => logEvent(fill.ad.campaignId, "click", sport)}
      className={`block relative rounded-2xl overflow-hidden border border-zinc-800/80 ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fill.ad.creativeUrl} alt="Sponsored" className="w-full h-auto block" />
      <span className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-wider bg-black/70 text-zinc-300 px-1.5 py-0.5 rounded">
        Sponsored
      </span>
    </a>
  );
}
