"use client";

import { useEffect, useRef, useState } from "react";

const painPoints = [
  {
    number: "20×",
    highlight: "per day",
    title: "Tab switching addiction",
    desc: "ESPN, Cricbuzz, F1 Live, NBA app — you open them \"just for a second\" then lose 5 minutes. Multiply that by every match day.",
    stat: "20× daily context switches",
    color: "text-red-400",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/10",
    accentRgb: "239,68,68",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-400/60">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 8h3M14 8h3M7 12h10" />
      </svg>
    ),
  },
  {
    number: "15min",
    highlight: "lost each time",
    title: "Focus destroyed",
    desc: "Research shows it takes 15 minutes to regain deep focus after a single interruption. A quick score check is never just a quick check.",
    stat: "~2 hours lost per match day",
    color: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/10",
    accentRgb: "245,158,11",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400/60">
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 12l7-7" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    number: "73%",
    highlight: "missed",
    title: "Key moments gone",
    desc: "Goals, wickets, overtakes, buzzer-beaters — they happen in seconds. If you're not watching, you miss them. Then you're scrambling to find a replay.",
    stat: "You only catch 1 in 4 key moments",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/5",
    borderColor: "border-cyan-500/10",
    accentRgb: "6,182,212",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400/60">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

function ExpandCard({ children, index, accentRgb }: { children: React.ReactNode; index: number; accentRgb: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
      },
      {
        threshold: Array.from({ length: 21 }, (_, i) => i / 20),
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Map ratio to animation progress (0 = collapsed, 1 = fully expanded)
  const progress = Math.min(1, ratio * 2.5);
  const scaleY = 0.6 + progress * 0.4;
  const scaleX = 0.92 + progress * 0.08;
  const opacity = 0.15 + progress * 0.85;
  const translateY = (1 - progress) * 30;
  const rotateX = (1 - progress) * 6;
  const blur = (1 - progress) * 2;
  const glowOpacity = progress * 0.08;

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `perspective(1000px) rotateX(${rotateX}deg) scaleY(${scaleY}) scaleX(${scaleX}) translateY(${translateY}px)`,
        filter: blur > 0.1 ? `blur(${blur}px)` : "none",
        transformOrigin: "center top",
        transition: "opacity 0.15s ease-out, transform 0.15s ease-out, filter 0.15s ease-out",
        boxShadow: `0 0 ${progress * 60}px rgba(${accentRgb}, ${glowOpacity})`,
        borderRadius: "1rem",
      }}
    >
      {children}
    </div>
  );
}

export default function Problem() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0px)";
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-36 px-6 md:px-8 border-t border-border">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className="mb-20 max-w-2xl"
          style={{
            opacity: 0,
            transform: "translateY(40px)",
            transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-red-400/60 mb-4">
            The problem
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-text-primary leading-[1.1]">
            You&apos;re bleeding focus
            <br />
            <span className="text-text-muted/40">just to check a score.</span>
          </h2>
        </div>

        {/* Pain points — expanding/collapsing cards */}
        <div className="space-y-6">
          {painPoints.map((p, i) => (
            <ExpandCard key={i} index={i} accentRgb={p.accentRgb}>
              <div
                className={`${p.bgColor} border ${p.borderColor} rounded-2xl p-8 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_auto_2fr] gap-8 lg:gap-12 items-center relative overflow-hidden`}
              >
                {/* Left — Big stat */}
                <div className="flex items-center gap-5 lg:gap-6">
                  <div className="w-14 h-14 rounded-xl bg-overlay-2 flex items-center justify-center flex-shrink-0">
                    {p.icon}
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-4xl md:text-5xl font-black tracking-tight ${p.color}`}>
                        {p.number}
                      </span>
                      <span className="text-sm text-text-muted/40 font-light">{p.highlight}</span>
                    </div>
                    <p className={`text-xs font-mono mt-1 ${p.color} opacity-50`}>{p.stat}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px h-20 bg-border" />

                {/* Right — Explanation */}
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-text-primary mb-3">{p.title}</h3>
                  <p className="text-text-dim text-sm md:text-[15px] font-light leading-relaxed max-w-xl">
                    {p.desc}
                  </p>
                </div>
              </div>
            </ExpandCard>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-16 text-center">
          <p className="text-text-muted/30 text-xs font-light tracking-wider uppercase">
            There&apos;s a better way &darr;
          </p>
        </div>
      </div>
    </section>
  );
}
