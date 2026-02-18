import React from 'react';
import Image from 'next/image';

interface StatsSectionProps {
    pasionLabel: string;
    alumnosLabel: string;
    flotaLabel: string;
    clasesLabel: string;
}

export default function StatsSection({ pasionLabel, alumnosLabel, flotaLabel, clasesLabel }: StatsSectionProps) {
    const stats = [
        { label: pasionLabel, value: '30+' },
        { label: alumnosLabel, value: '5K+' },
        { label: flotaLabel, value: '12' },
        { label: clasesLabel, value: '100%' }
    ];
    return (
        <section className="relative py-32 bg-nautical-black overflow-hidden group">
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/home-hero-sailing-action.webp"
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
                            <div className="w-12 h-px bg-brass-gold mx-auto mb-4 group-hover:scale-x-150 transition-transform duration-500 origin-center" />
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
