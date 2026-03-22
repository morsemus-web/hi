import Link from "next/link";
import { articles, getCategoryStyle } from "@/lib/news";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports News — Cricket, Football, NBA & F1 Updates",
  description:
    "Latest sports news, analysis, and match previews for Cricket, Football (Soccer), NBA Basketball, and Formula 1. Expert coverage from the ScoreDeck Sports Desk.",
  alternates: { canonical: "https://tryscoredeck.pro/news" },
  openGraph: {
    title: "Sports News — ScoreDeck",
    description:
      "Latest sports news, analysis, and match previews for Cricket, Football, NBA Basketball, and Formula 1.",
    type: "website",
  },
};

const categories = [
  { key: "all", label: "All" },
  { key: "cricket", label: "Cricket" },
  { key: "football", label: "Football" },
  { key: "basketball", label: "Basketball" },
  { key: "f1", label: "F1" },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[960px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to ScoreDeck
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-2 tracking-tight">
          Sports News
        </h1>
        <p className="text-text-dim text-sm font-light mb-10">
          Match previews, analysis, and updates from the ScoreDeck Sports Desk.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <span
              key={cat.key}
              className={`px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                cat.key === "all"
                  ? "bg-accent/15 text-accent"
                  : getCategoryStyle(cat.key)
              }`}
            >
              {cat.label}
            </span>
          ))}
        </div>

        {/* Articles grid */}
        <div className="space-y-6">
          {articles.map((article) => (
            <Link
              key={article.slug}
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
                  By {article.author}
                </span>
                <span className="text-[10px] text-accent/60 font-medium uppercase tracking-wider group-hover:text-accent transition-colors">
                  Read more &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
