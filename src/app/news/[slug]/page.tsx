import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle, getCategoryStyle } from "@/lib/news";
import { InArticleAd, MultiplexAd } from "@/components/ArticleAds";
import type { Metadata } from "next";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    authors: [{ name: article.author }],
    alternates: { canonical: `https://tryscoredeck.pro/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      siteName: "ScoreDeck",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

function renderContent(content: string, images?: Record<string, string>) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      i++;
      continue;
    }

    // Handle (image-N) references
    const imageMatch = trimmed.match(/^\(image-(\d+)\)$/);
    if (imageMatch && images) {
      const ref = `image-${imageMatch[1]}`;
      const url = images[ref];
      if (url) {
        elements.push(
          <figure key={i} className="my-6">
            <img
              src={url}
              alt={`Article image ${imageMatch[1]}`}
              className="w-full rounded-lg"
              loading="lazy"
            />
          </figure>
        );
      }
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-lg font-semibold text-text-primary mt-8 mb-3"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith("- **")) {
      const match = trimmed.match(/^- \*\*(.+?)\*\*(.*)$/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 mb-2">
            <strong className="text-text-primary/80">{match[1]}</strong>
            {match[2]}
          </li>
        );
      }
    } else if (trimmed.startsWith("- ")) {
      elements.push(
        <li key={i} className="ml-4 mb-2">
          {trimmed.slice(2)}
        </li>
      );
    } else {
      elements.push(
        <p key={i} className="mb-4">
          {trimmed}
        </p>
      );
    }
    i++;
  }

  return elements;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: article.author,
      url: "https://tryscoredeck.pro",
    },
    publisher: {
      "@type": "Organization",
      name: "ScoreDeck",
      url: "https://tryscoredeck.pro",
      logo: {
        "@type": "ImageObject",
        url: "https://tryscoredeck.pro/favicon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tryscoredeck.pro/news/${article.slug}`,
    },
    isPartOf: {
      "@type": "Product",
      name: "ScoreDeck",
      productID: "CAow0vjFDA:openaccess",
    },
    isAccessibleForFree: true,
    keywords: article.tags.join(", "),
    articleSection: article.category,
    inLanguage: "en",
  };

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-[720px] mx-auto px-6 py-20">
        <Link
          href="/news"
          className="text-[10px] uppercase tracking-[0.2em] text-accent/60 hover:text-accent transition-colors"
        >
          &larr; Back to News
        </Link>

        <div className="flex items-center gap-3 mt-8 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-[9px] font-medium uppercase tracking-wider ${getCategoryStyle(
              article.category
            )}`}
          >
            {article.category}
          </span>
          <time
            dateTime={article.publishedAt}
            className="text-text-muted/40 text-[10px] font-light"
          >
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 leading-tight">
          {article.title}
        </h1>

        <p className="text-text-dim text-sm font-light mb-2">
          By {article.author}
        </p>

        <hr className="border-border my-8" />

        <div className="text-sm text-text-dim leading-relaxed">
          {renderContent(article.content, article.images)}
        </div>

        {/* In-article ad */}
        <InArticleAd />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[9px] font-light tracking-wider bg-overlay-5 text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card rounded-xl p-6 sm:p-8 mt-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent/60 mb-2">
            Never miss a moment
          </p>
          <p className="text-sm text-text-dim font-light mb-5">
            Get live scores for Cricket, Football, Basketball & F1 right on your
            desktop.
          </p>
          <Link
            href="/#waitlist"
            className="inline-block px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-bg bg-accent hover:bg-accent/90 transition-colors rounded-md"
          >
            Join Free Waitlist
          </Link>
        </div>

        {/* Multiplex ad */}
        <MultiplexAd />
      </article>
    </main>
  );
}
