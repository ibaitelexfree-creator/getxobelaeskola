import React from 'react';
import HeroCarousel from '@/components/home/HeroCarousel';
import ExperienceSection from '@/components/home/ExperienceSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ProgramsSection from '@/components/home/ProgramsSection';
import { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isEu = locale === 'eu';
  const isEn = locale === 'en';
  const isFr = locale === 'fr';

  let title = 'Inicio | Getxo Bela Eskola';
  let description = 'Bienvenido a Getxo Bela Eskola. Aprende a navegar, alquila material y vive experiencias náuticas inolvidables en el Puerto de Getxo.';

  if (isEu) {
    title = 'Hasiera | Getxo Bela Eskola';
    description = 'Ongi etorri Getxo Bela Eskolara. Ikasi nabigatzen, alokatu materiala eta bizi itsas esperientzia ahaztezinak Getxon.';
  } else if (isEn) {
    title = 'Home | Getxo Sailing School';
    description = 'Welcome to Getxo Sailing School. Learn to sail, rent equipment and live unforgettable nautical experiences in Getxo Marina.';
  } else if (isFr) {
    title = 'Accueil | Getxo Sailing School';
    description = 'Bienvenue à Getxo Sailing School. Apprenez la voile, louez du matériel et vivez des expériences nautiques inoubliables à Getxo.';
  }

  return {
    title,
    description,
  };
}

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
