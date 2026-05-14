"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function FinalCTA() {
  const t = useTranslations("FinalCTA");

  return (
    <section id="cta" className="py-24 md:py-32 px-6 md:px-8 border-t border-border relative overflow-hidden">
      {/* Subtle glow background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-accent/[0.03] blur-[120px]" />
      </div>

      <div className="max-w-[600px] mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-5 text-text-primary animate-fade-in-up">
          {t("headline")}
        </h2>
        <p className="text-text-dim text-sm md:text-base font-light max-w-md mx-auto mb-10 leading-relaxed animate-fade-in-up delay-100">
          {t("description")}
        </p>

        <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up delay-200">
          <Link
            href="/download"
            className="px-8 py-4 bg-accent text-bg text-[11px] font-medium uppercase tracking-[0.12em] rounded-md hover:bg-accent/90 transition-all duration-200 cursor-pointer shadow-lg shadow-accent/10"
          >
            {t("downloadNow")}
          </Link>
          <button
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-text-primary border border-border hover:border-text-muted transition-all duration-200 cursor-pointer rounded-md"
          >
            {t("viewPricing")}
          </button>
        </div>

        <p className="text-text-muted/50 text-[10px] font-light mt-8 tracking-wide animate-fade-in-up delay-300">
          {t("noSpam")}
        </p>
      </div>
    </section>
  );
}
