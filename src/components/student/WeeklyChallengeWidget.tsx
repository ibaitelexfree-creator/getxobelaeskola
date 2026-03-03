'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface WeeklyChallenge {
    id: string;
    start_date: string;
    end_date: string;
    template: {
        type: string;
        target_count: number;
        target_score?: number;
        description_es: string;
        description_eu: string;
        xp_reward: number;
    };
}

interface UserProgress {
    id: string;
    current_value: number;
    completed: boolean;
    reward_claimed: boolean;
}

interface WeeklyChallengeWidgetProps {
    locale: string;
}

export default function WeeklyChallengeWidget({ locale }: WeeklyChallengeWidgetProps) {
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState<WeeklyChallenge | null>(null);
    const [progress, setProgress] = useState<UserProgress | null>(null);

    useEffect(() => {
        fetchWeeklyChallenge();
    }, []);

    async function fetchWeeklyChallenge() {
        try {
            setLoading(true);
            const res = await fetch('/api/student/weekly-challenge');
            if (!res.ok) throw new Error('Failed to fetch challenge');
            const data = await res.json();

            setChallenge(data.challenge);
            setProgress(data.progress);

            // Handle Completion Celebration
            if (data.progress?.completed && !data.progress?.reward_claimed) {
                triggerCelebration();
                markAsClaimed();
            }
        } catch (error) {
            console.error('Error fetching weekly challenge:', error);
        } finally {
            setLoading(false);
        }
    }

    function triggerCelebration() {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }

    async function markAsClaimed() {
        try {
            await fetch('/api/student/weekly-challenge/claim', { method: 'POST' });
            setProgress(prev => prev ? { ...prev, reward_claimed: true } : null);
        } catch (error) {
            console.error('Error claiming reward:', error);
        }
    }

    if (loading) {
        return (
            <div className="bg-card/30 backdrop-blur-md border border-white/5 p-6 h-[200px] flex flex-col justify-center animate-pulse rounded-sm w-full">
                <div className="space-y-4">
                    <div className="h-2 w-16 bg-white/10 mx-auto"></div>
                    <div className="h-4 w-3/4 bg-white/10 mx-auto"></div>
                    <div className="h-2 w-full bg-white/5 mt-4"></div>
                </div>
            </div>
        );
    }

    if (!challenge) return null;

    const { template, start_date, end_date } = challenge;
    const description = locale === 'es' ? template.description_es : template.description_eu;
    const target = template.type === 'quiz_score' ? (template.target_count || 1) : template.target_count;
    const current = progress?.current_value || 0;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const isCompleted = progress?.completed || false;

    // Date Formatting
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-ES' : 'eu-ES', { day: 'numeric', month: 'short' });
    };

    const weekLabel = `${formatDate(start_date)} - ${formatDate(end_date)}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group bg-card border border-card-border p-6 rounded-sm w-full shadow-lg"
        >
             {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700"></div>

            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <header className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                            <h2 className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">
                                {locale === 'es' ? 'Reto Semanal' : 'Asteko Erronka'}
                            </h2>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-white/30 font-medium">
                            {weekLabel}
                        </p>
                    </div>
                    {isCompleted && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[9px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1"
                        >
                            <span>✓</span> {locale === 'es' ? 'Completado' : 'Osatuta'}
                        </motion.div>
                    )}
                </header>

                <div>
                    <h3 className="text-lg font-display text-white mb-2 leading-tight">
                        {description}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40 uppercase tracking-wide">
                            {locale === 'es' ? 'Recompensa:' : 'Saria:'}
                        </span>
                        <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full border border-yellow-400/20">
                            +{template.xp_reward} XP
                        </span>
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-white/50">
                        <span>{locale === 'es' ? 'Progreso' : 'Aurrerapena'}</span>
                        <span className={isCompleted ? "text-green-400" : ""}>{current} / {target}</span>
                    </div>

                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'} relative`}
                        >
                            {isCompleted && (
                                <motion.div
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="absolute inset-0 bg-white/30"
                                />
                            )}
                        </motion.div>
                    </div>
                </div>

                {isCompleted && (
                    <motion.div
                        initial={{ scale: 0, rotate: 0 }}
                        animate={{ scale: 1, rotate: 12 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="absolute bottom-4 right-4 text-5xl opacity-10 pointer-events-none select-none"
                    >
                        🏆
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
