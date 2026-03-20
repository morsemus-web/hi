"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M2 17h20" />
        <path d="M6 21h12" />
      </svg>
    ),
    title: "Always-On Overlay",
    desc: "Lives above your taskbar. Always visible, never in the way.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: "Real-Time Updates",
    desc: "Instant scores. No refresh needed. Background sync keeps everything current.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: "Personalized Feed",
    desc: "Follow only your teams and matches. Pin what matters most.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="8" height="8" rx="1" />
        <rect x="14" y="3" width="8" height="8" rx="1" />
        <rect x="2" y="13" width="8" height="8" rx="1" />
        <rect x="14" y="13" width="8" height="8" rx="1" />
      </svg>
    ),
    title: "Multi-Match View",
    desc: "Track multiple games at once. Cricket, Football, Basketball, and F1.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Key Alerts",
    desc: "Goals, wickets, overtakes — instant notifications right on your toolbar.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: "Stealth Mode",
    desc: "Reduce opacity, go compact. Stay updated without anyone noticing.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
    title: "Live Commentary",
    desc: "Listen to matches in English, Hindi, Spanish, or German. The next best thing to watching.",
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const n = features.length;

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % n);
    }, 3000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, n]);

  const goTo = useCallback((i: number) => {
    setActive(i);
    setIsAutoPlaying(false);
    // Resume auto-play after 8s of inactivity
    const timeout = setTimeout(() => setIsAutoPlaying(true), 8000);
    return () => clearTimeout(timeout);
  }, []);

  const prev = () => goTo((active - 1 + n) % n);
  const next = () => goTo((active + 1) % n);

  // Get card style based on offset from active
  function getCardStyle(index: number) {
    let offset = index - active;
    // Wrap around
    if (offset > n / 2) offset -= n;
    if (offset < -n / 2) offset += n;

    const absOffset = Math.abs(offset);
    const isCenter = offset === 0;
    const isAdjacent = absOffset === 1;
    const isSecond = absOffset === 2;
    const isVisible = absOffset <= 2;

    if (!isVisible) {
      return {
        opacity: 0,
        transform: `perspective(1000px) translateX(${offset > 0 ? 400 : -400}px) rotateY(${offset > 0 ? -45 : 45}deg) scale(0.6)`,
        zIndex: 0,
        pointerEvents: "none" as const,
      };
    }

    const translateX = isCenter ? 0 : offset * (isAdjacent ? 260 : 420);
    const rotateY = isCenter ? 0 : offset > 0 ? -35 : 35;
    const scale = isCenter ? 1 : isAdjacent ? 0.82 : 0.65;
    const opacity = isCenter ? 1 : isAdjacent ? 0.5 : 0.25;
    const z = isCenter ? 30 : isAdjacent ? 20 : 10;

    return {
      opacity,
      transform: `perspective(1000px) translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: z,
      pointerEvents: "auto" as const,
    };
  }

  // Mobile: get card style for stacked/swipe layout
  function getMobileCardStyle(index: number) {
    let offset = index - active;
    if (offset > n / 2) offset -= n;
    if (offset < -n / 2) offset += n;

    const absOffset = Math.abs(offset);
    const isVisible = absOffset <= 1;

    if (!isVisible) {
      return {
        opacity: 0,
        transform: `translateX(${offset > 0 ? 120 : -120}%) scale(0.8)`,
        zIndex: 0,
        pointerEvents: "none" as const,
      };
    }

    if (offset === 0) {
      return {
        opacity: 1,
        transform: "translateX(0) scale(1)",
        zIndex: 10,
        pointerEvents: "auto" as const,
      };
    }

    return {
      opacity: 0.4,
      transform: `translateX(${offset * 80}%) scale(0.85)`,
      zIndex: 5,
      pointerEvents: "none" as const,
    };
  }

  return (
    <section id="features" className="py-24 md:py-32 px-6 md:px-8 border-t border-border overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-4">
            Features
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-text-primary">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        {/* Desktop: 3D Coverflow Carousel */}
        <div className="hidden md:block">
          <div className="relative h-[320px] flex items-center justify-center" style={{ perspective: "1200px" }}>
            {features.map((f, i) => {
              const style = getCardStyle(i);
              return (
                <div
                  key={i}
                  className="absolute w-[300px] cursor-pointer"
                  style={{
                    ...style,
                    transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                    transformStyle: "preserve-3d",
                  }}
                  onClick={() => goTo(i)}
                >
                  <div
                    className="rounded-2xl p-8 border h-[260px] flex flex-col"
                    style={{
                      background: i === active
                        ? (isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.98)")
                        : (isDark ? "rgba(10,10,10,0.8)" : "rgba(245,245,245,0.9)"),
                      borderColor: i === active ? "rgba(0,229,160,0.15)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"),
                      boxShadow: i === active
                        ? (isDark
                          ? "0 0 40px rgba(0,229,160,0.08), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(0,229,160,0.1)"
                          : "0 0 40px rgba(0,200,138,0.1), 0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(0,200,138,0.1)")
                        : (isDark ? "0 10px 40px rgba(0,0,0,0.3)" : "0 10px 40px rgba(0,0,0,0.06)"),
                    }}
                  >
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6"
                      style={{
                        background: i === active ? "rgba(0,229,160,0.08)" : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"),
                        color: i === active ? "rgba(0,229,160,0.8)" : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
                      }}
                    >
                      {f.icon}
                    </div>
                    <h3
                      className="text-base font-semibold mb-3 transition-colors duration-500"
                      style={{ color: i === active ? (isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.9)") : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)") }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-sm font-light leading-relaxed transition-colors duration-500"
                      style={{ color: i === active ? (isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)") : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)") }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prev}
              aria-label="Previous feature"
              className="w-10 h-10 rounded-full border border-border-hover flex items-center justify-center text-text-muted hover:text-text-primary hover:border-overlay-15 transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            {/* Dots */}
            <div className="flex items-center gap-2">
              {features.map((f, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to feature: ${f.title}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer p-1 ${
                    i === active ? "w-8 h-4 bg-accent/60" : "w-4 h-4 bg-overlay-15 hover:bg-overlay-text-muted"
                  }`}
                >
                  <span className={`block rounded-full mx-auto ${i === active ? "w-6 h-2 bg-accent/80" : "w-2 h-2 bg-current opacity-60"}`} />
                </button>
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next feature"
              className="w-10 h-10 rounded-full border border-border-hover flex items-center justify-center text-text-muted hover:text-text-primary hover:border-overlay-15 transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile: Swipeable cards */}
        <div className="md:hidden">
          <div className="relative h-[280px] flex items-center justify-center overflow-hidden">
            {features.map((f, i) => {
              const style = getMobileCardStyle(i);
              return (
                <div
                  key={i}
                  className="absolute w-[85%] max-w-[320px]"
                  style={{
                    ...style,
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onClick={() => goTo(i)}
                >
                  <div
                    className="rounded-2xl p-7 border h-[240px] flex flex-col"
                    style={{
                      background: i === active
                        ? (isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.98)")
                        : (isDark ? "rgba(10,10,10,0.8)" : "rgba(245,245,245,0.9)"),
                      borderColor: i === active ? "rgba(0,229,160,0.15)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)"),
                      boxShadow: i === active
                        ? (isDark ? "0 0 30px rgba(0,229,160,0.06), 0 15px 40px rgba(0,0,0,0.4)" : "0 0 30px rgba(0,200,138,0.08), 0 15px 40px rgba(0,0,0,0.06)")
                        : (isDark ? "0 8px 30px rgba(0,0,0,0.3)" : "0 8px 30px rgba(0,0,0,0.04)"),
                    }}
                  >
                    <div
                      className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5"
                      style={{
                        background: i === active ? "rgba(0,229,160,0.08)" : (isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"),
                        color: i === active ? "rgba(0,229,160,0.8)" : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"),
                      }}
                    >
                      {f.icon}
                    </div>
                    <h3
                      className="text-[15px] font-semibold mb-2"
                      style={{ color: i === active ? (isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.9)") : (isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)") }}
                    >
                      {f.title}
                    </h3>
                    <p
                      className="text-xs font-light leading-relaxed"
                      style={{ color: i === active ? (isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)") : (isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)") }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile nav */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={prev}
              aria-label="Previous feature"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <div className="flex items-center gap-1.5">
              {features.map((f, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to feature: ${f.title}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer p-1.5 ${
                    i === active ? "w-8 h-5 bg-accent/60" : "w-5 h-5 bg-transparent"
                  }`}
                >
                  <span className={`block rounded-full mx-auto ${i === active ? "w-5 h-1.5 bg-accent/80" : "w-1.5 h-1.5 bg-overlay-15"}`} />
                </button>
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next feature"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
