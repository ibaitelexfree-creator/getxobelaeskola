
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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

    const handleCategoryChange = (id: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
            params.set('category', id);
        } else {
            params.delete('category');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex flex-wrap gap-4 mb-16 animate-fade-in" style={{ animationDelay: '1s' }}>
            <button
                onClick={() => handleCategoryChange(null)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${!activeCategory
                        ? 'bg-accent text-nautical-black border-accent'
                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
            >
                {locale === 'eu' ? 'Guztiak' : 'Todos'}
            </button>
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat.id
                            ? 'bg-accent text-nautical-black border-accent shadow-[0_0_20px_rgba(255,77,0,0.3)]'
                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                >
                    {locale === 'eu' ? cat.nombre_eu : cat.nombre_es}
                </button>
            ))}
        </div>
    );
}
