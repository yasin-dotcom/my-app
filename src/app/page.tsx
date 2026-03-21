"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { StatsSection } from "@/components/StatsSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { AnalysisPreview } from "@/components/AnalysisPreview";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { BetaSignupSection } from "@/components/BetaSignupSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [signupSuccess, setSignupSuccess] = useState(false);

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection onCtaClick={() => document.getElementById("beta-signup")?.scrollIntoView({ behavior: "smooth" })} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AnalysisPreview />
      <TestimonialsSection />
      <BetaSignupSection success={signupSuccess} onSuccess={() => setSignupSuccess(true)} />
      <Footer />
    </main>
  );
}
