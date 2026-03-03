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
        if (locale === 'eu') return experience.descripcion_eu || experience.descripcion;
        if (locale === 'en') return experience.descripcion_en || experience.descripcion;
        return experience.descripcion;
    };

    return (
        <div className="group relative bg-nautical-black/20 border border-white/5 overflow-hidden transition-all duration-700 hover:border-brass-gold/30 flex flex-col h-full rounded-2xl">
            {/* Top Badge Decor */}
            <div className="absolute top-6 left-6 z-30">
                <div className="flex items-center gap-2 px-4 py-2 bg-nautical-deep/80 backdrop-blur-md rounded-full border border-white/10">
                    <Star className="w-3 h-3 text-brass-gold fill-brass-gold" />
                    <span className="text-[8px] uppercase tracking-[0.3em] font-black text-white/80">{t('premium_experience')}</span>
                </div>
            </div>

            {/* Image Section - More cinematic Ratio */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <NauticalImage
                    src={experience.imagen_url || '/images/home-hero-sailing-action.webp'}
                    alt={getName()}
                    fill
                    className="object-cover transition-transform duration-[3s] group-hover:scale-110 saturate-[0.8] group-hover:saturate-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/20 to-transparent" />

                {/* Price Tag */}
                <div className="absolute bottom-6 right-8 text-right z-20">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-white/40 block mb-1">{t('from')}</span>
                    <span className="text-4xl font-display text-white italic drop-shadow-lg">
                        {experience.precio}<span className="text-xl text-brass-gold ml-1">€</span>
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-10 flex flex-col flex-1 relative bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="flex flex-col h-full">
                    {/* Category */}
                    <span className="text-[10px] uppercase tracking-[0.5em] text-brass-gold font-black mb-4 inline-block">
                        {t(experience.categoria)}
                    </span>

                    <h3 className="text-3xl font-display text-white mb-6 leading-tight group-hover:text-brass-gold transition-colors duration-500 italic">
                        {getName()}
                    </h3>

                    <p className="text-white/40 text-sm leading-relaxed font-light line-clamp-3 mb-8 group-hover:text-white/60 transition-colors">
                        {getDescription()}
                    </p>

                    {/* Info Row */}
                    <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-6">
                            {experience.duracion && (
                                <div className="flex items-center gap-2 text-white/30">
                                    <Clock className="w-4 h-4 text-accent" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">{experience.duracion}</span>
                                </div>
                            )}
                            {experience.min_participantes && (
                                <div className="flex items-center gap-2 text-white/30">
                                    <Users className="w-4 h-4 text-accent" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">{experience.min_participantes}+ PAX</span>
                                </div>
                            )}
                        </div>

                        <Link
                            href={`/${locale}/contact`}
                            className="bg-white/5 hover:bg-white text-white hover:text-nautical-black p-4 rounded-full transition-all duration-500 group/btn"
                        >
                            <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background Texture Decor */}
            <div className="absolute inset-0 bg-mesh opacity-[0.03] pointer-events-none" />
        </div>
    );
}
