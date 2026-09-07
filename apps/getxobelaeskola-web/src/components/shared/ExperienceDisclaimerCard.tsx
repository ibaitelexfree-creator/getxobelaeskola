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
            title: 'Seguridad Meteorológica',
            desc: isEu ? 'Eguraldiaren segurtasuna bermatua' : isEn ? 'Weather safety guaranteed' : isFr ? 'Garantie de sécurité météo' : 'รับประกันความปลอดภัยด้านสภาพอากาศ',
        },
        {
            icon: <CalendarCheck className="w-5 h-5 text-teal-400 shrink-0" />,
            title: 'Reserva Garantizada',
            desc: isEu ? 'Zure lekuaren aurretiko erreserba' : isEn ? 'Advance seat reservation priority' : isFr ? 'Priorité de réservation à l\'avance' : 'สิทธิ์การจองที่นั่งล่วงหน้า',
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />,
            title: 'Garantía Getxo Bela',
            desc: isEu ? 'Eskolako arau eta kalitate bermea' : isEn ? 'School official quality standard guarantee' : isFr ? 'Garantie de qualité officielle de l\'école' : 'การันตีมาตรฐานจากโรงเรียน',
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
            className="relative group p-6 sm:p-10 md:p-12 border border-sea-foam/15 bg-gradient-to-br from-nautical-dark/90 via-nautical-black/95 to-sea-foam/[0.03] backdrop-blur-xl overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-700 hover:border-accent/40 hover:shadow-accent/10"
        >
            {/* Background Animated Compass Watermark */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none">
                <Compass className="w-full h-full text-sea-foam animate-spin-slow" />
            </div>

            {/* Left Accent Indicator Bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-accent via-teal-400/60 to-transparent group-hover:h-full transition-all duration-700" />

            <div className="relative z-10 flex flex-col gap-6 lg:gap-8">
                {/* Header Title */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] font-black text-accent bg-accent/10 px-3.5 py-1.5 rounded-full border border-accent/25 shadow-inner">
                        🛡️ {titleLabel}
                    </span>
                </div>

                {/* 3 Glassmorphic Feature Badges Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                    {badges.map((b, i) => (
                        <div
                            key={i}
                            className="flex flex-col gap-1.5 p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white/[0.07] hover:border-accent/40 hover:scale-[1.02] shadow-lg group/badge"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-nautical-deep/80 border border-white/10 group-hover/badge:border-accent/30 transition-colors">
                                    {b.icon}
                                </div>
                                <span className="text-xs sm:text-sm font-bold text-sea-foam tracking-wide">
                                    {b.title}
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-sea-foam/70 font-light leading-relaxed pl-0.5">
                                {b.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Bottom Disclaimer Note & CTA Button */}
                <div className="grid lg:grid-cols-12 gap-6 items-center pt-2 border-t border-sea-foam/10">
                    <div className="lg:col-span-8 space-y-2">
                        <p className="text-sea-foam/85 font-light italic text-xs sm:text-sm md:text-base leading-relaxed">
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
