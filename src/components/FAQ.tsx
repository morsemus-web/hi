"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What sports does ScoreDeck currently support?",
    answer:
      "ScoreDeck currently provides live coverage for Cricket, Football, Basketball, and Formula 1. We are also working on adding support for NFL, Tennis, MMA, and Hockey in the near future.",
  },
  {
    question: 'How does the "Desktop Overlay" actually work?',
    answer:
      'Unlike a browser tab, ScoreDeck is a lightweight application that sits directly on your desktop, typically pinned above your taskbar. It uses a "stealth mode" and adjustable opacity so you can keep an eye on the score while working in tools like VS Code, Excel, or during video meetings without switching windows.',
  },
  {
    question: 'Is the "Founding User" $29 price really a one-time payment?',
    answer:
      "Yes! For the first 1,000 users, the $29 Founding Access is a lifetime license. You will never pay a monthly or annual subscription fee, and you'll get all future updates and sports added to the platform.",
  },
  {
    question: "Does the live commentary work in the background?",
    answer:
      "Absolutely. You can toggle live audio commentary in English, Hindi, Spanish, or German. This allows you to listen to the match flow while you commute or focus on tasks that require your full visual attention.",
  },
  {
    question: "Can I track multiple matches or sports at the same time?",
    answer:
      "Yes. The Multi-Match View allows you to pin and track multiple games simultaneously across different sports. You can even use the Popout Live Tracker to have a small, draggable widget for a specific high-stakes game.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-32 px-6 md:px-8 border-t border-border">
      <div className="max-w-[700px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] font-light uppercase tracking-[0.25em] text-text-muted mb-4">
            FAQ
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] mb-4 text-text-primary">
            Frequently Asked Questions
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
