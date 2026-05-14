"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";



export default function SocialProof() {
  const t = useTranslations("SocialProof");

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

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[900px] mx-auto text-center">


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
