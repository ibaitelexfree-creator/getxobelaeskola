'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Calendar, ChevronRight } from 'lucide-react';
import { getApiUrl } from '@/lib/platform';

interface Course {
    id: string;
    slug: string;
    nombre_es: string;
    nombre_eu: string;
    descripcion_es: string;
    descripcion_eu: string;
    imagen_url: string;
    precio: number;
    categoria?: { nombre_es: string; nombre_eu: string };
}

export default function MobileCourseList({ locale }: { locale: string }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch(getApiUrl('/api/courses'));
                const json = await res.json();
                if (json.cursos) {
                    setCourses(json.cursos);
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(c => {
        const name = locale === 'es' ? c.nombre_es : c.nombre_eu;
        return name.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex justify-center pt-20">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-24 space-y-6">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-nautical-black/80 backdrop-blur-xl p-6 border-b border-white/5">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder={locale === 'es' ? 'Buscar cursos...' : 'Ikastaroak bilatu...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-accent transition-colors"
                    />
                </div>
            </div>

            {/* Course List */}
            <div className="px-6 grid gap-4">
                {filteredCourses.map((course) => {
                    const name = locale === 'es' ? course.nombre_es : course.nombre_eu;
                    const desc = locale === 'es' ? course.descripcion_es : course.descripcion_eu;
                    const category = course.categoria ? (locale === 'es' ? course.categoria.nombre_es : course.categoria.nombre_eu) : 'Curso';

                    return (
                        <Link
                            key={course.id}
                            href={`/${locale}/student/courses/${course.slug}`}
                            className="bg-nautical-black border border-white/10 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform"
                        >
                            <div className="relative h-40 bg-white/5">
                                {course.imagen_url ? (
                                    <img
                                        src={course.imagen_url}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">⛵</div>
                                )}
                                <div className="absolute top-4 left-4 bg-nautical-black/80 backdrop-blur px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest text-accent">
                                    {category}
                                </div>
                            </div>

                            <div className="p-5">
                                <h3 className="text-lg font-display text-white mb-2">{name}</h3>
                                <p className="text-white/40 text-sm line-clamp-2 mb-4">{desc}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xl font-bold text-accent">{course.precio}€</span>
                                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
