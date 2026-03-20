"use client";

import { useEffect, useState } from "react";

const testimonials = [
  {
    quote: "Finally, I can watch the IPL without my boss noticing I have 5 tabs open.",
    name: "Arjun K.",
    role: "Software Developer",
  },
  {
    quote: "I trade during match days. ScoreDeck means I never miss a goal or a candle.",
    name: "Marcus T.",
    role: "Day Trader",
  },
  {
    quote: "It's like having a sports ticker built into my desktop. Clean and minimal.",
    name: "Sarah L.",
    role: "Product Designer",
  },
];

export default function SocialProof() {
  const [count, setCount] = useState(200);

  useEffect(() => {
    fetch("/api/waitlist")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[900px] mx-auto text-center">
        <div className="inline-flex items-center gap-3 glass-card rounded-full px-6 py-3 mb-14">
          <span className="w-2 h-2 rounded-full bg-accent animate-[pulse-dot_2s_infinite]" />
          <span className="text-sm font-light text-text-dim">
            <span className="font-mono font-medium text-accent">{count}+</span> users already joined the waitlist
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-8 text-left animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
            >
              <p className="text-sm font-light text-text-dim leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-xs font-medium text-text-primary">{t.name}</p>
                <p className="text-[10px] font-light text-text-muted">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
