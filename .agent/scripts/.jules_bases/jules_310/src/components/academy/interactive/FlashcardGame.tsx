'use client';

import React, { useState, useEffect } from 'react';
import { FLASHCARDS_DATA, FlashcardData } from '@/lib/academy/flashcards-data';
import Flashcard from './Flashcard';
import { Shuffle, RotateCcw, Check, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FlashcardGame() {
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [score, setScore] = useState({ correct: 0, wrong: 0 });
    const [finished, setFinished] = useState(false);
    const [filter, setFilter] = useState<'all' | 'luces' | 'banderas' | 'nudos'>('all');

    // Initialize & shuffle
    useEffect(() => {
        restartGame();
    }, [filter]);

    const restartGame = () => {
        let filtered = FLASHCARDS_DATA;
        if (filter !== 'all') {
            filtered = FLASHCARDS_DATA.filter(c => c.category === filter);
        }
        // Shuffle
        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
        setIsFlipped(false);
        setScore({ correct: 0, wrong: 0 });
        setFinished(false);
    };

    const handleNext = (isCorrect: boolean) => {
        if (isCorrect) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#FFBF00', '#ffffff'] // accent color
            });
        } else {
            setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
        }

        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setTimeout(() => setCurrentIndex(prev => prev + 1), 300); // Wait for potential animation
        } else {
            setFinished(true);
            if (isCorrect && score.correct + 1 === cards.length) {
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 }
                });
            }
        }
    };

    if (cards.length === 0) return <div>Cargando cartas...</div>;

    if (finished) {
        return (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
                <h2 className="text-4xl font-display italic text-white mb-6">¡Sesión Completada!</h2>

                <div className="flex gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-green-400 mb-1">{score.correct}</div>
                        <div className="text-3xs uppercase tracking-widest text-white/40">Aciertos</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-bold text-red-400 mb-1">{score.wrong}</div>
                        <div className="text-3xs uppercase tracking-widest text-white/40">Repasar</div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 mb-8 max-w-sm text-center border border-white/10">
                    <p className="text-white/70">
                        {score.correct === cards.length
                            ? "¡Perfecto! Eres un verdadero lobo de mar. 🌊"
                            : score.correct > score.wrong
                                ? "¡Buen trabajo! Sigue practicando para perfeccionar."
                                : "No te desanimes, la repetición es la madre del aprendizaje."}
                    </p>
                </div>

                <button
                    onClick={restartGame}
                    className="flex items-center gap-2 px-8 py-3 bg-accent text-nautical-black font-bold uppercase tracking-widest rounded-sm hover:bg-white transition-colors"
                >
                    <RotateCcw className="w-4 h-4" /> Repetir Sesión
                </button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                <div className="flex gap-2">
                    {(['all', 'luces', 'banderas', 'nudos'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-1.5 rounded-full text-3xs font-black uppercase tracking-widest border transition-colors
                                ${filter === cat
                                    ? 'bg-accent text-nautical-black border-accent'
                                    : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}
                            `}
                        >
                            {cat === 'all' ? 'Todo' : cat}
                        </button>
                    ))}
                </div>
                <div className="text-2xs font-mono text-white/40">
                    {currentIndex + 1} / {cards.length}
                </div>
            </div>

            {/* Game Area */}
            <div className="flex flex-col items-center gap-8">
                <Flashcard
                    data={currentCard}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped(!isFlipped)}
                />

                {/* Response Buttons */}
                <div className={`flex gap-4 transition-opacity duration-500 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <button
                        onClick={() => handleNext(false)}
                        className="flex items-center gap-2 px-6 py-4 bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest rounded-sm hover:bg-red-500/20 transition-colors"
                    >
                        <X className="w-5 h-5" /> No lo sabía
                    </button>
                    <button
                        onClick={() => handleNext(true)}
                        className="flex items-center gap-2 px-6 py-4 bg-green-500/10 border border-green-500/20 text-green-400 font-bold uppercase tracking-widest rounded-sm hover:bg-green-500/20 transition-colors"
                    >
                        <Check className="w-5 h-5" /> Lo sabía
                    </button>
                </div>

                {!isFlipped && (
                    <p className="text-white/20 text-sm animate-pulse">¿Conoces la respuesta?</p>
                )}
            </div>
        </div>
    );
}
