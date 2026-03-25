"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function useCountUp(target: number | null, duration = 3000) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (target === null) return;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return displayed;
}

export default function SocialProof() {
  const t = useTranslations("SocialProof");
  const [count, setCount] = useState<number | null>(null);
  const displayed = useCountUp(count);

  const testimonials = [
    {
      quote: t("t1Quote"),
      name: t("t1Name"),
      role: t("t1Role"),
    },
    {
      quote: t("t2Quote"),
      name: t("t2Name"),
      role: t("t2Role"),
    },
    {
      quote: t("t3Quote"),
      name: t("t3Name"),
      role: t("t3Role"),
    },
  ];

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(200));
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[900px] mx-auto text-center">
        <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3 mb-14">
          <span className="w-2 h-2 rounded-full bg-accent animate-[pulse-dot_2s_infinite]" />
          <span className="text-sm font-light text-text-dim">
            <span className="font-mono font-medium text-accent">{displayed}+</span> {t("waitlistJoined")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-8 text-left animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
            >
              <p className="text-sm font-light text-text-dim leading-relaxed mb-6 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div>
                <p className="text-xs font-medium text-text-primary">{item.name}</p>
                <p className="text-[10px] font-light text-text-muted">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
