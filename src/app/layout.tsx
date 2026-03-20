import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "ScoreDeck — Live Sports Scores on Your Desktop",
  description:
    "A lightweight desktop app that keeps you updated on Cricket, Football, Basketball, and Formula 1 scores — without opening a browser.",
  metadataBase: new URL("https://tryscoredeck.pro"),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "ScoreDeck — Live Sports Scores on Your Desktop",
    description:
      "A lightweight desktop overlay for live Cricket, Football, Basketball & F1 scores. Always visible, never intrusive.",
    url: "https://tryscoredeck.pro",
    siteName: "ScoreDeck",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoreDeck — Live Sports Scores on Your Desktop",
    description:
      "A lightweight desktop overlay for live Cricket, Football, Basketball & F1 scores.",
  },
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
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
