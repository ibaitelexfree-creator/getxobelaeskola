
'use client';

import React, { useEffect, useState } from 'react';
import { useMissionStore } from '../store';
import { GraphMissionData, MissionOption } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    data: GraphMissionData;
    onComplete?: (score: number) => void;
}

export const BranchingScenarioMission: React.FC<Props> = ({ data, onComplete }) => {
    const {
        startMission,
        currentStepId,
        score,
        submitAnswer,
        goToStep,
        completeMission,
        failMission,
        setFeedback,
        status
    } = useMissionStore();

    const [isProcessing, setIsProcessing] = useState(false);

    // Initialize
    useEffect(() => {
        // If we are already playing and have a step ID (restored state), don't restart.
        // If status is idle or we are missing step ID, init.
        if (status === 'idle' || (!currentStepId && data.initial_step_id)) {
            const total = data.steps ? Object.keys(data.steps).length : 1;
            startMission(total, data.initial_step_id);
        }
    }, [data, startMission, status, currentStepId]);

    const handleOptionSelect = async (option: MissionOption) => {
        if (isProcessing) return;
        setIsProcessing(true);

        // 1. Evaluate Score
        // If 'is_correct' is explicitly boolean, use it. Otherwise assume neutral/info step unless score > 0.
        const isCorrect = option.is_correct !== undefined ? option.is_correct : true;
        const points = option.score_impact || 0;

        submitAnswer(isCorrect, points);

        // 2. Feedback
        if (option.feedback) {
            setFeedback(
                option.feedback,
                isCorrect ? 'success' : (points < 0 ? 'error' : 'info')
            );
            // Wait for feedback reading
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        // 3. Navigation
        if (option.next_step_id) {
            // Check if step exists
            if (data.steps && data.steps[option.next_step_id]) {
                goToStep(option.next_step_id);
            } else {
                console.error(`Step ${option.next_step_id} not found`);
                failMission('Error de navegación: paso no encontrado.');
            }
        } else {
            // End of line
            // You might want to check if score is sufficient here
            completeMission();
            if (onComplete) onComplete(score + points); // passing updated score estimate
        }

        setIsProcessing(false);
    };

    if (!currentStepId || !data.steps || !data.steps[currentStepId]) {
        return (
            <div className="p-8 text-center">
                <p className="text-white/50 animate-pulse">Cargando situación...</p>
            </div>
        );
    }

    const currentStep = data.steps[currentStepId];

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStepId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    {/* Media / Content Area */}
                    <div className="bg-nautical-black/50 rounded-xl overflow-hidden border border-white/10 mb-6 shadow-2xl">
                        {currentStep.media_url && (
                            <div className="aspect-video w-full relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={currentStep.media_url}
                                    alt="Scenario Visual"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-nautical-black via-transparent to-transparent" />
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            <h3 className="text-xl md:text-2xl font-display text-white mb-4 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: currentStep.content }} />
                            </h3>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {currentStep.options?.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleOptionSelect(opt)}
                                disabled={isProcessing}
                                className={`
                                    group relative p-5 text-left rounded-lg border border-white/10 bg-white/5
                                    hover:bg-accent/10 hover:border-accent/50 transition-all duration-300
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent/50 group-hover:bg-accent transition-colors" />
                                    <span className="text-white/90 font-medium group-hover:text-white">
                                        {opt.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
