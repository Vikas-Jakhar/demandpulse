"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { FeatureCarousel } from "./FeatureCarousel";
import { ProductBenefits } from "./ProductBenefits";
import { ArchitecturePipeline } from "./ArchitecturePipeline";
import { InteractiveSandbox } from "./InteractiveSandbox";
import { Testimonials } from "./Testimonials";
import { FAQSection } from "./FAQSection";
import { CallToAction } from "./CallToAction";
import { ContactFooter } from "./ContactFooter";

interface HomePageClientProps {
  isLoggedIn: boolean;
}

export function HomePageClient({ isLoggedIn }: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-canvas text-ink selection:bg-signal/20 selection:text-signal antialiased">
      {/* Top Navigation */}
      <Navbar isLoggedIn={isLoggedIn} />

      {/* Main Content Sections */}
      <main>
        <Hero />
        <FeatureCarousel />
        <ProductBenefits />
        <ArchitecturePipeline />
        <InteractiveSandbox />
        <Testimonials />
        <FAQSection />
        <CallToAction />
      </main>

      {/* Contact & Footer Section */}
      <ContactFooter />
    </div>
  );
}
