'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronRight, Anchor, Map, Award, Ship, Wind } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiUrl } from '@/lib/api';

interface WelcomeWizardProps {
    onComplete: () => void;
    userName: string;
}

export default function WelcomeWizard({ onComplete, userName }: WelcomeWizardProps) {
    const t = useTranslations('onboarding');
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);

    // Quiz Data from translations
    const quizQuestions = [
        {
            question: t('quiz.q1'),
            options: [t('quiz.q1_opt1'), t('quiz.q1_opt2'), t('quiz.q1_opt3'), t('quiz.q1_opt4')],
            correct: 0
        },
        {
            question: t('quiz.q2'),
            options: [t('quiz.q2_opt1'), t('quiz.q2_opt2'), t('quiz.q2_opt3'), t('quiz.q2_opt4')],
            correct: 1
        },
        {
            question: t('quiz.q3'),
            options: [t('quiz.q3_opt1'), t('quiz.q3_opt2'), t('quiz.q3_opt3'), t('quiz.q3_opt4')],
            correct: 1
        }
    ];

    const goals = [
        { id: '3_months', label: t('goals.3_months') },
        { id: '6_months', label: t('goals.6_months') },
        { id: '1_year', label: t('goals.1_year') },
        { id: 'just_learning', label: t('goals.just_learning') }
    ];

    const handleQuizAnswer = (qIndex: number, optionIndex: number) => {
        setAnswers({ ...answers, [qIndex]: optionIndex });
    };

    const nextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const completeOnboarding = async () => {
        setLoading(true);
        try {
            await fetch(apiUrl('/api/onboarding/complete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ meta_titulacion: goal })
            });

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            setStep(5); // Show success/badge screen
        } catch (error) {
            console.error('Error completing onboarding', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0a1628] w-full max-w-2xl rounded-xl border border-white/10 shadow-2xl overflow-hidden relative"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <div className="h-full bg-accent transition-all duration-500" style={{ width: `${((step + 1) / 6) * 100}%` }} />
                </div>

                <div className="p-8 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="intro" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col items-center text-center justify-center">
                                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                                    <Anchor className="text-accent w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-display text-white mb-4 italic">{t('welcome_title', { name: userName })}</h2>
                                <p className="text-white/60 mb-8 max-w-md">{t('welcome_desc')}</p>
                                <button onClick={nextStep} className="px-8 py-3 bg-accent text-nautical-black font-bold rounded hover:scale-105 transition-transform">
                                    {t('start_btn')}
                                </button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="quiz" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1">
                                <h3 className="text-2xl font-display text-white mb-6 italic">{t('step_1_title')}</h3>
                                <div className="space-y-6">
                                    {quizQuestions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-white/5 p-4 rounded-lg">
                                            <p className="text-white mb-3 text-sm font-bold">{q.question}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((opt, oIdx) => (
                                                    <button
                                                        key={oIdx}
                                                        onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                                        className={`text-xs p-2 rounded border transition-colors text-left ${
                                                            answers[qIdx] === oIdx
                                                                ? 'bg-accent text-black border-accent'
                                                                : 'bg-transparent text-white/70 border-white/10 hover:border-white/30'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        disabled={Object.keys(answers).length < 3}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {t('next')} <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="goal" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col justify-center">
                                <h3 className="text-2xl font-display text-white mb-2 italic">{t('step_2_title')}</h3>
                                <p className="text-white/60 mb-8">{t('step_2_desc')}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {goals.map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => setGoal(g.id)}
                                            className={`p-4 rounded-lg border text-left transition-all ${
                                                goal === g.id
                                                    ? 'bg-accent/20 border-accent text-white'
                                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                            }`}
                                        >
                                            <span className="font-bold block">{g.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        disabled={!goal}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {t('next')} <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="tour" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col">
                                <h3 className="text-2xl font-display text-white mb-6 italic">{t('step_3_title')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                    <div className="bg-white/5 p-4 rounded border border-white/10 flex flex-col items-center text-center">
                                        <Ship className="text-accent mb-2" />
                                        <h4 className="text-white font-bold mb-1">{t('tour.courses_title')}</h4>
                                        <p className="text-xs text-white/50">{t('tour.courses_desc')}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded border border-white/10 flex flex-col items-center text-center">
                                        <Map className="text-accent mb-2" />
                                        <h4 className="text-white font-bold mb-1">{t('tour.logbook_title')}</h4>
                                        <p className="text-xs text-white/50">{t('tour.logbook_desc')}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded border border-white/10 flex flex-col items-center text-center">
                                        <Wind className="text-accent mb-2" />
                                        <h4 className="text-white font-bold mb-1">{t('tour.tools_title')}</h4>
                                        <p className="text-xs text-white/50">{t('tour.tools_desc')}</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={nextStep}
                                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded flex items-center gap-2"
                                    >
                                        {t('understood')} <ChevronRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="mission" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <Award className="text-accent w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-display text-white mb-2 italic">{t('step_4_title')}</h3>
                                <div className="bg-white/5 p-6 rounded-lg border border-accent/30 max-w-md mb-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                                    <h4 className="text-lg font-bold text-white mb-2">{t('step_4_subtitle')}</h4>
                                    <p className="text-sm text-white/70">{t('step_4_desc')}</p>
                                </div>
                                <button
                                    onClick={completeOnboarding}
                                    disabled={loading}
                                    className="px-8 py-3 bg-accent text-nautical-black font-bold rounded hover:scale-105 transition-transform flex items-center gap-2"
                                >
                                    {loading ? t('processing') : t('complete_mission_btn')}
                                </button>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="badge" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="mb-6"
                                >
                                    <div className="w-32 h-32 rounded-full border-4 border-accent border-dashed flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-accent text-nautical-black flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(202,138,4,0.5)]">
                                            🧭
                                        </div>
                                    </div>
                                </motion.div>
                                <h2 className="text-3xl font-display text-accent mb-2 italic">{t('congrats_title')}</h2>
                                <p className="text-white text-lg font-bold mb-1">{t('badge_earned')}</p>
                                <p className="text-white/50 text-sm mb-8">{t('journey_begins')}</p>

                                <button
                                    onClick={onComplete}
                                    className="px-8 py-3 bg-white/10 text-white font-bold rounded hover:bg-white/20 transition-colors"
                                >
                                    {t('go_to_dashboard')}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
