import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function StatsSection() {
    const t = useTranslations('home.stats');
    const stats = [
        { label: t('pasion'), value: '30+' },
        { label: t('alumnos'), value: '5K+' },
        { label: t('flota'), value: '12' },
        { label: t('clases'), value: '100%' }
    ];
    return (
        <section className="relative py-32 bg-nautical-black overflow-hidden group">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/home-hero-sailing-action.jpg"
                    alt="Ocean"
                    fill
                    sizes="100vw"
                    loading="lazy"
                    className="object-cover opacity-20 group-hover:scale-110 transition-transform duration-[15s]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-nautical-black via-transparent to-nautical-black" />
            </div>

            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -skew-x-12 translate-x-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center group">
                            <h2 className="text-5xl lg:text-7xl font-display text-white mb-4 group-hover:text-accent transition-colors duration-500">
                                {stat.value}
                            </h2>
                            <div className="w-8 h-px bg-brass-gold mx-auto mb-4 group-hover:w-16 transition-all duration-500" />
                            <p className="text-3xs uppercase tracking-[0.3em] font-bold text-foreground/40 text-accent/80">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
