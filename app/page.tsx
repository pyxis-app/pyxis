import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoBriefings } from "@/components/landing/demo-briefings";
import { Pricing } from "@/components/landing/pricing";
import { TrustGrid } from "@/components/landing/trust-grid";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="relative term-grid-bg">
      <LandingNav />
      <Hero />
      <HowItWorks />
      <DemoBriefings />
      <Pricing />
      <TrustGrid />
      <Footer />
    </main>
  );
}
