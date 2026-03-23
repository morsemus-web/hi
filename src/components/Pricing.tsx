"use client";

import { useEffect, useState } from "react";
import CheckoutButton from "./CheckoutButton";

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

export default function Pricing() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [postLaunchOpen, setPostLaunchOpen] = useState(false);
  const displayed = useCountUp(remaining);

  useEffect(() => {
    fetch("/api/backers")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => setRemaining(996));
  }, []);

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-4">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-4 text-text-primary">
            One price. Forever.
          </h2>
          <p className="text-text-dim text-sm font-light">
            No subscriptions. No recurring charges. Ever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free */}
          <div className="glass-card rounded-xl p-8 md:p-10">
            <span className="text-[10px] font-mono font-light text-text-muted/50 tracking-wider block mb-6 uppercase">
              Free
            </span>
            <div className="text-4xl font-semibold tracking-tighter mb-1 font-mono text-text-primary">
              $0
            </div>
            <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-8">
              Forever free
            </p>
            <ul className="space-y-3.5 mb-8">
              {[
                "Join waitlist",
                "Get launch updates",
                "2 sports included",
                "Basic system tray",
              ].map((f) => (
                <li
                  key={f}
                  className="text-xs font-light text-text-dim flex items-center gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                document.querySelector("#waitlist")?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-dim border border-border hover:border-border-hover hover:text-text-primary transition-all duration-200 cursor-pointer rounded-md"
            >
              Join Waitlist
            </button>
          </div>

          {/* Founding Access */}
          <div className="glass-card rounded-xl p-8 md:p-10 relative border-accent/15">
            <div className="absolute top-4 right-4 text-[9px] font-mono font-medium uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
              Popular
            </div>
            <span className="text-[10px] font-mono font-light text-accent/50 tracking-wider block mb-6 uppercase">
              Founding Access
            </span>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-lg font-mono text-text-muted line-through">$39</span>
              <span className="text-4xl font-semibold tracking-tighter font-mono text-text-primary">$29</span>
            </div>
            <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-2">
              One-time &middot; Lifetime
            </p>
            <p className="text-accent/70 text-[10px] font-light tracking-[0.05em] mb-8">
              For the first 1,000 founding members
            </p>
            <ul className="space-y-3.5 mb-8">
              {[
                "Early access before launch",
                "Lifetime access (no monthly fee)",
                "All 4 sports + all features",
                "Priority feature requests",
                "Direct input on development",
                "Private community access",
                "Founding user badge",
              ].map((f) => (
                <li
                  key={f}
                  className="text-xs font-light text-text-primary flex items-center gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-accent/50" />
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton className="w-full py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors duration-200 cursor-pointer rounded-md">
              Become a Founding User
            </CheckoutButton>
            <div className="flex items-center justify-center gap-2 mt-5 text-[10px] font-mono font-light text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-sport-f1/60 animate-[pulse-dot_2s_infinite]" />
              Only {displayed.toLocaleString()} spots remaining
            </div>
          </div>
        </div>

        {/* Post-Launch Plans */}
        <div className="mt-12 border-t border-border pt-8">
          <button
            onClick={() => setPostLaunchOpen(!postLaunchOpen)}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
            aria-expanded={postLaunchOpen}
            aria-label="Toggle post-launch plans"
          >
            <div>
              <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-1">
                After Launch
              </p>
              <p className="text-sm font-light text-text-dim">
                See post-launch subscription plans
              </p>
            </div>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform duration-300 ${postLaunchOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-300 ease-in-out"
            style={{ gridTemplateRows: postLaunchOpen ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                {/* Free */}
                <div className="glass-card rounded-xl p-6 md:p-8">
                  <span className="text-[10px] font-mono font-light text-text-muted/50 tracking-wider block mb-4 uppercase">
                    Free
                  </span>
                  <div className="text-2xl font-semibold tracking-tighter font-mono text-text-primary mb-1">
                    $0
                  </div>
                  <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-6">
                    Forever
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Up to 2 live matches",
                      "2 sports included",
                      "Basic system tray",
                    ].map((f) => (
                      <li key={f} className="text-xs font-light text-text-dim flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Monthly */}
                <div className="glass-card rounded-xl p-6 md:p-8">
                  <span className="text-[10px] font-mono font-light text-accent/50 tracking-wider block mb-4 uppercase">
                    Pro Monthly
                  </span>
                  <div className="text-2xl font-semibold tracking-tighter font-mono text-text-primary mb-1">
                    $5<span className="text-sm font-light text-text-muted">/mo</span>
                  </div>
                  <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-6">
                    Billed quarterly &middot; $15/quarter
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Unlimited live matches",
                      "All 4 sports + all features",
                      "Priority support",
                    ].map((f) => (
                      <li key={f} className="text-xs font-light text-text-primary flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-accent/50" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pro Annual */}
                <div className="glass-card rounded-xl p-6 md:p-8 relative border-accent/15">
                  <div className="absolute top-3 right-3 text-[9px] font-mono font-medium uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                    Best Value
                  </div>
                  <span className="text-[10px] font-mono font-light text-accent/50 tracking-wider block mb-4 uppercase">
                    Pro Annual
                  </span>
                  <div className="text-2xl font-semibold tracking-tighter font-mono text-text-primary mb-1">
                    $49<span className="text-sm font-light text-text-muted">/yr</span>
                  </div>
                  <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-6">
                    Billed annually &middot; Save 18%
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Unlimited live matches",
                      "All 4 sports + all features",
                      "Priority support",
                    ].map((f) => (
                      <li key={f} className="text-xs font-light text-text-primary flex items-center gap-3">
                        <span className="w-1 h-1 rounded-full bg-accent/50" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
