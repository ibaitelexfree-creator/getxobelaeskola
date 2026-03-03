import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsBar } from '@/components/home/StatsBar';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { NeighborhoodGrid } from '@/components/home/NeighborhoodGrid';
import { DubaiInteractiveMap } from '@/components/home/DubaiInteractiveMap';
import { CTASection } from '@/components/home/CTASection';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: "Luxe Dubai Estates | Where Dreams Meet Skylines",
  description: "Experience the ultimate in luxury living at Luxe Dubai Estates. Explore our handpicked collection of the finest villas, penthouses and designer apartments across Dubai's most prestigious postcodes.",
  openGraph: {
    title: "Luxe Dubai Estates | Premier Luxury Real Estate Agency",
    description: "Discover exclusive luxury properties across Dubai's iconic skyline and waterfront living.",
    images: ['/images/neighborhoods/downtown-dubai.png']
  }
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturedProperties />
        <DubaiInteractiveMap />
        <NeighborhoodGrid />
        <CTASection />
      </main>
      <Footer locale="en" />
    </>
  );
}
