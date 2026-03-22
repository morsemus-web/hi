"use client";

import { useEffect, useRef, useState } from "react";

interface AdUnitProps {
  slot: string;
  format?: string;
  layout?: string;
  layoutKey?: string;
  className?: string;
}

export default function AdUnit({ slot, format = "fluid", layout, layoutKey, className = "" }: AdUnitProps) {
  const pushed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [filled, setFilled] = useState(false);

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

  // Watch for ad fill — collapse if empty
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new MutationObserver(() => {
      const ins = el.querySelector("ins.adsbygoogle");
      if (ins) {
        const height = (ins as HTMLElement).offsetHeight;
        setFilled(height > 0);
      }
    });

    observer.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "data-ad-status"] });

    // Also check after a delay in case ad loads slowly
    const check = setTimeout(() => {
      const ins = el.querySelector("ins.adsbygoogle");
      if (ins) {
        const status = ins.getAttribute("data-ad-status");
        setFilled(status === "filled" || (ins as HTMLElement).offsetHeight > 0);
      }
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(check);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflow: "hidden", maxHeight: filled ? "none" : 0, transition: "max-height 0.3s ease" }}
    >
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
