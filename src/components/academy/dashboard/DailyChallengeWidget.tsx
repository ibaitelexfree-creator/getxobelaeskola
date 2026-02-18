'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, XCircle, Brain, Target, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { apiUrl } from '@/lib/api';

interface DailyChallengeWidgetProps {
    locale: string;
}

export default function DailyChallengeWidget({ locale }: DailyChallengeWidgetProps) {
    const t = useTranslations('student_dashboard.daily_challenge');
    const [data, setData] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenge();
    }, []);

    const fetchChallenge = async () => {
        try {
            const res = await fetch(apiUrl('/api/academy/daily-challenge'));
            const json = await res.json();
            if (res.ok) {
                setData(json);
            }
        } catch (error) {
            console.error('Failed to fetch challenge', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedOption === null || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(apiUrl('/api/academy/daily-challenge'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    desafioId: data.challenge.id,
                    respuesta: selectedOption
                })
            });
            const result = await res.json();
            if (res.ok) {
                setData({
                    ...data,
                    completed: true,
                    correct: result.correcto,
                    result: {
                        explicacion_es: result.explanation.explicacion_es,
                        explicacion_eu: result.explanation.explicacion_eu,
                        respuesta_correcta: result.explanation.respuesta_correcta
                    }
                });
            }
        } catch (error) {
            console.error('Failed to submit answer', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="w-full h-48 bg-white/5 rounded-2xl animate-pulse border border-white/10" />
    );

    if (!data || !data.challenge) return null;

    const challenge = data.challenge;
    const isCompleted = data.completed;

    return (
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 shadow-2xl group">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[60px] rounded-full group-hover:bg-accent/20 transition-all duration-700" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/10 blur-[40px] rounded-full" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10 group-hover:scale-110 transition-transform">
                        <Brain size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-accent">{t('title')}</span>
                            <Sparkles size={10} className="text-accent animate-pulse" />
                        </div>
                        <h3 className="text-white font-display font-bold text-lg italic tracking-tight">{t('subtitle')}</h3>
                    </div>
                </div>
                {!isCompleted && (
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                        <Target size={12} className="text-accent" />
                        <span className="text-[10px] font-black text-white/60">{t('reward', { xp: challenge.xp_recompensa })}</span>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!isCompleted ? (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative z-10"
                    >
                        <p className="text-white/80 text-lg font-serif italic mb-8 leading-relaxed">
                            "{locale === 'eu' ? challenge.pregunta_eu : challenge.pregunta_es}"
                        </p>

                        <div className="space-y-3">
                            {challenge.opciones.map((opcion: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedOption(idx)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group/opt ${selectedOption === idx
                                        ? 'bg-accent border-accent text-nautical-black shadow-lg shadow-accent/20'
                                        : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="text-sm font-bold">{opcion}</span>
                                    {selectedOption === idx && <div className="w-2 h-2 rounded-full bg-nautical-black" />}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={selectedOption === null || submitting}
                            className={`mt-8 w-full py-4 rounded-xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 ${selectedOption === null || submitting
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : 'bg-accent text-nautical-black hover:scale-[1.02] shadow-xl shadow-accent/10 active:scale-95'
                                }`}
                        >
                            {submitting ? 'Abordando...' : t('submit')}
                            <ChevronRight size={14} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-center py-4"
                    >
                        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center border-2 ${data.correct ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                            {data.correct ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                        </div>

                        <h4 className={`text-2xl font-black uppercase tracking-tighter mb-2 ${data.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                            {data.correct ? t('correct', { xp: challenge.xp_recompensa }) : t('wrong', { answer: challenge.opciones[data.result.respuesta_correcta] || '' })}
                        </h4>

                        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-8 font-black">
                            {data.correct ? `Has ganado ${challenge.xp_recompensa} XP` : t('come_back')}
                        </p>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <Brain size={40} />
                            </div>
                            <span className="text-[9px] uppercase font-black text-accent tracking-widest block mb-1">{t('explanation')}</span>
                            <p className="text-white/60 text-sm leading-relaxed italic">
                                "{locale === 'eu' ? data.result.explicacion_eu : data.result.explicacion_es}"
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decoration */}
            <div className="absolute bottom-0 right-0 pointer-events-none opacity-[0.02] translate-y-1/2 translate-x-1/2">
                <Brain size={180} />
            </div>
        </section>
    );
}
