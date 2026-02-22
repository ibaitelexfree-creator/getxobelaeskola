'use client';

import React, { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/platform';
import { Play, Clock } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import the player to avoid SSR issues and load only when needed
const MicroLeccionesPlayer = dynamic(() => import('./MicroLeccionesPlayer'), {
    ssr: false,
    loading: () => null
});

export interface MicroLeccion {
    id: string;
    titulo_es: string;
    titulo_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    video_url: string;
    thumbnail_url: string;
    duracion_segundos: number;
    categoria: string;
}

export default function MicroLeccionesWidget({ locale, translations, preloadedLessons }: { locale: string, translations: any, preloadedLessons?: MicroLeccion[] }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const [lessons, setLessons] = useState<MicroLeccion[]>(preloadedLessons || []);
    const [loading, setLoading] = useState(!preloadedLessons);
    const [selectedLessonIndex, setSelectedLessonIndex] = useState<number | null>(null);

    useEffect(() => {
        if (preloadedLessons) return;

        async function fetchLessons() {
            try {
                const res = await fetch(getApiUrl('/api/student/micro-lecciones'));
                const data = await res.json();
                if (Array.isArray(data)) {
                    setLessons(data);
                }
            } catch (error) {
                console.error('Error fetching micro-lessons:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLessons();
    }, [preloadedLessons]);

    if (loading) return <div className="animate-pulse h-40 bg-white/5 rounded-sm mb-12" />;
    if (lessons.length === 0) return null;

    return (
        <section className="mb-12">
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-xs uppercase tracking-widest text-accent font-bold">
                    {translations.title || 'Micro-Lecciones'}
                </h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {lessons.map((lesson, index) => (
                    <div
                        key={lesson.id}
                        onClick={() => setSelectedLessonIndex(index)}
                        className="flex-shrink-0 w-32 md:w-40 aspect-[9/16] relative group cursor-pointer rounded-sm overflow-hidden border border-white/5 hover:border-accent/50 transition-all snap-start bg-nautical-black"
                    >
                        {/* Thumbnail */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={lesson.thumbnail_url || '/images/placeholder-vertical.jpg'}
                            alt={locale === 'es' ? lesson.titulo_es : lesson.titulo_eu}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-10 h-10 bg-accent/90 rounded-full flex items-center justify-center text-nautical-black shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
                                <Play size={16} fill="currentColor" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="flex items-center gap-1 text-[9px] text-accent font-bold uppercase tracking-wider mb-1">
                                <Clock size={10} />
                                {Math.floor(lesson.duracion_segundos / 60)}:{(lesson.duracion_segundos % 60).toString().padStart(2, '0')}
                            </div>
                            <h3 className="text-xs font-bold text-white leading-tight line-clamp-2">
                                {locale === 'es' ? lesson.titulo_es : lesson.titulo_eu}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>

            {selectedLessonIndex !== null && (
                <MicroLeccionesPlayer
                    lessons={lessons}
                    initialIndex={selectedLessonIndex}
                    onClose={() => setSelectedLessonIndex(null)}
                    locale={locale}
                />
            )}
        </section>
    );
}
