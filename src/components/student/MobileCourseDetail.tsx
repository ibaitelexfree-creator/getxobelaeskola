'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, User, Clock, Check } from 'lucide-react';
import BookingSelector from '@/components/booking/BookingSelector';

interface Course {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    imagen_url: string;
    precio: number;
    duracion_h: number;
    nivel: string;
    detalles?: {
        es: string[];
        eu: string[];
    };
}

export default function MobileCourseDetail({
    course,
    editions,
    locale
}: {
    course: Course;
    editions: any[];
    locale: string
}) {
    const router = useRouter();
    const name = locale === 'es' ? course.nombre_es : course.nombre_eu;
    const description = locale === 'es' ? course.descripcion_es : course.descripcion_eu;
    const details = course.detalles ? (locale === 'es' ? course.detalles.es : course.detalles.eu) : [];

    return (
        <div className="pb-24 bg-nautical-black min-h-screen">
            {/* Header Image */}
            <div className="relative h-72 w-full">
                {course.imagen_url ? (
                    <Image
                        src={course.imagen_url}
                        alt={name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-nautical-black flex items-center justify-center text-4xl">⚓</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-nautical-black/20 to-transparent" />

                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 w-10 h-10 rounded-full bg-black/20 backdrop-blur border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="px-6 -mt-12 relative z-10">
                <span className="bg-accent text-nautical-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded mb-4 inline-block">
                    {course.nivel}
                </span>
                <h1 className="text-3xl font-display text-white mb-4 leading-tight">{name}</h1>
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-sm text-white/60">{course.duracion_h}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-accent" />
                        <span className="text-sm text-white/60">Grupos reducidos</span>
                    </div>
                </div>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">Descripción</h2>
                        <p className="text-white/80 font-light leading-relaxed">{description}</p>
                    </section>

                    {details.length > 0 && (
                        <section>
                            <h2 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">Aprenderás</h2>
                            <ul className="space-y-3">
                                {details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-4 h-4 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                            <Check className="w-2 h-2 text-accent" />
                                        </div>
                                        <span className="text-sm text-white/80 font-light">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-display text-white mb-6">Próximas Fechas</h2>
                        <BookingSelector
                            editions={editions}
                            coursePrice={course.precio}
                            courseId={course.id}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
