'use client';

import Link from 'next/link';
import NauticalImage from '@/components/ui/NauticalImage';
import { useTranslations } from 'next-intl';

interface CourseCardProps {
    course: {
        slug: string;
        nombre_es: string;
        nombre_eu: string;
        descripcion_es: string;
        descripcion_eu: string;
        precio: number;
        duracion_h: number;
        nivel: string;
        imagen_url: string;
    };
    locale: string;
}

export default function CourseCard({ course, locale }: CourseCardProps) {
    const t = useTranslations('courses');
    const name = (locale === 'es' ? course.nombre_es : course.nombre_eu) || course.nombre_es || 'Curso sin nombre';
    const description = (locale === 'es' ? course.descripcion_es : course.descripcion_eu) || course.descripcion_es || '';

    return (
        <div className="group relative glass-card overflow-hidden">
            {/* Top Border Reveal Accent */}
            <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-700 z-20" />

            {/* Image Container with Cinematic Zoom */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <NauticalImage
                    src={course.imagen_url}
                    category="veleros"
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                />
                {/* Overlays */}
                <div className="absolute inset-0 premium-gradient-overlay z-10" />

                {/* Level Badge - Premium Minimalist */}
                <div className="absolute top-8 left-8 p-0 z-20">
                    <div className="flex items-center gap-4 animate-fade-in group-hover:translate-x-2 transition-transform duration-700">
                        <div className="w-10 h-px bg-accent flex-shrink-0" />
                        <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-black whitespace-nowrap pr-4">
                            {t(`levels.${course.nivel}`)}
                        </span>
                    </div>
                </div>

                {/* Vertical Text Accent */}
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity duration-1000 rotate-90 origin-right pointer-events-none">
                    <span className="text-[10px] uppercase tracking-[0.5em] text-white/50 whitespace-nowrap font-light group-hover:text-accent group-hover:font-medium transition-all">
                        {course.duracion_h} HOURS TRAINING
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 md:p-10 relative z-10 space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-baseline border-b border-white/10 pb-4 gap-2">
                        <span className="text-technical">
                            Premium Academy
                        </span>
                        <span className="text-2xl font-display text-white italic flex-shrink-0">
                            {course.precio}<span className="text-brass-gold text-lg ml-1">€</span>
                        </span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl font-display text-white italic group-hover:text-accent transition-colors duration-500 leading-tight pt-2">
                        {name}
                    </h3>
                </div>

                <p className="text-white/40 font-light text-sm leading-relaxed min-h-[4rem] group-hover:text-white/70 transition-colors duration-500 line-clamp-3">
                    {description}
                </p>

                <Link
                    href={`/${locale}/courses/${course.slug}`}
                    className="group/link w-full inline-flex items-center justify-between py-6 px-0 border-t border-white/10 hover:border-accent transition-all duration-700"
                >
                    <span className="text-[10px] uppercase tracking-[0.5em] font-black text-white group-hover/link:text-accent transition-colors">
                        {t('view_more')}
                    </span>
                    <span className="text-xl translate-x-0 group-hover/link:translate-x-4 transition-transform duration-700 opacity-0 group-hover/link:opacity-100 italic font-light text-accent">→</span>
                </Link>
            </div>

            {/* Background Texture Decor */}
            <div className="absolute inset-0 bg-mesh opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none" />
        </div>
    );
}
