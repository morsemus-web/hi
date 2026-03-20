import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "ScoreDeck — Live Cricket, Football, Basketball & F1 Scores on Your Desktop",
    template: "%s — ScoreDeck",
  },
  description:
    "Get real-time live scores, ball-by-ball updates, and key moments for Cricket, Football (Soccer), NBA Basketball, and Formula 1 — right on your desktop. No browser needed. ScoreDeck is a lightweight overlay that keeps you updated without breaking your focus.",
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
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ScoreDeck — Live Cricket, Football, Basketball & F1 Scores on Your Desktop",
    description:
      "Real-time live scores and key moments for Cricket, Football, NBA Basketball & Formula 1. A lightweight desktop overlay — always visible, never intrusive.",
    url: "https://tryscoredeck.pro",
    siteName: "ScoreDeck",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoreDeck — Live Sports Scores on Your Desktop",
    description:
      "Real-time Cricket, Football, NBA & F1 scores in a lightweight desktop overlay. Live score updates, key moments, zero interruptions.",
  },
  alternates: {
    canonical: "https://tryscoredeck.pro",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

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
        "A lightweight desktop overlay for live sports scores — Cricket (runs, wickets, overs, run rate), Football (goals, assists, xG), Basketball (points, rebounds, assists), and Formula 1 (lap times, pit stops, grid positions). Real-time updates without breaking focus.",
      offers: {
        "@type": "Offer",
        price: "29.00",
        priceCurrency: "USD",
        name: "Founding Access — Lifetime",
        availability: "https://schema.org/LimitedAvailability",
        url: "https://chaddhafateh.gumroad.com/l/tgdwsy?wanted=true",
      },
      featureList: [
        "Live Cricket scores with ball-by-ball updates, run rate, and fall of wickets",
        "Real-time Football scores with goals, assists, and expected goals (xG)",
        "NBA Basketball live scores with points, rebounds, assists, and box scores",
        "Formula 1 live timing with lap times, pit stops, and grid positions",
        "Desktop system tray overlay — always visible, never intrusive",
        "Supports Cricket, Football (Soccer), Basketball, and F1",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
