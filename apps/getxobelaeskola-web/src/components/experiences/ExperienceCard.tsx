'use client';

import Link from 'next/link';
import NauticalImage from '@/components/ui/NauticalImage';
import { useTranslations } from 'next-intl';
import { Compass, Users, Clock, ArrowRight, Star } from 'lucide-react';

interface ExperienceCardProps {
    experience: {
        id: string;
        nombre: string;
        nombre_eu?: string;
        nombre_en?: string;
        slug: string;
        descripcion?: string;
        descripcion_eu?: string;
        descripcion_en?: string;
        categoria: string;
        precio: number;
        imagen_url?: string;
        duracion?: string;
        min_participantes?: number;
    };
    locale: string;
}

export default function ExperienceCard({ experience, locale }: ExperienceCardProps) {
    const t = useTranslations('experiences_page');

    const getName = () => {
        if (locale === 'eu') return experience.nombre_eu || experience.nombre;
        if (locale === 'en') return experience.nombre_en || experience.nombre;
        return experience.nombre;
    };

    const getDescription = () => {
        // Custom description for Sailboat Mooring
        if (experience.nombre && experience.nombre.toLowerCase().includes('sailboat mooring')) {
            return 'Monthly mooring spot for sailboat. Registration: €50.';
        }
        if (locale === 'eu') return experience.descripcion_eu || experience.descripcion;
        if (locale === 'en') return experience.descripcion_en || experience.descripcion;
        return experience.descripcion;
    };

    return (
        <div className="group relative bg-sea-foam/[0.02] border border-sea-foam/10 overflow-hidden transition-all duration-700 hover:border-accent/30 hover:bg-sea-foam/[0.04] flex flex-col h-full rounded-2xl w-full max-w-full">
            {/* Top-Left Premium Badge Decor */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30">
                <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-nautical-deep/80 backdrop-blur-md rounded-full border border-sea-foam/10">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brass-gold fill-brass-gold shrink-0" />
                    <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.15em] sm:tracking-[0.3em] font-black text-sea-foam/80 whitespace-nowrap">{t('premium_experience')}</span>
                </div>
            </div>

            {/* Top-Right Duration Badge (e.g. 4h) */}
            {experience.duracion && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-nautical-deep/90 backdrop-blur-md rounded-full border border-accent/40 shadow-lg">
                        <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-black text-sea-foam whitespace-nowrap">{experience.duracion}</span>
                    </div>
                </div>
            )}

            {/* Image Section */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <NauticalImage
                    src={
                        (
                            experience.slug === 'navigation-voucher' ||
                            experience.slug === 'bono-navegacion' ||
                            experience.imagen_url?.includes('navigation-voucher') ||
                            (experience.nombre && (experience.nombre.toLowerCase().includes('navigation voucher') || experience.nombre.toLowerCase().includes('bono navegación') || experience.nombre.toLowerCase().includes('bono navegacion')))
                        )
                            ? '/images/experiences/navigation-voucher.jpg'
                            : (
                                experience.slug === 'light-sailing-voucher' ||
                                experience.slug === 'bono-vela-ligera' ||
                                (experience.nombre && experience.nombre.toLowerCase().includes('light sailing voucher'))
                            )
                            ? '/images/experiences/light-sailing-voucher.jpg'
                            : (
                                experience.slug === 'sailboat-mooring' ||
                                experience.slug === 'sailboat-mooring-service' ||
                                (experience.nombre && experience.nombre.toLowerCase().includes('sailboat mooring'))
                            )
                            ? '/images/experiences/sailboat-mooring.jpg'
                            : experience.imagen_url || '/images/home-hero-sailing-action.webp'
                    }
                    alt={getName()}
                    fill
                    className="object-cover transition-transform duration-[3s] group-hover:scale-110 brightness-[1.03] saturate-[1.25] contrast-[1.08] hue-rotate-[-3deg]"
                    style={
                        (experience.slug === 'cumpleanos-space-rental' || experience.slug === 'birthday-space-rental' || experience.imagen_url?.includes('birthday-space-rental'))
                            ? { objectPosition: '50% 25%' }
                            : (experience.slug === 'cumpleanos-bigsub' || experience.imagen_url?.includes('birthday-bigsub'))
                            ? { objectPosition: '50% 35%' }
                            : (experience.slug === 'atraque-windsurf' || experience.slug === 'windsurf-mooring' || experience.imagen_url?.includes('windsurf-mooring'))
                            ? { objectPosition: '50% 55%' }
                            : (experience.slug === 'bono-vela-ligera' || experience.slug === 'light-sailing-voucher' || experience.imagen_url?.includes('light-sailing-voucher'))
                            ? { objectPosition: '55% 98%' }
                            : undefined
                    }
                />
                {/* Unified Cinematic Deep Ocean Color Grading Overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-blue-900/20 to-teal-400/10 mix-blend-color-dodge pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-blue-950/25 to-transparent pointer-events-none" />

                {/* Price Tag Badge: Compact Warm Dark Brown Background + Vivid Yellow-Gold Text */}
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20">
                    <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#2A160C]/95 via-[#3D2115]/95 to-[#2A160C]/95 backdrop-blur-md rounded-lg border border-amber-400/50 shadow-[0_2px_10px_rgba(0,0,0,0.5)] flex flex-col items-end">
                        <span className="text-[6.5px] sm:text-[8px] uppercase tracking-[0.12em] sm:tracking-[0.2em] text-amber-200/90 font-bold block mb-0.5 leading-none">
                            { (experience.slug === 'sailboat-mooring' || (experience.nombre && experience.nombre.toLowerCase().includes('sailboat mooring')) ) ? 'Registration:' : t('from') }
                        </span>
                        <span className="text-base sm:text-lg md:text-xl font-display text-amber-300 font-extrabold italic leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            {experience.precio}<span className="text-xs sm:text-sm text-amber-400 font-bold ml-0.5">€</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 sm:p-6 md:p-10 flex flex-col flex-1 relative bg-gradient-to-br from-sea-foam/[0.01] to-transparent">
                <div className="flex flex-col h-full">
                    {/* Category */}
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.5em] text-brass-gold font-black mb-2 sm:mb-4 inline-block">
                        {t(experience.categoria)}
                    </span>

                    <h3 className="text-xl sm:text-2xl md:text-3xl font-display text-sea-foam mb-3 sm:mb-6 leading-tight group-hover:text-accent transition-colors duration-500 italic break-words">
                        {getName()}
                    </h3>

                    <p className="text-sea-foam/60 text-xs sm:text-sm leading-relaxed font-light line-clamp-3 mb-4 sm:mb-8 group-hover:text-sea-foam/80 transition-colors">
                        {getDescription()}
                    </p>

                    {/* Info Row */}
                    {experience.min_participantes && (
                        <div className="mt-auto pt-4 sm:pt-6 border-t border-sea-foam/10 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-2 sm:gap-6">
                                <div className="flex items-center gap-1.5 text-sea-foam/50">
                                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold">{experience.min_participantes}+ PAX</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Texture Decor */}
            <div className="absolute inset-0 bg-mesh opacity-[0.03] pointer-events-none" />
        </div>
    );
}
