import { articles } from "@/lib/news";

export async function GET() {
  const entries = articles
    .map(
      (article) => `
    <url>
      <loc>https://tryscoredeck.pro/en/news/${article.slug}</loc>
      <news:news>
        <news:publication>
          <news:name>ScoreDeck</news:name>
          <news:language>en</news:language>
        </news:publication>
        <news:publication_date>${article.publishedAt}</news:publication_date>
        <news:title>${escapeXml(article.title)}</news:title>
        <news:keywords>${escapeXml(article.tags.join(", "))}</news:keywords>
      </news:news>
    </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
