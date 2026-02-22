'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Anchor, Map, Award, X, CheckCircle, ChevronRight, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface WelcomeWizardProps {
    onboardingCompleted: boolean;
    userName?: string;
}

export default function WelcomeWizard({ onboardingCompleted, userName }: WelcomeWizardProps) {
    const [isVisible, setIsVisible] = useState(!onboardingCompleted);
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState<{ experience: string | null; goal: string | null }>({
        experience: null,
        goal: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    if (!isVisible) return null;

    const experienceOptions = [
        { id: 'none', label: 'Ninguna', description: 'Nunca he navegado antes', icon: <User className="w-6 h-6" /> },
        { id: 'beginner', label: 'Principiante', description: 'He salido un par de veces', icon: <Anchor className="w-6 h-6" /> },
        { id: 'intermediate', label: 'Intermedio', description: 'Tengo alguna titulación o experiencia', icon: <Ship className="w-6 h-6" /> },
        { id: 'expert', label: 'Experto', description: 'Navego habitualmente', icon: <Map className="w-6 h-6" /> }
    ];

    const goalOptions = [
        { id: 'license', label: 'Obtener Título', description: 'Quiero sacar el PER o PNB', icon: <Award className="w-6 h-6" /> },
        { id: 'learn', label: 'Aprender a Navegar', description: 'Quiero dominar la práctica', icon: <Ship className="w-6 h-6" /> },
        { id: 'improve', label: 'Mejorar Técnica', description: 'Ya tengo título, quiero mejorar', icon: <Anchor className="w-6 h-6" /> },
        { id: 'curiosity', label: 'Solo Curiosidad', description: 'Quiero ver qué ofrece la escuela', icon: <Map className="w-6 h-6" /> }
    ];

    const handleNext = () => {
        if (step === 0 && selections.experience) {
            setStep(1);
        } else if (step === 1 && selections.goal) {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    meta_titulacion: JSON.stringify(selections)
                })
            });

            if (response.ok) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#00f2ea', '#ff0055', '#ffffff']
                });

                // Small delay to show confetti
                setTimeout(() => {
                    setIsVisible(false);
                    router.refresh();
                }, 2000);
            } else {
                console.error('Failed to complete onboarding');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting onboarding:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nautical-black/90 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="w-full max-w-2xl bg-[#0a1628] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                        <div className="p-8 relative z-10">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-display italic text-white mb-2">
                                    ¡Bienvenido a Bordo, <span className="text-accent">{userName?.split(' ')[0] || 'Grumete'}</span>!
                                </h2>
                                <p className="text-white/60">
                                    Configura tu perfil para personalizar tu experiencia de aprendizaje.
                                </p>
                            </div>

                            {/* Steps Indicator */}
                            <div className="flex justify-center gap-2 mb-8">
                                <div className={`h-1 w-12 rounded-full transition-colors ${step >= 0 ? 'bg-accent' : 'bg-white/10'}`} />
                                <div className={`h-1 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-accent' : 'bg-white/10'}`} />
                            </div>

                            {/* Content */}
                            <div className="min-h-[300px]">
                                <AnimatePresence mode="wait">
                                    {step === 0 && (
                                        <motion.div
                                            key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <h3 className="text-xl font-bold text-white mb-6 text-center">¿Cuál es tu experiencia navegando?</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {experienceOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => setSelections({ ...selections, experience: option.id })}
                                                        className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                                                            selections.experience === option.id
                                                                ? 'bg-accent/10 border-accent text-white'
                                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        <div className={`mb-3 ${selections.experience === option.id ? 'text-accent' : 'text-white/40'}`}>
                                                            {option.icon}
                                                        </div>
                                                        <div className="font-bold mb-1">{option.label}</div>
                                                        <div className="text-xs opacity-70">{option.description}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 1 && (
                                        <motion.div
                                            key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <h3 className="text-xl font-bold text-white mb-6 text-center">¿Cuál es tu objetivo principal?</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {goalOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => setSelections({ ...selections, goal: option.id })}
                                                        className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                                                            selections.goal === option.id
                                                                ? 'bg-accent/10 border-accent text-white'
                                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        <div className={`mb-3 ${selections.goal === option.id ? 'text-accent' : 'text-white/40'}`}>
                                                            {option.icon}
                                                        </div>
                                                        <div className="font-bold mb-1">{option.label}</div>
                                                        <div className="text-xs opacity-70">{option.description}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
                                <button
                                    onClick={handleNext}
                                    disabled={step === 0 ? !selections.experience : !selections.goal || isSubmitting}
                                    className={`
                                        px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all
                                        ${(step === 0 ? !selections.experience : !selections.goal)
                                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                            : 'bg-accent text-nautical-black hover:bg-accent/90 hover:scale-105 shadow-[0_0_20px_rgba(0,242,234,0.3)]'
                                        }
                                    `}
                                >
                                    {isSubmitting ? 'Guardando...' : step === 1 ? 'Finalizar' : 'Siguiente'}
                                    {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
