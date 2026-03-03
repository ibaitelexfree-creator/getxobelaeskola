'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import Fuse from 'fuse.js';
import { Search, BookOpen, Anchor, Wind, Sailboat, Shield, MoreHorizontal, ArrowUp, ArrowRight } from 'lucide-react';
import { nauticalTerms } from '@/data/nauticalGlossary';
import { NauticalTerm, TermCategory } from '@/types/glossary';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlossaryPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('glossary');
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TermCategory | 'all'>('all');
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Scroll to top listener
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fuse.js configuration
    const fuse = useMemo(() => new Fuse(nauticalTerms, {
        keys: ['term', 'definition'],
        threshold: 0.3,
        distance: 100,
    }), []);

    // Filter terms
    const filteredTerms = useMemo(() => {
        let results = nauticalTerms;

        if (query) {
            results = fuse.search(query).map(result => result.item);
        }

        if (selectedCategory !== 'all') {
            results = results.filter(term => term.category === selectedCategory);
        }

        // Sort alphabetically if no search query (Fuse returns by relevance)
        if (!query) {
            results.sort((a, b) => a.term.localeCompare(b.term));
        }

        return results;
    }, [query, selectedCategory, fuse]);

    // Categories configuration
    const categories = [
        { id: 'all', label: t('filter_all'), icon: BookOpen },
        { id: 'maniobras', label: t('filter_maniobras'), icon: Anchor },
        { id: 'partes del barco', label: t('filter_partes'), icon: Sailboat },
        { id: 'meteorología', label: t('filter_meteo'), icon: Wind },
        { id: 'reglamento', label: t('filter_reglamento'), icon: Shield },
        { id: 'otros', label: t('filter_otros'), icon: MoreHorizontal },
    ];

    return (
        <main className="min-h-screen bg-nautical-deep pt-32 pb-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-6">
                    <span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold tracking-widest uppercase">
                        {t('subtitle')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-display text-white">
                        {t('title')}
                    </h1>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all backdrop-blur-sm"
                            placeholder={t('search_placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id as TermCategory | 'all')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                                    isSelected
                                        ? 'bg-accent text-nautical-black border-accent shadow-lg shadow-accent/20 scale-105'
                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Results Count */}
                <div className="text-white/40 text-sm mb-6 font-mono">
                    {filteredTerms.length} {t('no_results').replace('No se encontraron', '').replace('para tu búsqueda', '').trim()}
                    {filteredTerms.length === 1 ? 'término' : 'términos'}
                </div>

                {/* Terms Grid */}
                {filteredTerms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredTerms.map((term) => (
                                <motion.div
                                    key={term.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white/5 backdrop-blur-md border border-white/5 rounded-xl p-6 hover:border-accent/30 transition-colors group flex flex-col h-full"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-display text-white group-hover:text-accent transition-colors">
                                            {term.term}
                                        </h3>
                                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-white/40 border border-white/5`}>
                                            {term.category}
                                        </span>
                                    </div>
                                    <p className="text-white/70 font-light leading-relaxed flex-grow">
                                        {term.definition}
                                    </p>

                                    {term.relatedCourseSlug && (
                                        <div className="mt-6 pt-4 border-t border-white/5">
                                            <Link
                                                href={`/${locale}/courses/${term.relatedCourseSlug}`}
                                                className="inline-flex items-center gap-2 text-xs font-bold text-accent hover:underline uppercase tracking-widest"
                                            >
                                                {t('learn_more')}
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-xl text-white font-display mb-2">
                            {t('no_results')}
                        </h3>
                        <p className="text-white/40">
                            Intenta con otra búsqueda o cambia los filtros.
                        </p>
                    </div>
                )}
            </div>

            {/* Back to top button */}
            <AnimatePresence>
                {showBackToTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        onClick={scrollToTop}
                        className="fixed bottom-8 right-8 w-12 h-12 bg-accent text-nautical-black rounded-full shadow-lg shadow-accent/20 flex items-center justify-center z-50 hover:scale-110 transition-transform"
                        aria-label={t('back_to_top')}
                    >
                        <ArrowUp className="w-5 h-5" strokeWidth={3} />
                    </motion.button>
                )}
            </AnimatePresence>
        </main>
    );
}
