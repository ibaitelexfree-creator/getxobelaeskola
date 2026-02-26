'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAUTICAL_TERMS, NomenclatureCard } from '@/data/academy/nautical-nomenclature';
import { Shuffle, Check, RefreshCw, X } from 'lucide-react';

import ThreePartCard from './ThreePartCard';
<<<<<<< HEAD
import dynamic from 'next/dynamic';

const Nomenclature3DView = dynamic(() => import('./Nomenclature3DView'), { ssr: false });
=======
>>>>>>> pr-286

interface NomenclatureLessonProps {
    locale: string;
}

export default function NomenclatureLesson({ locale }: NomenclatureLessonProps) {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [difficulty, setDifficulty] = useState<'beginner' | 'master'>('beginner');
    const [learningMode, setLearningMode] = useState<'learn' | 'practice'>('learn');

    // Game State
    const [deck, setDeck] = useState<NomenclatureCard[]>([]);
    const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [wrongMatch, setWrongMatch] = useState<string | null>(null);

    // Filter Data
    useEffect(() => {
        let filtered = NAUTICAL_TERMS;
        if (activeCategory !== 'all') {
            filtered = NAUTICAL_TERMS.filter(c => c.category === activeCategory);
        }
        // Shuffle the filtered list to create the deck
        const shuffledDeck = [...filtered].sort(() => 0.5 - Math.random());
        // Limit to 8 if deck is large
        const finalDeck = shuffledDeck.slice(0, 8);
        setDeck(finalDeck);
        setMatchedPairs([]);
        setSelectedLabel(null);

        // Shuffle labels based on the NEW deck, not the old one
        // We set shuffled labels here to ensure sync
        setShuffledLabels([...finalDeck].sort(() => 0.5 - Math.random()));
    }, [activeCategory]);

<<<<<<< HEAD
=======
    // Remove the separate effect for deck -> shuffledLabels to avoid race/desync
    // useEffect(() => {
    //    setShuffledLabels([...deck].sort(() => 0.5 - Math.random()));
    // }, [deck]);

>>>>>>> pr-286
    const handleImageClick = (cardId: string) => {
        if (!selectedLabel) return;

        if (selectedLabel === cardId) {
            // Match!
            setMatchedPairs(prev => [...prev, cardId]);
            setSelectedLabel(null);
        } else {
            // Wrong
            setWrongMatch(cardId);
            setTimeout(() => setWrongMatch(null), 500);
        }
    };

    const isAllMatched = deck.length > 0 && matchedPairs.length === deck.length;

<<<<<<< HEAD
=======
    // Separate lists for Images (Top) and Labels (Bottom)
    // In Montessori, you lay out images first.
    // Then you pick a label and place it.

>>>>>>> pr-286
    // Labels should be shuffled independently from Images for challenge.
    const [shuffledLabels, setShuffledLabels] = useState<NomenclatureCard[]>([]);

    return (
        <div className="w-full h-full flex flex-col p-6 max-w-6xl mx-auto font-display">
<<<<<<< HEAD
            {/* Toolbar - Only show category filter in Practice mode or if we want to filter the 3D view (not implemented yet) */}
            {learningMode === 'practice' && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex gap-2 text-2xs uppercase tracking-widest">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`px-3 py-1 rounded transition-colors ${activeCategory === 'all' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setActiveCategory('general')}
                            className={`px-3 py-1 rounded transition-colors ${activeCategory === 'general' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveCategory('rigging')}
                            className={`px-3 py-1 rounded transition-colors ${activeCategory === 'rigging' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                        >
                            Jarcia
                        </button>
                        <button
                            onClick={() => setActiveCategory('sails')}
                            className={`px-3 py-1 rounded transition-colors ${activeCategory === 'sails' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                        >
                            Velas
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-white/50 text-sm">
                        {matchedPairs.length} / {deck.length} <Check size={16} />
                    </div>
                </div>
            )}

            {/* Victory Screen */}
            {isAllMatched && learningMode === 'practice' && (
=======
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex gap-2 text-2xs uppercase tracking-widest">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-3 py-1 rounded transition-colors ${activeCategory === 'all' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setActiveCategory('general')}
                        className={`px-3 py-1 rounded transition-colors ${activeCategory === 'general' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        General
                    </button>
                    <button
                        onClick={() => setActiveCategory('rigging')}
                        className={`px-3 py-1 rounded transition-colors ${activeCategory === 'rigging' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        Jarcia
                    </button>
                    <button
                        onClick={() => setActiveCategory('sails')}
                        className={`px-3 py-1 rounded transition-colors ${activeCategory === 'sails' ? 'bg-accent text-nautical-black font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        Velas
                    </button>
                </div>

                <div className="flex items-center gap-2 text-white/50 text-sm">
                    {matchedPairs.length} / {deck.length} <Check size={16} />
                </div>
            </div>

            {/* Victory Screen */}
            {isAllMatched && (
>>>>>>> pr-286
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-sm">
                        <h2 className="text-2xl font-bold text-nautical-black mb-2">¡Perfecto!</h2>
                        <p className="text-gray-600 mb-6 font-display">Has identificado correctamente todas las partes.</p>
                        <button
                            onClick={() => {
                                // Trigger re-shuffle same category
                                let filtered = NAUTICAL_TERMS;
                                if (activeCategory !== 'all') {
                                    filtered = NAUTICAL_TERMS.filter(c => c.category === activeCategory);
                                }
                                const shuffledDeck = [...filtered].sort(() => 0.5 - Math.random());
                                const finalDeck = shuffledDeck.slice(0, 8);
                                setDeck(finalDeck);
                                setMatchedPairs([]);
                                setSelectedLabel(null);
                                setShuffledLabels([...finalDeck].sort(() => 0.5 - Math.random()));
                            }}
                            className="bg-accent text-nautical-black font-bold px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:bg-accent/90 transition-transform hover:scale-105"
                        >
                            <RefreshCw size={16} /> Otra Lección
                        </button>
                    </div>
                </div>
            )}

            {/* Mode Switcher */}
            <div className="flex justify-center mb-8 gap-4">
                <button
                    onClick={() => setLearningMode('learn')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${learningMode === 'learn' ? 'bg-white text-nautical-black shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
<<<<<<< HEAD
                    1. Exploración 3D (Aprender)
=======
                    1. Aprender (Control)
>>>>>>> pr-286
                </button>
                <button
                    onClick={() => setLearningMode('practice')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${learningMode === 'practice' ? 'bg-accent text-nautical-black shadow-lg scale-105' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    2. Practicar (Juego)
                </button>
            </div>

            {/* Teaching Area */}
            {learningMode === 'learn' ? (
<<<<<<< HEAD
                <div className="w-full flex-grow flex flex-col items-center justify-center p-4">
                    <Nomenclature3DView locale={locale} />

                    <div className="mt-8 text-center text-white/50 text-sm max-w-2xl">
                        <p>Interactúa con el modelo 3D para descubrir las partes de la embarcación.</p>
                        <p>Haz click y arrastra para rotar. Usa la rueda del ratón para hacer zoom.</p>
                    </div>
=======
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                    <AnimatePresence>
                        {deck.map(card => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layoutId={`card-${card.id}`}
                            >
                                <ThreePartCard card={card} mode="control" locale={locale} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
>>>>>>> pr-286
                </div>
            ) : (
                <div className="flex flex-col gap-12 flex-grow overflow-y-auto custom-scrollbar pr-2">

                    {/* 1. Images Row (Drop Targets) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {deck.map(card => {
                            const isMatched = matchedPairs.includes(card.id);
                            const isWrong = wrongMatch === card.id;

                            return (
                                <div
                                    key={card.id}
                                    onClick={() => handleImageClick(card.id)}
                                    className={`relative aspect-square bg-slate-100 rounded-lg border-2 transition-all cursor-pointer overflow-hidden group
                                    ${isMatched
                                            ? 'border-green-500 bg-green-50'
                                            : isWrong
                                                ? 'border-red-500 animate-shake'
                                                : selectedLabel
                                                    ? 'border-accent border-dashed hover:bg-accent/10'
                                                    : 'border-white/20 opacity-80'
                                        }
                                `}
                                >
                                    <div
                                        className={`absolute inset-4 flex items-center justify-center pointer-events-none`}
                                    >
                                        <svg viewBox="0 0 200 220" className="w-full h-full text-slate-700 fill-current opacity-80">
                                            {/* Context Layer */}
                                            {card.category !== 'orientation' && (
                                                <g stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.5">
                                                    <path d="M100,20 C140,20 160,80 160,140 C160,180 140,200 100,200 C60,200 40,180 40,140 C40,80 60,20 100,20 Z" />
                                                    <line x1="100" y1="20" x2="100" y2="200" strokeDasharray="2,2" />
                                                </g>
                                            )}

                                            {/* Highlight Layer */}
                                            {card.svgPath && (
                                                <path
                                                    d={card.svgPath}
                                                    fill={matchedPairs.includes(card.id) ? '#22c55e' : 'currentColor'}
                                                    stroke={matchedPairs.includes(card.id) ? '#166534' : 'none'}
                                                    strokeWidth="2"
                                                />
                                            )}
                                        </svg>
                                    </div>

                                    {/* Matched Label Overlay */}
                                    <AnimatePresence>
                                        {isMatched && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-bold shadow-lg"
                                            >
                                                {locale === 'eu' ? card.term_eu : card.term_es}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* 2. Divider / Instructions */}
                    <div className="text-center">
                        <p className="text-white/40 text-sm italic">
                            Selecciona una etiqueta y asígnala a la imagen correcta.
                        </p>
                    </div>

                    {/* 3. Labels Pool (Source) */}
                    <div className="flex flex-wrap justify-center gap-3 pb-8">
                        {shuffledLabels.map(card => {
                            if (matchedPairs.includes(card.id)) return null; // Hide matched

                            const isSelected = selectedLabel === card.id;

                            return (
                                <motion.button
                                    key={card.id}
                                    layoutId={card.id}
                                    onClick={() => setSelectedLabel(isSelected ? null : card.id)}
                                    className={`px-6 py-3 rounded border text-sm font-bold shadow-sm transition-all
                                    ${isSelected
                                            ? 'bg-accent text-nautical-black border-accent scale-110 shadow-lg ring-2 ring-accent/50'
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                        }
                                `}
                                >
                                    {locale === 'eu' ? card.term_eu : card.term_es}
                                </motion.button>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
    );
}
