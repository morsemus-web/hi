"use client";

import { useTranslations } from "next-intl";
import CheckoutButton from "./CheckoutButton";
import { Link } from "@/i18n/navigation";

export default function Pricing() {
  const t = useTranslations("Pricing");

  return (
    <section id="pricing" className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-4">
            {t("sectionLabel")}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-4 text-text-primary">
            {t("headline")}
          </h2>
          <p className="text-text-dim text-sm font-light">
            {t("subheadline")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Tier */}
          <div className="glass-card rounded-xl p-8 md:p-10 flex flex-col">
            <span className="text-[10px] font-mono font-light text-text-muted/50 tracking-wider block mb-6 uppercase">
              {t("free")}
            </span>
            <div className="text-4xl font-semibold tracking-tighter mb-1 font-mono text-text-primary">
              $0
            </div>
            <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-8">
              {t("foreverFree")}
            </p>
            <ul className="space-y-3.5 mb-8 flex-grow">
              {[t("freeF1"), t("freeF2"), t("freeF3"), t("freeF4")].map((f) => (
                <li
                  key={f}
                  className="text-xs font-light text-text-dim flex items-center gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/download"
              className="w-full py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-text-dim border border-border hover:border-border-hover hover:text-text-primary transition-all duration-200 cursor-pointer rounded-md text-center"
            >
              {t("downloadNow")}
            </Link>
          </div>

          {/* Pro Monthly */}
          <div className="glass-card rounded-xl p-8 md:p-10 border-accent/15 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <span className="text-[8px] font-mono font-medium uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {t("popular")}
                </span>
             </div>
            <span className="text-[10px] font-mono font-light text-accent/50 tracking-wider block mb-6 uppercase">
              {t("proMonthly")}
            </span>
            <div className="text-4xl font-semibold tracking-tighter mb-1 font-mono text-text-primary">
              $5<span className="text-sm font-light text-text-muted">{t("perMonth")}</span>
            </div>
            <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-8">
              {t("billedQuarterly")}
            </p>
            <ul className="space-y-3.5 mb-8 flex-grow">
              {[t("proMonthlyF1"), t("proMonthlyF2"), t("proMonthlyF3"), t("proMonthlyF4")].map((f) => (
                <li
                  key={f}
                  className="text-xs font-light text-text-primary flex items-center gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-accent/50" />
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton 
              productId={process.env.NEXT_PUBLIC_DODO_MONTHLY_ID}
              className="w-full py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors duration-200 cursor-pointer rounded-md"
            >
              {t("getStarted")}
            </CheckoutButton>
          </div>

          {/* Pro Annual */}
          <div className="glass-card rounded-xl p-8 md:p-10 border-accent/15 flex flex-col relative">
            <div className="absolute top-4 right-4 text-[9px] font-mono font-medium uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full">
              {t("bestValue")}
            </div>
            <span className="text-[10px] font-mono font-light text-accent/50 tracking-wider block mb-6 uppercase">
              {t("proAnnual")}
            </span>
            <div className="text-4xl font-semibold tracking-tighter mb-1 font-mono text-text-primary">
              $49<span className="text-sm font-light text-text-muted">{t("perYear")}</span>
            </div>
            <p className="text-text-muted text-[10px] font-light uppercase tracking-[0.15em] mb-8">
              {t("billedAnnually")}
            </p>
            <ul className="space-y-3.5 mb-8 flex-grow">
              {[t("proAnnualF1"), t("proAnnualF2"), t("proAnnualF3"), t("proAnnualF4")].map((f) => (
                <li
                  key={f}
                  className="text-xs font-light text-text-primary flex items-center gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-accent/50" />
                  {f}
                </li>
              ))}
            </ul>
            <CheckoutButton 
              productId={process.env.NEXT_PUBLIC_DODO_ANNUAL_ID}
              className="w-full py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors duration-200 cursor-pointer rounded-md"
            >
              {t("getStarted")}
            </CheckoutButton>
          </div>
        </div>

        {/* Optional Founding Access Info */}
        <div className="mt-16 text-center">
            <p className="text-[10px] font-mono font-light text-text-muted/40 uppercase tracking-[0.2em]">
                {t("afterLaunch")} • {t("seePostLaunch")}
            </p>
        </div>
      </div>
    </section>
  );
}
