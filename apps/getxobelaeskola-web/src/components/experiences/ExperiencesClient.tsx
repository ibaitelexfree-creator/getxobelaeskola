'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Compass, Filter, Search, X } from 'lucide-react';
import ExperienceCard from './ExperienceCard';
import StaggeredEntrance from '@/components/shared/StaggeredEntrance';

interface Experience {
    id: string;
    nombre: string;
    nombre_eu?: string;
    nombre_en?: string;
    slug: string;
    descripcion?: string;
    descripcion_eu?: string;
    descripcion_en?: string;
    categoria: string;
    precio: number;
    imagen_url?: string;
    duracion?: string;
    min_participantes?: number;
    activo: boolean;
}

const CATEGORIES = ['all', 'evento', 'taller', 'cumpleanos', 'atraque', 'bono', 'visita'] as const;
type Category = typeof CATEGORIES[number];

export default function ExperiencesClient({
    experiences,
    locale
}: {
    experiences: Experience[];
    locale: string;
}) {
    const t = useTranslations('experiences_page');
    const [selectedCategory, setSelectedCategory] = useState<Category>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredExperiences = useMemo(() => {
        return experiences.filter(exp => {
            const matchesCategory = selectedCategory === 'all' || exp.categoria === selectedCategory;

            const name = (locale === 'eu' ? exp.nombre_eu : locale === 'en' ? exp.nombre_en : exp.nombre) || exp.nombre;
            const desc = (locale === 'eu' ? exp.descripcion_eu : locale === 'en' ? exp.descripcion_en : exp.descripcion) || exp.descripcion;

            const matchesSearch = searchQuery === '' ||
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (desc && desc.toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [experiences, selectedCategory, searchQuery, locale]);

    if (experiences.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <Compass className="w-16 h-16 text-accent/30 mb-8 animate-spin-slow" />
                <h2 className="text-3xl font-display italic text-sea-foam/60 mb-4">
                    {t('title_highlight')} {locale === 'eu' ? 'laster' : locale === 'en' ? 'coming soon' : 'próximamente'}
                </h2>
                <p className="text-sea-foam/40 max-w-md">
                    {t('footer_note')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Premium Control Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-sea-foam/10 max-w-full">
                {/* Search */}
                <div className="relative w-full lg:w-80 shrink-0 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sea-foam/40 group-focus-within:text-accent transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={locale === 'eu' ? 'Bilatu esperientziak...' : locale === 'en' ? 'Search experiences...' : 'Buscar experiencias...'}
                        className="w-full bg-sea-foam/[0.02] border border-sea-foam/10 rounded-full py-2.5 sm:py-3 pl-11 sm:pl-12 pr-10 sm:pr-12 text-xs sm:text-sm text-sea-foam placeholder:text-sea-foam/30 focus:outline-none focus:border-accent/50 focus:bg-sea-foam/[0.05] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:text-sea-foam text-sea-foam/40 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="w-full lg:w-auto flex items-center lg:ml-auto lg:mr-6 xl:mr-12 max-w-full overflow-hidden">
                    <div className="w-full flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-sea-foam/[0.02] backdrop-blur-xl border border-sea-foam/10 rounded-2xl sm:rounded-full max-w-full overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 shrink-0">
                            <Filter className="w-3.5 h-3.5 text-accent" />
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-sea-foam/40 border-r border-sea-foam/10 pr-2.5 sm:pr-3">Filtrar</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto no-scrollbar py-0.5">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.15em] font-black transition-all duration-500 whitespace-nowrap shrink-0 ${selectedCategory === cat
                                            ? 'bg-accent text-nautical-black shadow-lg shadow-accent/20 scale-105'
                                            : 'text-sea-foam/40 hover:text-sea-foam hover:bg-sea-foam/[0.05]'
                                        }`}
                                >
                                    {t(cat)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results count message */}
            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sea-foam/10 to-transparent" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.4em] text-sea-foam/40 font-medium text-center">
                    {filteredExperiences.length} {locale === 'eu' ? 'esperientzia' : locale === 'en' ? 'experiences' : 'experiencias'} {locale === 'eu' ? 'aurkitu dira' : 'encontradas'}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sea-foam/10 to-transparent" />
            </div>

            {/* Grid with Staggered Entrance */}
            {filteredExperiences.length > 0 ? (
                <StaggeredEntrance
                    type="recombine"
                    staggerDelay={0.15}
                    className="w-full grid grid-cols-1 min-[480px]:grid-cols-3 landscape:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-8"
                >
                    {filteredExperiences.map((exp) => (
                        <div key={exp.id} className="h-full">
                            <ExperienceCard
                                experience={exp}
                                locale={locale}
                            />
                        </div>
                    ))}
                </StaggeredEntrance>
            ) : (
                <div className="text-center py-32 border border-dashed border-sea-foam/10 rounded-[40px] bg-sea-foam/[0.01] animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-sea-foam/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Search className="w-8 h-8 text-sea-foam/20" />
                    </div>
                    <h3 className="text-2xl font-display italic text-sea-foam/60 mb-4">
                        {locale === 'eu' ? 'Ez dugu ezer aurkitu' : locale === 'en' ? 'No results found' : 'No hemos encontrado nada'}
                    </h3>
                    <p className="text-sea-foam/40 max-w-sm mx-auto text-sm leading-relaxed">
                        {locale === 'eu'
                            ? 'Saiatu beste bilaketa bat egiten edo kategoria aldatzen.'
                            : locale === 'en'
                                ? 'Try adjusting your search terms or filters to find what you are looking for.'
                                : 'Prueba a ajustar tus términos de búsqueda o filtros para encontrar lo que buscas.'}
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        className="mt-12 px-8 py-3 bg-sea-foam/[0.05] hover:bg-sea-foam/[0.1] rounded-full text-[10px] uppercase tracking-[0.2em] font-black text-accent transition-all"
                    >
                        {locale === 'eu' ? 'Garbitu dena' : locale === 'en' ? 'Clear all filters' : 'Limpiar todos los filtros'}
                    </button>
                </div>
            )}
        </div>
    );
}
