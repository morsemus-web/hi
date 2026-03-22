import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/thanks", "/news/create"],
      },
      {
        userAgent: "Googlebot-News",
        allow: "/news/",
        disallow: ["/api/", "/thanks", "/news/create"],
      },
    ],
    sitemap: [
      "https://tryscoredeck.pro/sitemap.xml",
      "https://tryscoredeck.pro/news-sitemap.xml",
    ],
  };
}
