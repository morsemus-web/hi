"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { articles as allArticles, getCategoryStyle } from "@/lib/news";

export default function LatestNews() {
  const articles = allArticles.slice(0, 5);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }

  useEffect(() => {
    updateScrollState();
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
    setTimeout(updateScrollState, 350);
  }

  return (
    <section className="py-20 md:py-28 px-6 md:px-8 border-t border-border">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-light uppercase tracking-[0.25em] text-accent/60 mb-3">
              From the desk
            </p>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-text-primary">
              Latest News
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Scroll left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border-hover transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Scroll right"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
            <Link
              href="/news"
              className="text-[10px] font-medium uppercase tracking-[0.12em] text-accent hover:text-accent/80 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-6 px-6 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/news/${article.slug}`}
              className="flex-shrink-0 w-[300px] snap-start group"
            >
              <div className="glass-card rounded-xl p-5 h-full hover:border-accent/20 transition-all duration-300">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-wider ${getCategoryStyle(
                      article.category
                    )}`}
                  >
                    {article.category}
                  </span>
                  <span className="text-text-muted/40 text-[9px] font-light">
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <h3 className="text-sm font-semibold tracking-tight mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-text-dim text-[11px] font-light leading-relaxed line-clamp-3 mb-4">
                  {article.description}
                </p>

                <span className="text-[9px] text-accent/60 font-medium uppercase tracking-wider group-hover:text-accent transition-colors">
                  Read more &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
