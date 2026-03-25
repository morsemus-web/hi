import type { MetadataRoute } from "next";
import { articles } from "@/lib/news";

const BASE_URL = "https://tryscoredeck.pro";
const locales = ["en", "es", "de", "hi", "ar"];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/news", changeFrequency: "daily" as const, priority: 0.9 },
    { path: "/privacy", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.3 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  const newsPages: MetadataRoute.Sitemap = articles.flatMap((article) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/news/${article.slug}`,
      lastModified: new Date(article.updatedAt || article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  );

  return [...staticPages, ...newsPages];
}
