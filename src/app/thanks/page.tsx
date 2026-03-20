"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ThanksPage() {
  useEffect(() => {
    // Extract email from URL params if Dodo passes it
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");
    const paymentId = params.get("payment_id");

    if (email) {
      fetch("/api/backers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, payment_id: paymentId }),
      }).catch(console.error);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-accent-dim mx-auto mb-8 flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-4">
          You&apos;re a <span className="text-accent">lifetime backer</span>!
        </h1>

        <p className="text-text-dim text-base leading-relaxed mb-4">
          Thank you for backing ScoreDeck. Your $29 lifetime access is confirmed.
          You&apos;ll get every future update, every new sport, and an early backer
          badge — forever.
        </p>

        <p className="text-text-muted text-sm mb-8">
          We&apos;ll send you a download link as soon as ScoreDeck is ready. Check
          your email for a confirmation.
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
