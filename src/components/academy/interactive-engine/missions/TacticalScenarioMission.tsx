
import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { useMissionStore } from '../store';
import { MissionData } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const TacticalScenarioMission: React.FC<Props> = ({ data, onComplete }) => {
    const {
        status,
        currentStep,
        totalSteps,
        score,
        startMission,
        submitAnswer,
        nextStep,
        completeMission,
        failMission,
        setFeedback
    } = useMissionStore();

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const scenarios = data.escenarios || [];
    const config = data.config || {};
    const requiredScore = config.required_score || 0.7; // Default 70%

    // 1. Initialize Mission
    useEffect(() => {
        if (scenarios.length > 0) {
            startMission(scenarios.length);
        }
    }, [scenarios.length, startMission]);

    // 2. Handle Scenario Completion Logic
    const handleFinish = useCallback(() => {
        // Calculate percentage based on current accumulated score (assuming 100 max points logic) or steps
        // If we assign e.g. 10 points per Q, max is 10 * totalSteps.
        // Let's assume the store holds accumulated raw points.
        // We will normalize it here for the check.

        // Simpler approach: if we award (100 / totalSteps) per correct answer:
        const maxPossibleScore = 100; // Normalized
        // Current score in store is already accumulated based on submitAnswer logic

        // Safety: get fresh state
        const finalScore = useMissionStore.getState().score;
        const percentage = finalScore / maxPossibleScore;

        if (percentage >= requiredScore - 0.01) { // Float tolerance
            completeMission(finalScore);
            if (onComplete) onComplete(finalScore);
        } else {
            failMission(`Puntuación: ${Math.round(finalScore)}%. Requerido: ${requiredScore * 100}%`);
        }
    }, [requiredScore, completeMission, failMission, onComplete]);

    // 3. User Interaction
    const handleOptionSelect = async (optionIdx: number) => {
        if (isProcessing || status !== 'playing') return;

        setIsProcessing(true);
        setSelectedOption(optionIdx);

        const currentScenario = scenarios[currentStep];
        const isCorrect = optionIdx === currentScenario.correcta;

        // Calculate points for this step
        const stepPoints = 100 / scenarios.length;

        // Submit to store
        submitAnswer(isCorrect, isCorrect ? stepPoints : 0);

        // Visual Feedback via Store (shows globally in MissionFeedback component)
        setFeedback(
            isCorrect ? (currentScenario.feedback_ok || '¡Correcto!') : (currentScenario.feedback_err || 'Incorrecto'),
            isCorrect ? 'success' : 'error'
        );

        // Delay for reading feedback
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Advance
        if (currentStep < totalSteps - 1) {
            nextStep();
            setSelectedOption(null); // Reset local selection
            setIsProcessing(false);
        } else {
            handleFinish();
            // Don't reset processing here, we are done
        }
    };

    const currentScenario = scenarios[currentStep];

    if (!currentScenario) return <div className="text-white/50 text-center p-8">Cargando escenario...</div>;

    return (
        <div className="w-full max-w-3xl mx-auto p-4 flex flex-col items-center">
            {/* Scenario Visualization */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full mb-6"
                >
                    {/* Image Area */}
                    <div className="aspect-video bg-nautical-black/50 rounded-lg overflow-hidden border border-white/10 mb-6 relative group shadow-2xl">
                        {currentScenario.imagen_url ? (
                            <ScenarioImage src={currentScenario.imagen_url} alt="Scenario" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <span className="text-white/20 font-display italic">Sin imagen táctica</span>
                            </div>
                        )}

                        {/* Question Overlay */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12">
                            <h3 className="text-xl md:text-2xl font-display text-white drop-shadow-md">
                                {currentScenario.pregunta}
                            </h3>
                        </div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentScenario.opciones?.map((opt: any, idx: number) => {
                            const isSelected = selectedOption === idx;
                            const showResult = isProcessing && isSelected;
                            const isCorectVisual = idx === currentScenario.correcta; // Only reveal if we want to show correct answer on fail, but let's keep it mystery for now or show on selection

                            // Logic for visual state:
                            // If selected and processing: show Green if correct, Red if wrong
                            let borderClass = 'border-white/10 hover:border-accent/50';
                            let bgClass = 'bg-white/5 hover:bg-white/10';
                            let textClass = 'text-white/80';

                            if (showResult) {
                                if (idx === currentScenario.correcta) {
                                    borderClass = 'border-green-500 bg-green-500/20';
                                    textClass = 'text-green-100';
                                } else {
                                    borderClass = 'border-red-500 bg-red-500/20';
                                    textClass = 'text-red-100';
                                }
                            } else if (isProcessing) {
                                // Dim others
                                bgClass = 'opacity-50';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isProcessing}
                                    className={`
                                        relative group p-6 text-left rounded-lg border backdrop-blur-sm transition-all duration-300
                                        ${borderClass} ${bgClass}
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors
                                            ${showResult
                                                ? (idx === currentScenario.correcta ? 'border-green-400 text-green-400' : 'border-red-400 text-red-400')
                                                : 'border-white/20 text-white/40 group-hover:border-accent group-hover:text-accent'}
                                        `}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-sm font-medium mt-1 ${textClass}`}>
                                            {typeof opt === 'string' ? opt : opt.texto}
                                        </span>
                                    </div>

                                    {/* Selection Indicator */}
                                    {showResult && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {idx === currentScenario.correcta ? '✅' : '❌'}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

function ScenarioImage({ src, alt }: { src: string, alt: string }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
                <span className="text-white/20 font-display italic">Sin imagen táctica</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => setHasError(true)}
        />
    );
}
