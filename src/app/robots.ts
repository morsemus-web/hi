import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/thanks"],
      },
    ],
    sitemap: "https://tryscoredeck.pro/sitemap.xml",
  };
}
