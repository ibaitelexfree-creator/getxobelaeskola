import Link from 'next/link';
import Image from 'next/image';
import HeroCarousel from '@/components/home/HeroCarousel';
import StatsSection from '@/components/home/StatsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ExperienceSection from '@/components/home/ExperienceSection';
import '@/app/globals.css';

import { getTranslations } from 'next-intl/server';

export default async function Home({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="min-h-screen bg-nautical-black text-white selection:bg-accent selection:text-nautical-black">
      {/* 1. Full-screen Hero Carousel */}
      <HeroCarousel />

      {/* 2. Stats Section - Tradition and Trust */}
      <StatsSection />

      {/* 2.1 Why Choose Us - 3D Icons Section */}
      <FeaturesSection />

      {/* 3. Deep-dive Experience Section */}
      <ExperienceSection />

      {/* 4. Mini Featured Courses Preview */}
      <section className="py-64 bg-nautical-black relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-accent/5 blur-[120px] rounded-full -translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-brass-gold/5 blur-[100px] rounded-full translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <header className="mb-32">
            <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-bold mb-8 block animate-fade-in-up">
              {t('programs.badge')}
            </span>
            <h2 className="text-4xl md:text-7xl lg:text-9xl font-display text-white mb-12 italic leading-none animate-reveal">
              {t('programs.title')}
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-brass-gold to-transparent mx-auto" />
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: t('programs.licencia_title'),
                price: t('programs.licencia_price'),
                desc: t('programs.licencia_desc'),
                link: '/courses/licencia-navegacion',
                image: "/images/course-license-navigation.jpg"
              },
              {
                title: t('programs.j80_title'),
                price: t('programs.j80_price'),
                desc: t('programs.j80_desc'),
                link: '/courses/iniciacion-j80',
                image: "/images/course-card-initiation.jpg"
              },
              {
                title: t('programs.rental_title'),
                price: t('programs.price_rental'),
                desc: t('programs.rental_desc'),
                link: '/rental',
                image: "/images/course-card-advanced.jpg"
              }
            ].map((item, i) => (
              <Link
                key={i}
                href={`/${locale}${item.link}`}
                className="group relative h-[600px] overflow-hidden border border-white/5 hover:border-accent/40 transition-all duration-700"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/20 to-transparent" />

                <div className="absolute inset-0 p-12 flex flex-col justify-end text-left">
                  <span className="text-brass-gold font-display text-2xl mb-4 block leading-none">{item.price}</span>
                  <h3 className="text-4xl font-display text-white mb-6 italic leading-tight group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-foreground/60 font-light text-base leading-relaxed mb-8 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] font-black text-accent mt-4">
                    <span className="border-b-2 border-accent/20 pb-1 group-hover:border-accent transition-all duration-500">
                      {t('programs.learn_more')}
                    </span>
                    <span className="translate-x-0 group-hover:translate-x-3 transition-transform duration-500">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Fleet Preview Section - Full Width Cinematic */}
      <section className="relative h-screen w-full overflow-hidden group">
        <Image
          src="/images/home-fleet-preview.jpg"
          alt="The Fleet"
          fill
          loading="lazy"
          sizes="100vw"
          className="object-cover scale-100 group-hover:scale-110 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute inset-0 bg-nautical-black/50 backdrop-blur-[1px] group-hover:bg-nautical-black/30 transition-all duration-1000" />

        {/* Aesthetic Gradient Overlays */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-nautical-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-nautical-black to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center space-y-16">
            <header className="space-y-8">
              <span className="text-accent uppercase tracking-[0.6em] text-[10px] font-bold block opacity-40 group-hover:opacity-100 transition-opacity">Nuestra Flota</span>
              <h2 className="text-4xl md:text-8xl lg:text-[12rem] font-display text-white mb-12 italic leading-none animate-reveal">
                {t('fleet_cta.title')} <br />
                <span className="not-italic font-light text-brass-gold/80">{t('fleet_cta.highlight')}</span>
              </h2>
            </header>

            <Link
              href={`/${locale}/rental`}
              className="group relative inline-flex items-center gap-8 px-16 py-8 border border-white hover:border-accent transition-all duration-700 overflow-hidden"
            >
              <div className="absolute inset-0 w-0 bg-white group-hover:w-full transition-all duration-700 ease-out z-0" />
              <span className="relative z-10 text-white group-hover:text-nautical-black text-[13px] uppercase tracking-[0.4em] font-black transition-colors duration-700">
                {t('fleet_cta.action')}
              </span>
            </Link>
          </div>
        </div>

        {/* Cinematic Coordinates Decor */}
        <div className="absolute bottom-12 left-12 hidden lg:block text-[8px] tracking-[0.5em] text-white/20 uppercase font-light">
          <span>Arriluze Kaia · 43.3444° N, 3.0114° W</span>
        </div>
      </section>
    </main>
  );
}
