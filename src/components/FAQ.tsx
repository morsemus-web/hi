"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function FAQ() {
  const t = useTranslations("FAQ");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: t("q1"), answer: t("a1") },
    { question: t("q2"), answer: t("a2") },
    { question: t("q3"), answer: t("a3") },
    { question: t("q4"), answer: t("a4") },
    { question: t("q5"), answer: t("a5") },
  ];

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-4">
            {t("sectionLabel")}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-4 text-text-primary">
            {t("headline")}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between text-left px-6 py-5 cursor-pointer"
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-medium text-text-primary pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180" : ""}`}
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
                style={{ gridTemplateRows: openIndex === i ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm font-light text-text-dim leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
