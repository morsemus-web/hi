import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import Solution from "@/components/Solution";
import Features from "@/components/Features";
import Commentary from "@/components/Commentary";
import LatestNews from "@/components/LatestNews";
import LiveTracker from "@/components/LiveTracker";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import SocialProof from "@/components/SocialProof";
import FinalCTA from "@/components/FinalCTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What sports does ScoreDeck currently support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ScoreDeck currently provides live coverage for Cricket, Football, Basketball, and Formula 1. We are also working on adding support for NFL, Tennis, MMA, and Hockey in the near future.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Desktop Overlay actually work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Unlike a browser tab, ScoreDeck is a lightweight application that sits directly on your desktop, typically pinned above your taskbar. It uses a stealth mode and adjustable opacity so you can keep an eye on the score while working in tools like VS Code, Excel, or during video meetings without switching windows.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Founding User $29 price really a one-time payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! For the first 1,000 users, the $29 Founding Access is a lifetime license. You will never pay a monthly or annual subscription fee, and you'll get all future updates and sports added to the platform.",
      },
    },
    {
      "@type": "Question",
      name: "Does the live commentary work in the background?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. You can toggle live audio commentary in English, Hindi, Spanish, or German. This allows you to listen to the match flow while you commute or focus on tasks that require your full visual attention.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track multiple matches or sports at the same time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Multi-Match View allows you to pin and track multiple games simultaneously across different sports. You can even use the Popout Live Tracker to have a small, draggable widget for a specific high-stakes game.",
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
      <FAQ />
      <LatestNews />
      <Footer />
    </>
  );
}
