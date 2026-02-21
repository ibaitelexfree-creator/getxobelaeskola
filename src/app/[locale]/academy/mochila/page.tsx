'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Check, ChevronRight, HelpCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { apiUrl } from '@/lib/api';

interface Question {
    id: string; // repaso_errores id
    pregunta_id: string;
    pregunta: {
        id: string;
        enunciado_es: string;
        enunciado_eu: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        opciones_es: any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        opciones_eu: any;
        respuesta_correcta: string;
        explicacion_es: string;
        explicacion_eu: string;
        tipo_pregunta: string;
    };
}

export default function MochilaPage({ params }: { params: { locale: string } }) {
    const t = useTranslations('academy.mochila');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState('');

    const locale = params.locale === 'eu' ? 'eu' : 'es';

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/academy/repaso'));
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setQuestions(data.questions || []);
        } catch (err) {
            console.error(err);
            setError('Error loading questions');
        } finally {
            setLoading(false);
        }
    };

    const handleMastered = async () => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        try {
            const res = await fetch(apiUrl('/api/academy/repaso/update'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentQ.id })
            });

            if (res.ok) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                // Remove from list
                const newQuestions = questions.filter((_, i) => i !== currentIndex);
                setQuestions(newQuestions);
                setIsFlipped(false);
                if (currentIndex >= newQuestions.length) {
                    setCurrentIndex(Math.max(0, newQuestions.length - 1));
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
             setCurrentIndex((prev) => (prev + 1) % questions.length);
        }, 200);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-nautical-black flex items-center justify-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-white/20 rounded-full mb-4"></div>
                    <p>{t('loading')}</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-nautical-black flex flex-col items-center justify-center p-6 text-white text-center">
                <div className="bg-emerald-500/10 p-6 rounded-full mb-6 text-emerald-400">
                    <Check size={48} />
                </div>
                <h1 className="text-3xl font-display italic mb-2">{t('empty')}</h1>
                <p className="text-white/60 mb-8 max-w-md">{t('empty_desc')}</p>
                <Link href={`/${locale}/academy/dashboard`} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded text-sm font-bold uppercase tracking-widest transition-colors">
                    {t('next')} -&gt; Dashboard
                </Link>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const qData = currentQuestion.pregunta;
    const enunciado = locale === 'eu' ? qData.enunciado_eu : qData.enunciado_es;
    const explicacion = locale === 'eu' ? qData.explicacion_eu : qData.explicacion_es;
    const correctAnswer = qData.respuesta_correcta;

    return (
        <div className="min-h-screen bg-nautical-black text-white flex flex-col">
            {/* Header */}
            <header className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md sticky top-0 z-10">
                <Link href={`/${locale}/academy/dashboard`} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div className="text-center">
                    <h1 className="text-sm font-bold uppercase tracking-widest text-accent">{t('title')}</h1>
                    <p className="text-xs text-white/40">{questions.length} {t('question')}(s)</p>
                </div>
                <div className="w-10"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">

                <div className="w-full min-h-[400px] relative" style={{ perspective: '1000px' }}>
                    <motion.div
                        className="w-full h-full relative cursor-pointer"
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        onClick={() => !isFlipped && setIsFlipped(true)}
                    >
                        {/* Front */}
                        <div
                            className="absolute inset-0 bg-white/10 border border-white/20 rounded-2xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-white/10 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-accent">
                                        {t('question')} #{currentIndex + 1}
                                    </span>
                                    <HelpCircle size={20} className="text-white/20" />
                                </div>
                                <h2 className="text-xl md:text-2xl font-display leading-relaxed">
                                    {enunciado}
                                </h2>
                            </div>
                            <div className="text-center mt-8">
                                <span className="text-sm text-white/40 uppercase tracking-widest animate-pulse">
                                    {t('reveal')}
                                </span>
                            </div>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute inset-0 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-sm"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="bg-emerald-500/20 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-emerald-400">
                                        {t('answer')}
                                    </span>
                                    <BookOpen size={20} className="text-emerald-400/40" />
                                </div>
                                <div className="mb-6">
                                    <p className="text-2xl font-bold text-white mb-4">{correctAnswer}</p>
                                    {explicacion && (
                                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                                            <p className="text-sm text-white/80 leading-relaxed">
                                                {explicacion}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-auto" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={handleMastered}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-nautical-black font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                                >
                                    <Check size={16} />
                                    {t('mastered')}
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                                >
                                    {t('next')}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-8 flex gap-2">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentIndex ? 'w-8 bg-accent' : 'w-1.5 bg-white/20'
                            }`}
                        />
                    ))}
                </div>

            </main>
        </div>
    );
}
