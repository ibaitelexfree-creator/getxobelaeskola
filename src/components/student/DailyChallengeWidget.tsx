'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface Challenge {
    id: string;
    pregunta_es: string;
    pregunta_eu: string;
    opciones: string[];
    respuesta_correcta: number;
    explicacion_es: string;
    explicacion_eu: string;
    xp_recompensa: number;
}

interface DailyChallengeWidgetProps {
    locale: string;
}

export default function DailyChallengeWidget({ locale }: DailyChallengeWidgetProps) {
    const t = useTranslations('student_dashboard.daily_challenge');
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [status, setStatus] = useState<'idle' | 'answering' | 'correct' | 'wrong' | 'completed'>('idle');
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [xpAwarded, setXpAwarded] = useState(0);
    const [streak, setStreak] = useState(0);
    const [stats, setStats] = useState({ total_correct: 0, total_attempts: 0 });

    useEffect(() => {
        fetchDailyChallenge();
        fetchUserStats();
    }, []);

    async function fetchUserStats() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: attempts } = await supabase
                .from('intentos_desafios')
                .select('fecha, correcto')
                .eq('perfil_id', user.id)
                .order('fecha', { ascending: false });

            if (attempts && attempts.length > 0) {
                // Calculate streak
                let currentStreak = 0;
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                let checkDate = new Date(attempts[0].fecha);
                checkDate.setHours(0, 0, 0, 0);

                // If last attempt was today or yesterday, check streak
                const diffDays = Math.floor((today.getTime() - checkDate.getTime()) / (1000 * 3600 * 24));

                if (diffDays <= 1) {
                    currentStreak = 1;
                    for (let i = 1; i < attempts.length; i++) {
                        const prevDate = new Date(attempts[i - 1].fecha);
                        const currDate = new Date(attempts[i].fecha);
                        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));

                        if (diff === 1) {
                            currentStreak++;
                        } else {
                            break;
                        }
                    }
                }
                setStreak(currentStreak);

                const totalCorrect = attempts.filter((a: any) => a.correcto).length;
                setStats({
                    total_correct: totalCorrect,
                    total_attempts: attempts.length
                });
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    async function fetchDailyChallenge() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const todayStr = new Date().toISOString().split('T')[0];
            const { data: existingAttempt } = await supabase
                .from('intentos_desafios')
                .select('*')
                .eq('perfil_id', user.id)
                .eq('fecha', todayStr)
                .maybeSingle();

            if (existingAttempt) {
                setStatus('completed');
                setLoading(false);
                return;
            }

            const { data: challenges } = await supabase
                .from('desafios_diarios')
                .select('*')
                .eq('activo', true);

            if (challenges && challenges.length > 0) {
                const day = new Date().getDate();
                setChallenge(challenges[day % challenges.length]);
                setStatus('idle');
            }
        } catch (error) {
            console.error('Error fetching challenge:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit() {
        if (selectedOption === null || !challenge) return;

        setStatus('answering');
        try {
            const { data, error } = await supabase.rpc('completar_desafio_diario', {
                p_desafio_id: challenge.id,
                p_respuesta: selectedOption
            });

            if (error) throw error;

            if (data.success) {
                if (data.correcto) {
                    setStatus('correct');
                    setXpAwarded(data.xp_ganado);
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#c9a050', '#ffffff', '#0a1628']
                    });
                } else {
                    setStatus('wrong');
                }
                fetchUserStats(); // Update streak and stats
            }
        } catch (error) {
            console.error('Error submitting challenge:', error);
            setStatus('idle');
        }
    }

    if (loading) {
        return (
            <div className="bg-card/30 backdrop-blur-md border border-white/5 p-8 h-[380px] flex flex-col justify-center animate-pulse rounded-sm">
                <div className="space-y-4">
                    <div className="h-2 w-16 bg-white/10 mx-auto"></div>
                    <div className="h-6 w-3/4 bg-white/10 mx-auto"></div>
                    <div className="space-y-2 pt-8">
                        <div className="h-12 w-full bg-white/5"></div>
                        <div className="h-12 w-full bg-white/5"></div>
                    </div>
                </div>
            </div>
        );
    }

    const accuracy = stats.total_attempts > 0
        ? Math.round((stats.total_correct / stats.total_attempts) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden group"
        >
            {/* Premium Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f213a] via-[#0a1628] to-[#070e1a] border border-accent/20 rounded-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 blur-[40px] rounded-full -ml-12 -mb-12"></div>

            {/* Animated Compass Icon in BG */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none"
            >
                <div className="w-[300px] h-[300px] border-[1px] border-white rounded-full flex items-center justify-center">
                    <div className="w-full h-[1px] bg-white absolute"></div>
                    <div className="h-full w-[1px] bg-white absolute"></div>
                </div>
            </motion.div>

            <div className="relative z-10 p-8 shadow-2xl">
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                            <h2 className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">{t('title')}</h2>
                        </div>
                        <p className="text-[9px] uppercase tracking-widest text-white/30 font-medium">{t('subtitle')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-black tracking-tighter italic">
                            {streak} DAY STREAK 🔥
                        </div>
                        <div className="text-[8px] uppercase tracking-widest text-white/20">IQ NÁUTICO: {accuracy}%</div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {status === 'completed' ? (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="relative mb-6 inline-block">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-accent blur-xl rounded-full"
                                ></motion.div>
                                <div className="relative w-16 h-16 bg-accent flex items-center justify-center rounded-full text-nautical-black text-2xl shadow-xl">
                                    ⚓
                                </div>
                            </div>
                            <h3 className="text-xl font-display text-white mb-2">{t('already_done')}</h3>
                            <p className="text-white/40 text-xs max-w-[200px] mx-auto leading-relaxed">{t('come_back')}</p>

                            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center gap-8">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-accent">{stats.total_correct}</div>
                                    <div className="text-[8px] uppercase tracking-widest text-white/30">Aciertos</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-accent">{streak}</div>
                                    <div className="text-[8px] uppercase tracking-widest text-white/30">Racha</div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (status === 'correct' || status === 'wrong') ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className={`p-6 rounded-sm border ${status === 'correct'
                                ? 'bg-green-500/5 border-green-500/20 text-green-400'
                                : 'bg-red-500/5 border-red-500/20 text-red-400'
                                }`}>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${status === 'correct' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                                        }`}>
                                        {status === 'correct' ? '✓' : '✗'}
                                    </div>
                                    <p className="text-sm font-bold tracking-tight uppercase">
                                        {status === 'correct' ? t('correct', { xp: xpAwarded }) : t('wrong', { answer: (challenge && challenge.opciones[challenge.respuesta_correcta]) || '' })}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold">{t('explanation')}</div>
                                    <p className="text-xs text-white/70 italic leading-relaxed font-light">
                                        "{locale === 'es' ? challenge?.explicacion_es : challenge?.explicacion_eu}"
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-4 flex justify-between items-center rounded-sm">
                                <div className="text-[9px] uppercase tracking-widest text-white/40 italic">Progreso de Racha</div>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((it) => (
                                        <div
                                            key={it}
                                            className={`w-1.5 h-3 rounded-full ${it <= (streak % 5 || 5) ? 'bg-accent' : 'bg-white/10'}`}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            <p className="text-center text-[9px] uppercase tracking-widest text-white/20 pt-4 cursor-default">
                                {t('come_back')}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="challenge"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <h3 className="text-2xl font-display text-white leading-[1.2] italic underline decoration-accent/20 underline-offset-8">
                                {locale === 'es' ? challenge?.pregunta_es : challenge?.pregunta_eu}
                            </h3>

                            <div className="grid gap-3">
                                {challenge?.opciones.map((opcion, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedOption(index)}
                                        disabled={status === 'answering'}
                                        className={`group/btn w-full text-left p-4 text-xs transition-all border relative overflow-hidden ${selectedOption === index
                                            ? 'border-accent bg-accent/5'
                                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-center justify-between">
                                            <span className={selectedOption === index ? 'text-accent font-bold' : 'text-white/60'}>
                                                {opcion}
                                            </span>
                                            {selectedOption === index && (
                                                <motion.span layoutId="active" className="text-accent">⚓</motion.span>
                                            )}
                                        </div>
                                        {selectedOption === index && (
                                            <motion.div
                                                layoutId="glow"
                                                className="absolute inset-0 bg-accent/10 blur-xl"
                                            ></motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                disabled={selectedOption === null || status === 'answering'}
                                className="w-full py-4 bg-accent text-nautical-black text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_-10px_rgba(var(--accent-rgb),0.5)] transition-all hover:bg-white disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                            >
                                {status === 'answering' ? <span className="animate-pulse">SINCRONIZANDO RUMBO...</span> : t('submit')}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
