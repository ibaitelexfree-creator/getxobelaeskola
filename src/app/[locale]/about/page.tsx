import React from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'about_page' });

    return (
        <main className="min-h-screen bg-nautical-black text-white selection:bg-accent selection:text-nautical-black">
            {/* 1. Cinematic Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/about-hero-heritage.jpg"
                        alt="Maritime Heritage"
                        fill
                        priority
                        className="object-cover opacity-30 scale-100 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-nautical-black via-transparent to-nautical-black" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="flex flex-col items-center">
                        <span className="inline-block text-accent uppercase tracking-[1em] text-sm font-bold mb-12 opacity-80 animate-fade-in-up">
                            {t('header_badge')}
                        </span>
                        <h1 className="text-4xl md:text-7xl lg:text-[10rem] font-display text-white leading-[0.9] mb-12 drop-shadow-2xl animate-reveal relative">
                            {t('header_title')} <br />
                            <span className="italic font-light text-brass-gold/90">
                                {t('header_highlight')}
                            </span>
                        </h1>
                        <div className="flex items-center gap-8 w-full max-w-4xl opacity-40 animate-fade-in" style={{ animationDelay: '1s' }}>
                            <div className="h-px flex-grow bg-gradient-to-l from-white to-transparent" />
                            <p className="text-sm uppercase tracking-[0.4em] font-light whitespace-nowrap">
                                {t('header_suffix')}
                            </p>
                            <div className="h-px flex-grow bg-gradient-to-r from-white to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Aesthetic Coordinates Decor */}
                <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end gap-2 text-[8px] tracking-[0.4em] text-white/20 uppercase font-light">
                    <span>43° 20&apos; 40&quot; N</span>
                    <span>2° 59&apos; 14&quot; W</span>
                </div>
            </section>

            {/* 2. Heritage & Story Section */}
            <section className="py-24 md:py-48 relative overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">
                        {/* Decorative Quote Mark */}
                        <div className="lg:col-span-1 hidden lg:block self-start pt-12">
                            <span className="font-display text-9xl text-accent/10 italic leading-none">&quot;</span>
                        </div>

                        <div className="lg:col-span-5 space-y-12 relative">
                            <div className="space-y-6">
                                <h2 className="text-3xl md:text-5xl lg:text-7xl font-display leading-tight tracking-tight">
                                    {t('commitment_title')} <br />
                                    <span className="italic font-light text-accent/80 underline decoration-white/5 underline-offset-[16px]">
                                        {t('commitment_highlight')}
                                    </span>
                                </h2>
                            </div>

                            <div className="space-y-10">
                                <p className="text-foreground/60 font-light text-2xl leading-relaxed first-letter:text-6xl first-letter:font-display first-letter:text-accent first-letter:float-left first-letter:mr-4 first-letter:mt-2">
                                    {t('desc1')}
                                </p>
                                <div className="p-8 border-l-2 border-brass-gold/20 bg-white/[0.02] backdrop-blur-sm">
                                    <p className="text-foreground/60 font-light text-lg leading-relaxed italic">
                                        {t('desc2')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-6 lg:pl-12 mt-24 lg:mt-0">
                            <div className="relative aspect-[3/4] group">
                                <div className="absolute -top-6 -right-6 w-full h-full border border-white/5 group-hover:-top-2 group-hover:-right-2 transition-all duration-700" />
                                <div className="relative h-full overflow-hidden shadow-2xl">
                                    <Image
                                        src="/images/about-value-passion.jpg"
                                        alt="Sea Experience"
                                        fill
                                        className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[2s]"
                                    />
                                    <div className="absolute inset-0 bg-nautical-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                                </div>
                                {/* Image Badge */}
                                <div className="absolute top-12 left-0 -translate-x-1/2 bg-nautical-deep px-8 py-6 border border-white/5 shadow-2xl rotate-[-90deg]">
                                    <span className="text-sm uppercase tracking-[0.5em] text-accent font-bold">
                                        EST. 1993
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. The Pillars (Values) Section */}
            <section className="py-32 md:py-64 relative bg-black/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                <div className="container mx-auto px-6 relative">
                    <header className="mb-32 text-center max-w-4xl mx-auto space-y-8">
                        <span className="text-accent uppercase tracking-[0.6em] text-sm font-bold">Nuestra Esencia</span>
                        <h2 className="text-4xl md:text-6xl lg:text-8xl font-display">{t('define_title')}</h2>
                        <div className="w-32 h-px bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
                    </header>

                    <div className="grid md:grid-cols-3 gap-0 border border-white/5">
                        {[
                            {
                                title: t('values.v1_title'),
                                desc: t('values.v1_desc'),
                                icon: "⚓",
                                bg: "/images/about-value-experience.jpg"
                            },
                            {
                                title: t('values.v2_title'),
                                desc: t('values.v2_desc'),
                                icon: "⛵",
                                bg: "/images/home-hero-sailing-action.jpg"
                            },
                            {
                                title: t('values.v3_title'),
                                desc: t('values.v3_desc'),
                                icon: "🌊",
                                bg: "/images/about-value-community.jpg"
                            }
                        ].map((item, i) => (
                            <div key={i} className="group relative h-[600px] p-20 flex flex-col justify-end overflow-hidden border-r last:border-r-0 border-white/5">
                                {/* Hover background image */}
                                <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 opacity-0 group-hover:opacity-40 transition-all duration-[1.5s]">
                                    <Image src={item.bg as string} alt={item.title as string} fill className="object-cover grayscale" />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/80 to-transparent z-1" />

                                <div className="relative z-10 transition-transform duration-700 group-hover:-translate-y-8">
                                    <span className="text-5xl mb-12 block opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 origin-left grayscale group-hover:grayscale-0">
                                        {item.icon}
                                    </span>
                                    <h3 className="text-3xl font-display text-white mb-8 group-hover:text-accent transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-foreground/40 font-light text-sm leading-relaxed max-w-xs group-hover:text-foreground/80 transition-colors">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Panoramic CTA Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/home-cta-join.jpg"
                        alt="Join us"
                        fill
                        className="object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-8xl lg:text-[12rem] font-display mb-16 italic lowercase leading-none opacity-20 hover:opacity-100 transition-opacity duration-1000 cursor-default select-none">
                        {t('cta_title')}
                    </h2>
                    <div className="space-y-16">
                        <p className="text-foreground/60 font-light max-w-xl mx-auto text-2xl leading-relaxed tracking-wide">
                            {t('cta_desc')}
                        </p>
                        <Link
                            href={`/${locale}/courses`}
                            className="group relative inline-flex items-center gap-8 px-16 py-8 border border-white/20 hover:border-accent transition-all duration-700 overflow-hidden"
                        >
                            <div className="absolute inset-0 w-0 bg-accent group-hover:w-full transition-all duration-700 ease-out z-0" />
                            <span className="relative z-10 text-white group-hover:text-nautical-black text-[10px] uppercase tracking-[0.5em] font-black transition-colors duration-700">
                                {t('cta_button')}
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
}
