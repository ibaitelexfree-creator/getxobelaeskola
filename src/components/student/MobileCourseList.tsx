'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, X, BookOpen } from 'lucide-react';
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

const FALLBACK_COURSES: Course[] = [
    {
        id: 'f1',
        slug: 'iniciacion-j80',
        nombre_es: 'Iniciación J80',
        nombre_eu: 'J80 Hastapena',
        descripcion_es: 'Iníciate en la navegación a vela en veleros J80. Cursos de 20 horas.',
        descripcion_eu: 'Hasi nabigazioan J80 belaontzietan. 20 orduko ikastaroak.',
        precio: 150,
        imagen_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5997?q=80&w=2074'
    },
    {
        id: 'f2',
        slug: 'licencia-navegacion',
        nombre_es: 'Licencia de Navegación',
        nombre_eu: 'Nabigazio Lizentzia',
        descripcion_es: 'Obtén tu titulación oficial en un solo día, sin examen.',
        descripcion_eu: 'Lortu zure titulu ofiziala egun bakar batean, azterketarik gabe.',
        precio: 149,
        imagen_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094'
    }
];

export default function MobileCourseList({ locale }: { locale: string }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch(getApiUrl('/api/courses'));
                const json = await res.json();
                if (json.cursos && json.cursos.length > 0) {
                    setCourses(json.cursos);
                } else {
                    // If DB is empty, use fallbacks so user sees something
                    setCourses(FALLBACK_COURSES);
                }
            } catch (err) {
                console.error('Error fetching courses:', err);
                setCourses(FALLBACK_COURSES);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(c => {
        const name = (locale === 'es' ? c.nombre_es : c.nombre_eu) || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center pt-32 space-y-4">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-sm font-medium animate-pulse">
                    {locale === 'es' ? 'Cargando cursos...' : 'Ikastaroak kargatzen...'}
                </p>
            </div>
        );
    }

    return (
        <div className="pb-32 bg-nautical-black min-h-screen">
            {/* Header with Toggleable Search */}
            <div className="sticky top-0 z-30 bg-nautical-black/80 backdrop-blur-2xl border-b border-white/10">
                <div className="h-20 px-6 flex items-center justify-between">
                    {!isSearchOpen ? (
                        <>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-display italic text-white leading-none">
                                    {locale === 'es' ? 'Cursos' : 'Ikastaroak'}
                                </h1>
                                <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-black mt-1">
                                    {courses.length} {locale === 'es' ? 'Disponibles' : 'Eskuragarri'}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white active:scale-90 transition-transform"
                                aria-label="Search"
                            >
                                <Search className="w-6 h-6" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center w-full gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder={locale === 'es' ? 'Buscar...' : 'Bilatu...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full h-12 bg-white/5 border border-accent/30 rounded-xl pl-12 pr-4 text-white placeholder:text-white/20 outline-none focus:border-accent transition-all ring-0"
                                />
                            </div>
                            <button
                                onClick={() => { setIsSearchOpen(false); setSearch(''); }}
                                className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Course Grid */}
            <div className="px-6 pt-8 grid gap-6">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => {
                        const name = locale === 'es' ? course.nombre_es : course.nombre_eu;
                        const desc = locale === 'es' ? course.descripcion_es : course.descripcion_eu;
                        const category = course.categoria ? (locale === 'es' ? course.categoria.nombre_es : course.categoria.nombre_eu) : (locale === 'es' ? 'Bela Eskola' : 'Bela Eskola');

                        return (
                            <Link
                                key={course.id}
                                href={`/${locale}/student/courses/${course.slug}`}
                                className="group relative bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden active:scale-[0.98] transition-all duration-300 hover:border-accent/30"
                            >
                                <div className="relative h-48 sm:h-64 bg-white/5">
                                    {course.imagen_url ? (
                                        <img
                                            src={course.imagen_url}
                                            alt={name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-nautical-black to-white/5">⛵</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-transparent to-transparent opacity-60" />

                                    <div className="absolute top-4 left-4 bg-accent/20 backdrop-blur-md border border-accent/30 px-3 py-1.5 rounded-full">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                                            {category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 relative">
                                    <h3 className="text-xl font-display text-white mb-2 group-hover:text-accent transition-colors">{name}</h3>
                                    <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-6 font-light">{desc}</p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase tracking-widest text-white/30 font-bold mb-1">Precio</span>
                                            <span className="text-2xl font-bold text-white italic">
                                                {course.precio}<span className="text-accent text-sm not-italic ml-1">€</span>
                                            </span>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-nautical-black shadow-[0_0_20px_rgba(255,77,0,0.3)] group-hover:shadow-accent/50 transition-all">
                                            <ChevronRight className="w-6 h-6 stroke-[3]" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-700">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-2">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-display text-white mb-2">
                                {locale === 'es' ? 'No se encontraron cursos' : 'Ez da ikastarorik aurkitu'}
                            </h3>
                            <p className="text-white/40 max-w-[240px] mx-auto text-sm leading-relaxed">
                                {locale === 'es'
                                    ? 'Prueba con otros términos o explora nuestras categorías'
                                    : 'Saiatu beste termino batzuekin edo arakatu gure kategoriak'}
                            </p>
                        </div>
                        <button
                            onClick={() => { setSearch(''); setIsSearchOpen(false); }}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-colors"
                        >
                            {locale === 'es' ? 'Ver todos los cursos' : 'Ikastaro guztiak ikusi'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
