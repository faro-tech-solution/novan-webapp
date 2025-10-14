'use client';

import Header from '@/components/layout/Header';
import { HeroSection, ValuePropositionSection, CTABannerSection, CoursesSection, Footer } from '@/components/public';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Value Proposition Section */}
      <ValuePropositionSection />

      {/* Courses Section */}
      <CoursesSection />

      {/* CTA Banner Section */}
      <CTABannerSection />

      {/* Footer */}
      <Footer />
    </div>
  );
} 