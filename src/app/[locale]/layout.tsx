import type { Metadata } from "next";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ThemeProvider from "@/components/ThemeProvider";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const localeMap: Record<string, string> = {
    en: "en_US",
    es: "es_ES",
    de: "de_DE",
    hi: "hi_IN",
    ar: "ar_SA",
  };

  return {
    title: {
      default: t("homeTitle"),
      template: "%s — ScoreDeck",
    },
    description: t("homeDescription"),
    metadataBase: new URL("https://tryscoredeck.pro"),
    keywords: [
      "live score", "live sports scores", "desktop sports app", "real-time updates",
      "cricket live score", "runs", "wickets", "overs", "run rate", "ball-by-ball",
      "football live score", "soccer scores", "goals", "assists", "clean sheet", "xG",
      "NBA live score", "basketball scores", "points", "rebounds", "assists",
      "F1 live timing", "Formula 1 scores", "lap time", "pit stop", "grid position",
      "live ticker", "box score", "standings", "fixtures", "H2H",
      "scoredeck", "sports overlay", "desktop overlay", "system tray scores",
    ],
    icons: { icon: "/favicon.svg" },
    openGraph: {
      title: t("homeTitle"),
      description: t("ogDescription"),
      url: `https://tryscoredeck.pro/${locale}`,
      siteName: "ScoreDeck",
      type: "website",
      locale: localeMap[locale] || "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
    alternates: {
      canonical: `https://tryscoredeck.pro/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://tryscoredeck.pro/${l}`])
      ),
    },
    other: {
      "google-adsense-account": "ca-pub-7182949672912731",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tryscoredeck.pro/#organization",
      name: "ScoreDeck",
      url: "https://tryscoredeck.pro",
      logo: "https://tryscoredeck.pro/favicon.svg",
      email: "hello@tryscoredeck.pro",
      description:
        "ScoreDeck is a desktop overlay app that delivers real-time live scores for Cricket, Football, Basketball, and Formula 1 — without interrupting your workflow.",
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": "https://tryscoredeck.pro/#website",
      url: "https://tryscoredeck.pro",
      name: "ScoreDeck",
      publisher: { "@id": "https://tryscoredeck.pro/#organization" },
      description:
        "Live Cricket, Football, NBA Basketball & F1 scores on your desktop. Real-time updates, key moments, zero interruptions.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://tryscoredeck.pro/#app",
      name: "ScoreDeck",
      operatingSystem: "Windows",
      applicationCategory: "SportsApplication",
      description:
        "A lightweight desktop overlay for live sports scores — Cricket, Football, Basketball, and Formula 1. Real-time updates without breaking focus.",
      offers: {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        name: "Founding Access — Lifetime",
        availability: "https://schema.org/LimitedAvailability",
        url: "https://chaddhafateh.gumroad.com/l/tgdwsy?wanted=true",
      },
      featureList: [
        "Live Cricket scores with ball-by-ball updates",
        "Real-time Football scores with goals and xG",
        "NBA Basketball live scores",
        "Formula 1 live timing",
        "Desktop system tray overlay",
        "Supports Cricket, Football, Basketball, and F1",
      ],
    },
  ],
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8K7CPHW742"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-8K7CPHW742');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7182949672912731"
          crossOrigin="anonymous"
        />
        <Script
          async
          src="https://news.google.com/swg/js/v1/swg-basic.js"
          strategy="afterInteractive"
        />
        <Script id="swg-init" strategy="afterInteractive">
          {`
            (self.SWG_BASIC = self.SWG_BASIC || []).push(function(basicSubscriptions) {
              basicSubscriptions.init({
                type: "NewsArticle",
                isPartOfType: ["Product"],
                isPartOfProductId: "CAow0vjFDA:openaccess",
                clientOptions: { theme: "light", lang: "${locale}" },
              });
            });
          `}
        </Script>
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
