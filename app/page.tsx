import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";

export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <HowItWorks />
      <div id="demo" />
      <div id="pricing" />
      <div id="trust" />
      <div id="footer" />
    </main>
  );
}
