"use client";

import { useEffect, useState } from "react";
import CheckoutButton from "./CheckoutButton";

export default function Pricing() {
  const [remaining, setRemaining] = useState(1000);

  useEffect(() => {
    fetch("/api/backers")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => {});
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
            <div className="text-4xl font-semibold tracking-tighter mb-1 font-mono text-text-primary">
              $29
            </div>
            <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-8">
              One-time &middot; Lifetime
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
              Only {remaining.toLocaleString()} spots remaining
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
