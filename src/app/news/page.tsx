import Link from "next/link";
import { articles, getCategoryStyle } from "@/lib/news";
import NewsList from "@/components/NewsList";
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

        <NewsList articles={articles} />
      </div>
    </main>
  );
}
