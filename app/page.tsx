import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoBriefings } from "@/components/landing/demo-briefings";

export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <HowItWorks />
      <DemoBriefings />
      <div id="pricing" />
      <div id="trust" />
      <div id="footer" />
    </main>
  );
}
