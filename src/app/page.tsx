import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Features from "@/components/Features";
import Commentary from "@/components/Commentary";
import LiveTracker from "@/components/LiveTracker";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import SocialProof from "@/components/SocialProof";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What sports does ScoreDeck support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScoreDeck supports live scores for Cricket (runs, wickets, overs, run rate, partnerships), Football/Soccer (goals, assists, xG, possession), NBA Basketball (points, rebounds, assists, box scores), and Formula 1 (lap times, pit stops, grid positions, sector times).",
      },
    },
    {
      "@type": "Question",
      name: "How does ScoreDeck deliver live scores?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScoreDeck is a lightweight desktop overlay that sits in your system tray. It provides real-time score updates, live ticker alerts, and key moment notifications without requiring you to open a browser or switch tabs.",
      },
    },
    {
      "@type": "Question",
      name: "How much does ScoreDeck cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScoreDeck Founding Access is a one-time payment of $29 for lifetime access — no subscriptions or recurring fees. This includes all 4 sports, all features, and all future updates. Limited to the first 1,000 users.",
      },
    },
    {
      "@type": "Question",
      name: "What platforms does ScoreDeck run on?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScoreDeck currently runs on Windows as a native desktop application built with Tauri. It sits in your system tray and taskbar, delivering live scores without interrupting your workflow.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Commentary />
      <LiveTracker />
      <HowItWorks />
      <Pricing />
      <SocialProof />
      <FinalCTA />
      <Footer />
    </>
  );
}
