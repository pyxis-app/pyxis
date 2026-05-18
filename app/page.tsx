import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";

export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <div id="how" />
      <div id="demo" />
      <div id="pricing" />
      <div id="trust" />
      <div id="footer" />
    </main>
  );
}
