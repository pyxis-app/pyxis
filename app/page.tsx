import { LandingNav } from "@/components/landing/nav";
import { StarField } from "@/components/landing/star-field";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoBriefings } from "@/components/landing/demo-briefings";
import { Pricing } from "@/components/landing/pricing";
import { TrustGrid } from "@/components/landing/trust-grid";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <StarField />
      <main className="relative">
        <LandingNav />
        <Hero />
        <HowItWorks />
        <DemoBriefings />
        <Pricing />
        <TrustGrid />
        <Footer />
      </main>
    </>
  );
}
