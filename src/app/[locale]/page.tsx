'use client';

import React from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import ExperienceSection from '@/components/home/ExperienceSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProgramsSection from '@/components/home/ProgramsSection';

export default function LandingPage() {
  return (
    <main className="w-full">
      <HeroCarousel />
      <StatsSection />
      <ExperienceSection />
      <ProgramsSection />
      <FeaturesSection />

      {/* SEO Hidden H1 */}
      <h1 className="sr-only">Getxo Bela Eskola | Escuela de Vela en Getxo</h1>
    </main>
  );
}
