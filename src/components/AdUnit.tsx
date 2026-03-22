"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: string;
  layout?: string;
  layoutKey?: string;
  className?: string;
}

export default function AdUnit({ slot, format = "fluid", layout, layoutKey, className = "" }: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    const timer = setTimeout(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ads = (window as any).adsbygoogle;
        if (ads) {
          ads.push({});
          pushed.current = true;
        }
      } catch {
        // AdSense script not loaded
      }
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: layout === "in-article" ? "center" : undefined }}
        data-ad-client="ca-pub-7182949672912731"
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(layoutKey ? { "data-ad-layout-key": layoutKey } : {})}
      />
    </div>
  );
}
