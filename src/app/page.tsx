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

export default function Home() {
  return (
    <>
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
