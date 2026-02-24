'use client';

import { useState } from 'react';
import Flashcard from './Flashcard';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '@/lib/api';

interface MistakeReviewDeckProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialMistakes: any[];
    locale: string;
}

export default function MistakeReviewDeck({ initialMistakes, locale }: MistakeReviewDeckProps) {
    const [mistakes, setMistakes] = useState(initialMistakes);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const currentMistake = mistakes[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex < mistakes.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                // Check if we have reviewed all but some remain unmastered
                // For simplicity, we restart or finish
                setIsFinished(true);
            }
        }, 300);
    };

    const handleMastered = async () => {
        try {
            // Optimistic update
            const newMistakes = mistakes.filter((_, idx) => idx !== currentIndex);

            // API call
            await fetch(apiUrl('/api/student/mistakes'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pregunta_id: currentMistake.pregunta_id })
            });

            setIsFlipped(false);

            if (newMistakes.length === 0) {
                setIsFinished(true);
                setMistakes([]);
            } else {
                setMistakes(newMistakes);
                // If we were at the last item, go to the first (since array shrunk) or stay at current index if it exists
                if (currentIndex >= newMistakes.length) {
                    setCurrentIndex(0);
                }
            }

        } catch (error) {
            console.error('Error marking as mastered:', error);
        }
    };

    if (mistakes.length === 0 || isFinished) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-display text-white mb-2">¡Todo despejado!</h2>
                <p className="text-white/60 mb-8 max-w-md">Has repasado tus dudas pendientes. ¡Gran trabajo, Capitán!</p>
                <button
                    onClick={() => window.location.href = `/${locale}/academy/dashboard`}
                    className="px-8 py-3 bg-accent text-nautical-black font-black uppercase tracking-widest text-xs rounded hover:bg-white transition-colors"
                >
                    Volver al Panel Principal
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto w-full">
            <div className="mb-6 flex justify-between items-center text-xs uppercase tracking-widest text-white/40">
                <span>Duda {currentIndex + 1} de {mistakes.length}</span>
                <span>{mistakes.length - currentIndex - 1} restantes</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMistake.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <Flashcard
                        pregunta={currentMistake.pregunta}
                        isFlipped={isFlipped}
                        onFlip={() => setIsFlipped(!isFlipped)}
                        locale={locale}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                    onClick={handleNext}
                    className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 transition-all"
                >
                    <RotateCcw size={18} />
                    <span>Repasar luego</span>
                </button>
                <button
                    onClick={handleMastered}
                    className="px-6 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center gap-2 transition-all"
                >
                    <CheckCircle size={18} />
                    <span>Dominada</span>
                </button>
            </div>

            <p className="mt-6 text-center text-white/20 text-[10px] uppercase tracking-widest">
                Toca la tarjeta para ver la respuesta
            </p>
        </div>
    );
}
