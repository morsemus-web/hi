import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import LiveCricketClient from "@/components/LiveCricketClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeMap: Record<string, string> = {};
  for (const l of routing.locales) {
    localeMap[l] = `https://tryscoredeck.pro/${l}/live-cricket-now`;
  }
  return {
    title: "Live Cricket Scores — ScoreDeck",
    description: "Real-time cricket scores, ball-by-ball updates, live batsmen and bowler stats. IPL, International, and County cricket — all in one place.",
    alternates: { canonical: `https://tryscoredeck.pro/${locale}/live-cricket-now`, languages: localeMap },
    openGraph: {
      title: "Live Cricket Scores — ScoreDeck",
      description: "Real-time cricket scores with ball-by-ball updates. Track IPL, International, and County matches live.",
      type: "website",
    },
  };
}

export default function LiveCricketPage() {
  return <LiveCricketClient />;
}
