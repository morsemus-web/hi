"use client";

import { useState } from "react";
import CheckoutButton from "./CheckoutButton";

export default function FinalCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <section id="waitlist" className="py-24 md:py-32 px-6 md:px-8 border-t border-border relative overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px]" />
      </div>

      <div className="max-w-[600px] mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-5 text-text-primary animate-fade-in-up">
          Never miss a moment again.
        </h2>
        <p className="text-text-dim text-sm md:text-base font-light max-w-md mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
          Join thousands of sports fans who stay updated without breaking focus.
        </p>

        {status === "success" ? (
          <div className="glass-card rounded-xl py-5 px-6 text-accent text-sm font-light tracking-wide animate-scale-in">
            You&apos;re on the list. We&apos;ll be in touch.
          </div>
        ) : (
          <div className="animate-fade-in-up delay-200">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="you@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 glass-card rounded-md text-text-primary text-sm font-light outline-none focus:border-accent/20 transition-colors duration-200 placeholder:text-text-muted/50 font-mono"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3.5 bg-accent text-bg text-[11px] font-medium uppercase tracking-[0.1em] rounded-md hover:bg-accent/90 transition-colors duration-200 cursor-pointer disabled:opacity-40"
              >
                {status === "loading" ? "..." : "Join"}
              </button>
            </form>
            {status === "error" && (
              <p className="text-sport-f1 text-xs font-light mt-3">{errorMsg}</p>
            )}
            <p className="text-text-muted/50 text-[10px] font-light mt-3 tracking-wide">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center mt-8 animate-fade-in-up delay-300">
          <CheckoutButton className="px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.12em] text-text-primary border border-accent/20 hover:border-accent/40 hover:text-accent transition-all duration-200 cursor-pointer rounded-md">
            Get Early Access — $29 Lifetime
          </CheckoutButton>
        </div>
      </div>
    </section>
  );
}
