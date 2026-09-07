'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CloudSun, ShieldCheck, CalendarCheck, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ExperienceDisclaimerCardProps {
    noteText: string;
    locale?: string;
}

export default function ExperienceDisclaimerCard({ noteText, locale = 'es' }: ExperienceDisclaimerCardProps) {
    const isEu = locale === 'eu';
    const isEn = locale === 'en';
    const isFr = locale === 'fr';

    const badges = [
        {
            icon: <CloudSun className="w-4 h-4 text-accent" />,
            label: isEu ? 'Eguraldiaren segurtasuna' : isEn ? 'Weather Safety' : isFr ? 'Sécurité Météo' : 'Seguridad Meteorológica',
        },
        {
            icon: <CalendarCheck className="w-4 h-4 text-accent" />,
            label: isEu ? 'Aurretik erreserbatzea' : isEn ? 'Advance Booking' : isFr ? 'Réservation Anticipée' : 'Reserva Garantizada',
        },
        {
            icon: <ShieldCheck className="w-4 h-4 text-accent" />,
            label: isEu ? 'Bermatu zure lekua' : isEn ? 'Guaranteed Spot' : isFr ? 'Place Garantie' : 'Garantía Getxo Bela',
        },
    ];

    const titleLabel = isEu
        ? 'GURE BERMEA ETA EBALUAZIOA'
        : isEn
        ? 'OUR GUARANTEE & CONDITIONS'
        : isFr
        ? 'NOTRE GARANTIE & CONDITIONS'
        : 'NUESTRA GARANTÍA Y CONDICIONES';

    const ctaLabel = isEu
        ? 'Egiaztatu erabilgarritasuna'
        : isEn
        ? 'Check Availability'
        : isFr
        ? 'Vérifier la disponibilité'
        : 'Ver Disponibilidad';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative group p-6 sm:p-10 md:p-12 border border-sea-foam/15 bg-gradient-to-br from-sea-foam/[0.04] via-nautical-black/80 to-sea-foam/[0.02] backdrop-blur-md overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-700 hover:border-accent/40 hover:shadow-accent/5"
        >
            {/* Background Animated Compass Watermark */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                <Compass className="w-full h-full text-sea-foam animate-spin-slow" />
            </div>

            {/* Left Accent Indicator Bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-accent via-accent/50 to-transparent group-hover:h-full transition-all duration-700" />

            <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
                {/* Top Badges Bar */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-black text-accent/90 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                        {titleLabel}
                    </span>
                    <div className="hidden sm:block h-3 w-px bg-sea-foam/20" />
                    <div className="flex flex-wrap items-center gap-2">
                        {badges.map((b, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sea-foam/5 border border-sea-foam/10 text-[10px] sm:text-xs text-sea-foam/80 font-medium backdrop-blur-sm"
                            >
                                {b.icon}
                                <span>{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-8 space-y-3">
                        <p className="text-sea-foam/90 font-light italic text-sm sm:text-base md:text-lg leading-relaxed">
                            &ldquo;{noteText}&rdquo;
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="lg:col-span-4 lg:justify-self-end pt-2 lg:pt-0">
                        <Link
                            href={`/${locale}/contact`}
                            className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-accent text-white font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group/btn"
                        >
                            <span>{ctaLabel}</span>
                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
