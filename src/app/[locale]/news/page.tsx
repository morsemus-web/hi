import { Link } from "@/i18n/navigation";
import { articles, getCategoryStyle } from "@/lib/news";
import NewsList from "@/components/NewsList";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const localeMap: Record<string, string> = {};
  for (const l of routing.locales) {
    localeMap[l] = `https://tryscoredeck.pro/${l}/news`;
  }
  return {
    title: t("newsTitle"),
    description: t("newsDescription"),
    alternates: { canonical: `https://tryscoredeck.pro/${locale}/news`, languages: localeMap },
    openGraph: {
      title: t("newsTitle"),
      description: t("newsDescription"),
      type: "website",
    },
  };
}

const categories = [
  { key: "all", label: "All" },
  { key: "cricket", label: "Cricket" },
  { key: "football", label: "Football" },
  { key: "basketball", label: "Basketball" },
  { key: "f1", label: "F1" },
];

export default async function NewsPage() {
  const t = await getTranslations("News");
  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-[960px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; {t("backToScoreDeck")}
        </Link>

        <h1 className="text-3xl font-bold mt-8 mb-2 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-text-dim text-sm font-light mb-10">
          {t("subtitle")}
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
