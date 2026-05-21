import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import LiveSoccerClient from "@/components/LiveSoccerClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeMap: Record<string, string> = {};
  for (const l of routing.locales) {
    localeMap[l] = `https://tryscoredeck.pro/${l}/live-soccer-now`;
  }
  return {
    title: "Live Football Scores & Schedules — ScoreDeck",
    description: "Real-time soccer scores, match schedules, and live updates from leagues worldwide. English Premier League, La Liga, Serie A, Champions League, and more.",
    alternates: { canonical: `https://tryscoredeck.pro/${locale}/live-soccer-now`, languages: localeMap },
    openGraph: {
      title: "Live Football Scores & Schedules — ScoreDeck",
      description: "Real-time soccer scores and schedules. Track Premier League, La Liga, Serie A, Champions League and global football matches live.",
      type: "website",
    },
  };
}

export default function LiveSoccerPage() {
  return <LiveSoccerClient />;
}
