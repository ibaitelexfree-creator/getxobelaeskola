'use client';

import Link from 'next/link';
import NauticalImage from '@/components/ui/NauticalImage';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

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
    const tData = useTranslations('courses_data');

    const hasTranslation = tData.has(`${course.slug}.name`);
    const name = hasTranslation
        ? tData(`${course.slug}.name`)
        : (locale === 'es' ? course.nombre_es : (locale === 'eu' ? course.nombre_eu : course.nombre_es)) || course.nombre_es || 'Curso sin nombre';

    const description = hasTranslation
        ? tData(`${course.slug}.description`)
        : (locale === 'es' ? course.descripcion_es : (locale === 'eu' ? course.descripcion_eu : course.descripcion_es)) || course.descripcion_es || '';

    return (
        <motion.div 
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative glass-card overflow-hidden cursor-pointer flex flex-col w-full aspect-square justify-between"
            style={{
                aspectRatio: '1 / 1'
            }}
        >
            {/* Top Border Reveal Accent */}
            <div className="absolute top-0 left-0 w-1 h-0 bg-accent group-hover:h-full transition-all duration-700 z-20" />

            <div className="h-full flex flex-col justify-between w-full">
                {/* Image Container with Cinematic Zoom - Relative to Card height/width */}
                <div className="relative w-full h-[40%] overflow-hidden course-card-img-container flex-shrink-0">
                    <NauticalImage
                        src={course.imagen_url}
                        category="veleros"
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover w-full h-full inset-0 transition-transform duration-[2s] ease-out group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                    />
                    {/* Overlays */}
                    <div className="absolute inset-0 premium-gradient-overlay z-10" />

                    {/* Level Badge - Premium Minimalist */}
                    <div className="absolute top-1 left-1 sm:top-3 sm:left-3 p-0 z-20">
                        <div className="flex items-center gap-1 sm:gap-2 animate-fade-in group-hover:translate-x-1.5 transition-transform duration-700">
                            <div className="w-2 sm:w-5 h-px bg-accent flex-shrink-0" />
                            <span className="text-[8px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] text-accent font-black whitespace-nowrap pr-1">
                                {t(`levels.${course.nivel}`)}
                            </span>
                        </div>
                    </div>

                    {/* Vertical Text Accent */}
                    <div className="hidden sm:block absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity duration-1000 rotate-90 origin-right pointer-events-none">
                        <span className="text-[9px] sm:text-xs uppercase tracking-[0.25em] text-sea-foam/50 whitespace-nowrap font-light group-hover:text-accent group-hover:font-medium transition-all">
                            {course.duracion_h} HOURS
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-1.5 sm:p-4 lg:p-6 relative z-10 flex flex-col justify-between flex-grow overflow-hidden h-[60%]">
                    <div className="space-y-0.5">
                        <div className="flex justify-between items-baseline border-b border-sea-foam/10 pb-0.5 gap-1">
                            <span className="text-[7.5px] sm:text-xs text-technical truncate">
                                Premium Academy
                            </span>
                            <span className="text-[10px] sm:text-lg lg:text-2xl font-display text-sea-foam italic flex-shrink-0">
                                {course.precio}<span className="text-brass-gold text-[8px] sm:text-sm ml-0.5">€</span>
                            </span>
                        </div>

                        <h3 className="text-[9.5px] sm:text-base lg:text-xl font-display text-sea-foam italic group-hover:text-accent transition-colors duration-500 leading-tight pt-0.5 line-clamp-1 sm:line-clamp-2">
                            {name}
                        </h3>
                    </div>

                    <p className="text-sea-foam/60 font-light text-[8.5px] sm:text-xs lg:text-sm leading-tight sm:leading-relaxed group-hover:text-sea-foam/80 transition-colors duration-500 line-clamp-2 my-auto">
                        {description}
                    </p>

                    <div className="pt-0.5 relative z-10">
                        <Link
                            href={`/${locale}/servicios/cursos/${course.slug}`}
                            className="group/link w-full inline-flex items-center justify-between py-0.5 px-0 border-t border-sea-foam/10 hover:border-accent transition-all duration-700"
                        >
                            <span className="text-[8px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] font-black text-sea-foam group-hover/link:text-accent transition-colors">
                                {t('view_more')}
                            </span>
                            <span className="text-[10px] sm:text-lg translate-x-0 group-hover/link:translate-x-2 transition-transform duration-700 opacity-0 group-hover/link:opacity-100 italic font-light text-accent">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Background Texture Decor */}
            <div className="absolute inset-0 bg-mesh opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none" />
        </motion.div>
    );
}
