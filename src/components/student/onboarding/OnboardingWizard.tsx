'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import confetti from 'canvas-confetti';
import { X, ChevronRight, Check, Anchor, Map, Compass, Award } from 'lucide-react';
import { createPortal } from 'react-dom';

interface OnboardingWizardProps {
    userId?: string;
}

export default function OnboardingWizard({ userId }: OnboardingWizardProps) {
    const t = useTranslations('onboarding');
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0); // 0: Welcome, 1: Level, 2: Goals, 3: Tour, 4: Mission, 5: Badge
    const [tourStep, setTourStep] = useState(0); // Sub-step for tour
    const [answers, setAnswers] = useState<any>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (userId) {
            const completed = localStorage.getItem(`onboarding_completed_${userId}`);
            if (!completed) {
                // Delay slightly to allow dashboard to load
                const timer = setTimeout(() => setIsVisible(true), 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [userId]);

    const handleComplete = () => {
        if (userId) {
            localStorage.setItem(`onboarding_completed_${userId}`, 'true');
            // TODO: Save answers (level test, goals) to the backend.
            // currently this is a frontend-only implementation.
            console.log('Onboarding Answers:', answers);
        }
        setIsVisible(false);
    };

    const nextStep = () => setStep(s => s + 1);

    if (!mounted || !isVisible) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-nautical-black/80 backdrop-blur-sm"
            />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-2xl px-4">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <WelcomeStep key="welcome" t={t} onNext={nextStep} />
                    )}
                    {step === 1 && (
                        <LevelTestStep key="level" t={t} onNext={(ans) => { setAnswers({...answers, level: ans}); nextStep(); }} />
                    )}
                    {step === 2 && (
                        <GoalSettingStep key="goals" t={t} onNext={(ans) => { setAnswers({...answers, goal: ans}); nextStep(); }} />
                    )}
                    {step === 3 && (
                        <TourStep key="tour" t={t} onNext={nextStep} tourStep={tourStep} setTourStep={setTourStep} />
                    )}
                    {step === 4 && (
                        <MissionStep key="mission" t={t} onNext={nextStep} />
                    )}
                    {step === 5 && (
                        <BadgeStep key="badge" t={t} onClose={handleComplete} />
                    )}
                </AnimatePresence>
            </div>
        </div>,
        document.body
    );
}

// --- Sub-components ---

function WelcomeStep({ t, onNext }: { t: any, onNext: () => void }) {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-white/10 p-8 md:p-12 rounded-sm shadow-2xl text-center relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-12 opacity-[0.05] text-9xl pointer-events-none">⚓</div>
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent">
                <Anchor size={40} />
            </div>
            <h2 className="text-3xl md:text-4xl font-display text-white mb-4">{t('welcome.title')}</h2>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">{t('welcome.subtitle')}</p>
            <button
                onClick={onNext}
                className="bg-accent text-nautical-black px-8 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-white transition-all transform hover:scale-105"
            >
                {t('welcome.start_btn')}
            </button>
        </motion.div>
    );
}

function LevelTestStep({ t, onNext }: { t: any, onNext: (ans: any) => void }) {
    const [responses, setResponses] = useState<any>({});

    const questions = [
        { id: 'q1', text: t('level_test.q1'), options: [{ val: 'yes', label: t('level_test.a1_yes') }, { val: 'no', label: t('level_test.a1_no') }] },
        { id: 'q2', text: t('level_test.q2'), options: [{ val: 'yes', label: t('level_test.a2_yes') }, { val: 'no', label: t('level_test.a2_no') }] },
        { id: 'q3', text: t('level_test.q3'), options: [{ val: 'yes', label: t('level_test.a3_yes') }, { val: 'no', label: t('level_test.a3_no') }] },
    ];

    const canContinue = Object.keys(responses).length === questions.length;

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-card border border-white/10 p-8 rounded-sm shadow-2xl max-w-lg mx-auto"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                    <Compass size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-display text-white">{t('level_test.title')}</h3>
                    <p className="text-xs text-white/40">{t('level_test.subtitle')}</p>
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q) => (
                    <div key={q.id} className="space-y-3">
                        <p className="text-white/80 font-medium">{q.text}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {q.options.map((opt) => (
                                <button
                                    key={opt.val}
                                    onClick={() => setResponses({...responses, [q.id]: opt.val})}
                                    className={`p-3 text-xs border rounded-sm transition-all text-left ${
                                        responses[q.id] === opt.val
                                        ? 'bg-accent text-nautical-black border-accent font-bold'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => onNext(responses)}
                    disabled={!canContinue}
                    className="flex items-center gap-2 bg-accent text-nautical-black px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                    {t('level_test.next_btn')} <ChevronRight size={14} />
                </button>
            </div>
        </motion.div>
    );
}

function GoalSettingStep({ t, onNext }: { t: any, onNext: (ans: any) => void }) {
    const [date, setDate] = useState('');

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-card border border-white/10 p-8 rounded-sm shadow-2xl max-w-lg mx-auto"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                    <Map size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-display text-white">{t('goals.title')}</h3>
                    <p className="text-xs text-white/40">{t('goals.subtitle')}</p>
                </div>
            </div>

            <div className="py-8">
                <label className="block text-xs uppercase tracking-widest text-accent mb-2 font-bold">{t('goals.label_date')}</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-sm focus:border-accent outline-none transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                />
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => onNext(date)}
                    disabled={!date}
                    className="flex items-center gap-2 bg-accent text-nautical-black px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
                >
                    {t('goals.next_btn')} <ChevronRight size={14} />
                </button>
            </div>
        </motion.div>
    );
}

function TourStep({ t, onNext, tourStep, setTourStep }: { t: any, onNext: () => void, tourStep: number, setTourStep: (n: number) => void }) {
    const steps = [
        { id: 'dashboard-profile-sidebar', title: t('tour.step_sidebar'), desc: t('tour.desc_sidebar') },
        { id: 'dashboard-academy-widget', title: t('tour.step_academy'), desc: t('tour.desc_academy') },
        { id: 'dashboard-courses-section', title: t('tour.step_courses'), desc: t('tour.desc_courses') },
        { id: 'dashboard-rentals-section', title: t('tour.step_rentals'), desc: t('tour.desc_rentals') },
    ];

    const current = steps[tourStep];
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        const updateRect = () => {
            const el = document.getElementById(current.id);
            if (el) {
                const r = el.getBoundingClientRect();
                setRect(r);
                // Scroll to element with offset
                const yOffset = -100;
                const y = r.top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        };

        // Initial update
        updateRect();

        // Update on resize
        window.addEventListener('resize', updateRect);

        // Also a small interval to catch layout shifts
        const interval = setInterval(updateRect, 500);

        return () => {
            window.removeEventListener('resize', updateRect);
            clearInterval(interval);
        };
    }, [current.id]);

    const handleNext = () => {
        if (tourStep < steps.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            onNext();
        }
    };

    return (
        <>
            {/* Spotlight Overlay */}
            {rect && (
                <div
                    className="fixed inset-0 z-[-1] transition-all duration-500 ease-in-out pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent ${Math.max(rect.width, rect.height) / 1.5}px, rgba(0,0,0,0.85) ${Math.max(rect.width, rect.height) / 1.3}px)`
                    }}
                />
            )}

            {/* Spotlight Border */}
            {rect && (
                <motion.div
                    layoutId="highlight-box"
                    className="fixed border-2 border-accent rounded-sm pointer-events-none z-[-1] shadow-[0_0_50px_rgba(var(--accent-rgb),0.5)]"
                    style={{
                        top: rect.top - 10,
                        left: rect.left - 10,
                        width: rect.width + 20,
                        height: rect.height + 20,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 30 }}
                />
            )}

            {/* Tooltip Card */}
            <motion.div
                key={tourStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed bg-card border border-white/10 p-6 rounded-sm shadow-2xl max-w-sm z-50"
                style={{
                    // Position logic: prefer bottom, if not enough space, go top.
                    // Simplified: Fixed bottom right or near element if complicated logic avoided
                    top: rect ? (rect.bottom + 40 > window.innerHeight ? rect.top - 200 : rect.bottom + 40) : '50%',
                    left: rect ? Math.max(20, Math.min(window.innerWidth - 340, rect.left)) : '50%',
                    transform: rect ? 'none' : 'translate(-50%, -50%)'
                }}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Step {tourStep + 1}/{steps.length}</span>
                </div>
                <h3 className="text-xl font-display text-white mb-2">{current.title}</h3>
                <p className="text-sm text-white/60 mb-6">{current.desc}</p>
                <div className="flex justify-end">
                    <button
                        onClick={handleNext}
                        className="bg-white text-nautical-black px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                    >
                        {tourStep === steps.length - 1 ? t('tour.finish_btn') : t('tour.next_btn')}
                    </button>
                </div>
            </motion.div>
        </>
    );
}

function MissionStep({ t, onNext }: { t: any, onNext: () => void }) {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-white/10 p-8 md:p-12 rounded-sm shadow-2xl text-center max-w-lg mx-auto"
        >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                <span className="text-2xl">📜</span>
            </div>
            <h2 className="text-2xl font-display text-white mb-4">{t('mission.title')}</h2>
            <p className="text-accent uppercase tracking-widest text-xs font-bold mb-6">{t('mission.subtitle')}</p>

            <div className="bg-white/5 p-6 rounded-sm mb-8 italic text-white/80 font-serif leading-relaxed relative">
                <span className="text-4xl absolute -top-2 -left-2 opacity-20">"</span>
                {t('mission.manifesto')}
                <span className="text-4xl absolute -bottom-6 -right-2 opacity-20">"</span>
            </div>

            <button
                onClick={onNext}
                className="w-full bg-accent text-nautical-black px-8 py-4 rounded-sm font-bold uppercase tracking-widest hover:bg-white transition-all"
            >
                {t('mission.action_btn')}
            </button>
        </motion.div>
    );
}

function BadgeStep({ t, onClose }: { t: any, onClose: () => void }) {
    useEffect(() => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-gradient-to-br from-accent to-yellow-500 p-1 rounded-sm shadow-[0_0_100px_rgba(var(--accent-rgb),0.5)] max-w-md mx-auto relative"
        >
            <div className="bg-nautical-black p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 text-nautical-black shadow-[0_0_30px_rgba(var(--accent-rgb),0.6)] animate-pulse">
                    <Award size={48} />
                </div>

                <h2 className="text-3xl font-display text-white mb-2">{t('badge.title')}</h2>
                <p className="text-white/60 mb-8">{t('badge.subtitle')}</p>

                <button
                    onClick={onClose}
                    className="bg-white text-nautical-black px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                >
                    {t('badge.close_btn')}
                </button>
            </div>
        </motion.div>
    );
}
