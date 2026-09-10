'use client';

import { useSearchParams } from 'next/navigation';
import CourseCard from './CourseCard';
import CourseFilters from './CourseFilters';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    slug: string;
}

interface CourseListClientProps {
    initialCourses: any[];
    categories: Category[];
    locale: string;
}

export default function CoursesListClient({ initialCourses, categories, locale }: CourseListClientProps) {
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category');

    // Client-side filtering with fail-safe fallback
    const filtered = activeCategory
        ? initialCourses.filter(course => 
            course.categoria_id === activeCategory ||
            course.categoria?.id === activeCategory ||
            course.categoria?.slug === activeCategory ||
            course.categoria?.nombre_es?.toLowerCase() === activeCategory?.toLowerCase()
          )
        : initialCourses;

    const displayCourses = (filtered && filtered.length > 0) ? filtered : initialCourses;

    return (
        <section className="pb-16 sm:pb-24 lg:pb-36 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 courses-container-padding relative z-10">
                <CourseFilters categories={categories || []} locale={locale} />

                {displayCourses.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="inline-block p-8 border border-sea-foam/10 rounded-2xl bg-sea-foam/[0.02]">
                            <span className="text-4xl mb-4 block">🔍</span>
                            <h3 className="text-xl font-display text-sea-foam mb-2">
                                {locale === 'eu' ? 'Ez da ikastarorik aurkitu' : 'No se encontraron cursos'}
                            </h3>
                            <p className="text-sea-foam/60 max-w-md mx-auto">
                                {locale === 'eu'
                                    ? 'Saiatu beste kategoria batekin edo garbitu iragazkiak.'
                                    : 'Intenta con otra categoría o limpia los filtros.'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className="grid gap-3 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-8 md:mt-12 courses-grid-system"
                        style={{
                            display: 'grid',
                        }}
                    >
                        <AnimatePresence mode="popLayout">
                            {displayCourses.map((course) => (
                                <motion.div
                                    key={course.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.25 }}
                                    className="w-full aspect-square"
                                >
                                    <CourseCard course={course} locale={locale} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
