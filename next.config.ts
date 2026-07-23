import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/(.*)\\.(js|css|woff2?|ttf|eot)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/(.*)\\.(png|jpg|jpeg|gif|webp|avif|ico|svg)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/demo.mp4",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
    {
      source: "/((?!api|_next).*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
      ],
    },
    {
      source: "/:locale/news/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type" },
      ],
    },
    {
      // CORS for every /api/* route so the desktop widget (Electron),
      // mobile web preview, and native APK can all call the backend
      // cross-origin. Safe because our auth uses Bearer tokens (not
      // credentialed cookies) — no origin whitelist needed.
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        { key: "Access-Control-Max-Age", value: "86400" },
      ],
    },
    {
      source: "/news-sitemap.xml",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Content-Type", value: "application/xml" },
      ],
    },
  ],
};

export default withNextIntl(nextConfig);
