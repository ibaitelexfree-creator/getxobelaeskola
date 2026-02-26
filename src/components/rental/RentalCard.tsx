'use client';

import Link from 'next/link';
import NauticalImage from '@/components/ui/NauticalImage';
import { useTranslations } from 'next-intl';
import { Anchor, Users, Clock, ArrowRight } from 'lucide-react';

interface RentalCardProps {
    service: {
        id: string;
        nombre_es: string;
        nombre_eu: string;
        categoria: string;
        slug: string;
        precio_base: number;
        opciones: { label: string; extra: number }[];
        imagen_url: string;
    };
    locale: string;
    onBook: (serviceId: string, optionIndex?: number) => void;
}

export default function RentalCard({ service, locale, onBook }: RentalCardProps) {
    const t = useTranslations('rental_page');
    const name = (locale === 'es' ? service.nombre_es : service.nombre_eu) || service.nombre_es;

    // Determine image source with fallbacks
    const getImgSrc = () => {
        const n = service.nombre_es.toLowerCase();
        let src = service.imagen_url;

        if (n.includes('j80')) src = '/images/J80.webp';
        else if (n.includes('raquero')) src = '/images/course-raquero-students.webp';
        else if (n.includes('optimist') || n.includes('laser')) src = '/images/courses/CursodeVelaLigera.webp';

        if (!src || src.includes('placeholder') || src.includes('rental-category')) {
            if (service.categoria === 'windsurf') src = '/images/courses/PerfeccionamientoVela.webp';
            else if (service.categoria === 'paddlesurf' || service.categoria === 'kayak' || service.categoria === 'piragua') src = '/images/home-hero-sailing-action.webp';
            else src = '/images/J80.webp';
        }
        return src;
    };

<<<<<<< HEAD
    // Determine capacity based on service type
    const getCapacity = () => {
        const s = service.slug.toLowerCase();
        if (s.includes('j80')) return '6';
        if (s.includes('raquero')) return '8';
        if (s.includes('kayak-2') || s.includes('piragua-2')) return '2';
        if (s.includes('kayak-1') || s.includes('piragua-1') || s.includes('optimist') || s.includes('laser')) return '1';
        return '1-4';
    };

=======
>>>>>>> pr-286
    return (
        <div className="group relative glass-card overflow-hidden h-full flex flex-col">
            {/* Design Decor - Nautical Numbers */}
            <div className="absolute top-4 right-6 text-[120px] font-black text-white/[0.03] select-none pointer-events-none group-hover:text-accent/[0.05] transition-colors duration-1000 leading-none">
                {service.categoria.substring(0, 2).toUpperCase()}
            </div>

            {/* Image Header with Clip Path */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <NauticalImage
                    src={getImgSrc()}
                    category={service.categoria as any}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-105 contrast-[1.1]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-nautical-deep via-transparent to-transparent z-10" />

                {/* Float Category Label */}
                <div className="absolute bottom-6 left-8 z-20 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/50 group-hover:text-white transition-colors">
                        {service.categoria}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-10 flex flex-col flex-1 relative z-20">
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-3xl font-display text-white italic leading-tight group-hover:text-accent transition-colors duration-500">
                            {name}
                        </h3>
                    </div>

                    {/* Specs Row */}
                    <div className="flex gap-6 py-4 border-y border-white/5 mb-6">
                        <div className="flex flex-col gap-1">
<<<<<<< HEAD
                            <span className="text-[8px] uppercase tracking-widest text-white/30">{t('crew_label')}</span>
                            <div className="flex items-center gap-1.5 text-white/60">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold font-mono">{getCapacity()}</span>
=======
                            <span className="text-[8px] uppercase tracking-widest text-white/30">Crew</span>
                            <div className="flex items-center gap-1.5 text-white/60">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold font-mono">1-4</span>
>>>>>>> pr-286
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] uppercase tracking-widest text-white/30">Service</span>
                            <div className="flex items-center gap-1.5 text-white/60">
                                <Anchor className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold font-mono">PRO</span>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col gap-1">
                            <span className="text-[8px] uppercase tracking-widest text-white/30">Price/h</span>
                            <div className="flex items-center gap-1.5 text-white/60 text-lg">
                                <span className="font-display italic text-white">{service.precio_base}€</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-4">
                    <button
                        onClick={() => onBook(service.id)}
                        className="group/btn relative w-full overflow-hidden bg-white/5 border border-white/10 p-5 rounded-sm hover:border-accent transition-all duration-500 flex items-center justify-between"
                    >
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/50 group-hover/btn:text-accent group-hover/btn:translate-x-2 transition-all">
                            {t('booking.book_now')}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover/btn:text-accent group-hover/btn:-translate-x-2 transition-all" />

                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 bg-mesh opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none" />
        </div>
    );
}
