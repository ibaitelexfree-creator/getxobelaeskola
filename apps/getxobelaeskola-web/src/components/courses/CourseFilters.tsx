'use client';

import { useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
    id: string;
    nombre_es: string;
    nombre_eu: string;
    slug: string;
}

interface CourseFiltersProps {
    categories: Category[];
    locale: string;
}

export default function CourseFilters({ categories, locale }: CourseFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get('category');
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleCategoryChange = (id: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set('category', id);
        } else {
            params.delete('category');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -260 : 260;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative mb-[clamp(1rem,2.5vw,3rem)] animate-fade-in w-full" style={{ animationDelay: '0.8s' }}>
            {/* Scroll Navigation Header Bar */}
            <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
                <div className="flex items-center gap-2 sm:gap-3 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="h-px w-4 sm:w-8 bg-sea-foam" />
                    <span className="text-[clamp(0.55rem,0.7vw,0.75rem)] uppercase tracking-[0.4em] text-sea-foam font-bold">
                        Slide to filter
                    </span>
                </div>

                {/* Interactive Left / Right Scroll Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={() => handleScroll('left')}
                        aria-label="Scroll left"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-sea-foam/20 bg-sea-foam/[0.03] hover:bg-accent hover:border-accent hover:text-nautical-black text-sea-foam flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                        onClick={() => handleScroll('right')}
                        aria-label="Scroll right"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-sea-foam/20 bg-sea-foam/[0.03] hover:bg-accent hover:border-accent hover:text-nautical-black text-sea-foam flex items-center justify-center transition-all duration-300 shadow-sm"
                    >
                        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>

            {/* Gradient Mask for smooth fade edge */}
            <div className="absolute right-0 top-10 bottom-0 w-16 bg-gradient-to-l from-nautical-deep to-transparent z-10 pointer-events-none" />

            {/* Scrollable Filter Category Buttons */}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-2 sm:pb-3 gap-2 sm:gap-3 md:gap-4 no-scrollbar scroll-smooth w-full select-none"
            >
                <button
                    onClick={() => handleCategoryChange(null)}
                    className={`whitespace-nowrap px-[clamp(1rem,1.8vw,2rem)] py-[clamp(0.4rem,0.8vw,0.75rem)] rounded-sm text-[clamp(0.6rem,0.75vw,0.75rem)] font-black uppercase tracking-[0.3em] transition-all duration-500 border flex-shrink-0 ${!activeCategory
                        ? 'bg-accent text-nautical-black border-accent shadow-[0_0_25px_rgba(255,77,0,0.25)]'
                        : 'bg-sea-foam/[0.02] text-sea-foam/50 border-sea-foam/10 hover:border-sea-foam/20 hover:text-sea-foam'
                        }`}
                >
                    {locale === 'eu' ? 'Guztiak' : (locale === 'en' ? 'All' : 'Todos')}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`whitespace-nowrap px-[clamp(1rem,1.8vw,2rem)] py-[clamp(0.4rem,0.8vw,0.75rem)] rounded-sm text-[clamp(0.6rem,0.75vw,0.75rem)] font-black uppercase tracking-[0.3em] transition-all duration-500 border flex-shrink-0 ${activeCategory === cat.id
                            ? 'bg-accent text-nautical-black border-accent shadow-[0_0_25px_rgba(255,77,0,0.25)]'
                            : 'bg-sea-foam/[0.02] text-sea-foam/50 border-sea-foam/10 hover:border-sea-foam/20 hover:text-sea-foam'
                            }`}
                    >
                        {locale === 'eu' ? cat.nombre_eu : cat.nombre_es}
                    </button>
                ))}
            </div>
        </div>
    );
}
