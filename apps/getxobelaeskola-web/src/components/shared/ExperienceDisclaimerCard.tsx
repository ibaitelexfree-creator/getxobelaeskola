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
            icon: <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />,
            title: isEu ? 'Segurtasun Meteorologikoa' : isEn ? 'Weather Safety' : isFr ? 'Sécurité Météorologique' : 'Seguridad Meteorológica',
            desc: isEu ? 'Eguraldiaren segurtasuna bermatua' : isEn ? 'Weather safety guaranteed' : isFr ? 'Garantie de sécurité météo' : 'Seguridad meteorológica garantizada',
        },
        {
            icon: <CalendarCheck className="w-5 h-5 text-teal-400 shrink-0" />,
            title: isEu ? 'Erreserba Bermatua' : isEn ? 'Guaranteed Reservation' : isFr ? 'Réservation Garantie' : 'Reserva Garantizada',
            desc: isEu ? 'Zure lekuaren aurretiko erreserba' : isEn ? 'Advance seat reservation priority' : isFr ? 'Priorité de réservation à l\'avance' : 'Prioridad de reserva de plaza con antelación',
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />,
            title: isEu ? 'Getxo Bela Bermatzea' : isEn ? 'Getxo Bela Guarantee' : isFr ? 'Garantie Getxo Bela' : 'Garantía Getxo Bela',
            desc: isEu ? 'Eskolako arau eta kalitate bermea' : isEn ? 'School official quality standard guarantee' : isFr ? 'Garantie de qualité officielle de l\'école' : 'Garantía de estándares oficiales de la escuela',
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
            className="w-full relative group p-3.5 sm:p-6 md:p-7 border border-sea-foam/15 bg-gradient-to-br from-nautical-dark/90 via-nautical-black/95 to-sea-foam/[0.03] backdrop-blur-xl overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-700 hover:border-accent/40 hover:shadow-accent/10"
        >
            {/* Background Animated Compass Watermark */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                <Compass className="w-full h-full text-sea-foam animate-spin-slow" />
            </div>

            {/* Left Accent Indicator Bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-accent via-teal-400/60 to-transparent group-hover:h-full transition-all duration-700" />

            <div className="relative z-10 flex flex-col gap-3.5 sm:gap-5">
                {/* Header Title */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.3em] font-black text-accent bg-accent/10 px-3 py-1 sm:px-3.5 rounded-full border border-accent/25 shadow-inner leading-normal break-words inline-block max-w-full">
                        🛡️ {titleLabel}
                    </span>
                </div>

                {/* Glassmorphic Feature Badges Grid - Always 3 equal 1:1 square cards on all screen sizes */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:gap-4">
                    {badges.map((b, i) => (
                        <div
                            key={i}
                            className="aspect-square flex flex-col justify-between p-2.5 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white/[0.07] hover:border-accent/40 hover:scale-[1.01] shadow-lg group/badge min-w-0 overflow-hidden"
                        >
                            <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0">
                                <div className="p-1 sm:p-1.5 rounded-lg bg-nautical-deep/80 border border-white/10 group-hover/badge:border-accent/30 transition-colors shrink-0 w-fit">
                                    {b.icon}
                                </div>
                                <span 
                                    className="font-bold text-sea-foam tracking-tight sm:tracking-wide break-words min-w-0 leading-tight"
                                    style={{ fontSize: 'clamp(0.625rem, 0.55rem + 0.35vw, 0.875rem)' }}
                                >
                                    {b.title}
                                </span>
                            </div>
                            <p 
                                className="text-sea-foam/70 font-light leading-snug break-words mt-auto"
                                style={{ fontSize: 'clamp(0.5625rem, 0.5rem + 0.25vw, 0.75rem)' }}
                            >
                                {b.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom Disclaimer Note & CTA Button - Compact height */}
                <div className="grid lg:grid-cols-12 gap-4 items-center pt-2 border-t border-sea-foam/10">
                    <div className="lg:col-span-8 space-y-1">
                        <p className="text-sea-foam/85 font-light italic text-xs sm:text-sm md:text-base leading-snug">
                            &ldquo;{noteText}&rdquo;
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="lg:col-span-4 lg:justify-self-end pt-1 lg:pt-0">
                        <Link
                            href={`/${locale}/contact`}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs uppercase tracking-[0.18em] shadow-lg shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group/btn"
                        >
                            <span>{ctaLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
