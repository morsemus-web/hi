"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { type NewsArticle, getCategoryStyle } from "@/lib/news";
import AdUnit from "./AdUnit";

export default function NewsList({ articles }: { articles: NewsArticle[] }) {
  const t = useTranslations("News");
  return (
    <div className="space-y-6">
      {articles.map((article, i) => (
        <div key={article.slug}>
          {i > 0 && i % 2 === 0 ? (
            <AdUnit
              slot="5072792142"
              layoutKey="-fb+5y+3y-dx+b1"
              className="my-6"
            />
          ) : null}
          <Link
            href={`/news/${article.slug}`}
            className="block glass-card rounded-xl p-6 sm:p-8 hover:border-accent/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-[9px] font-medium uppercase tracking-wider ${getCategoryStyle(
                  article.category
                )}`}
              >
                {article.category}
              </span>
              <span className="text-text-muted/40 text-[10px] font-light">
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <h2 className="text-lg font-semibold tracking-tight mb-2 group-hover:text-accent transition-colors">
              {article.title}
            </h2>

            <p className="text-text-dim text-sm font-light leading-relaxed mb-4">
              {article.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted/50 font-light">
                {t("by")} {article.author}
              </span>
              <span className="text-[10px] text-accent/60 font-medium uppercase tracking-wider group-hover:text-accent transition-colors">
                {t("readMore")} &rarr;
              </span>
            </div>
          </Link>
        </div>
      ))}

      {/* Multiplex ad at bottom */}
      <AdUnit
        slot="2446628807"
        format="autorelaxed"
        className="mt-12"
      />
    </div>
  );
}
