"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function ThanksPage() {
  const t = useTranslations("Thanks");
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
      }).catch(() => {});
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
          You&apos;re a <span className="text-accent">{t("highlight")}</span>!
        </h1>

        <p className="text-text-dim text-base leading-relaxed mb-4">
          {t("description")}
        </p>

        <p className="text-text-muted text-sm mb-8">
          {t("emailNote")}
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-all"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}
