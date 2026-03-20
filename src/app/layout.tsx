import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
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
      </head>
      <body>{children}</body>
    </html>
  );
}
