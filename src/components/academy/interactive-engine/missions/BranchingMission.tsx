
'use client';

import React, { useState, useEffect } from 'react';
import {
    BranchingMissionData,
    MissionStep,
    MissionProgress
} from '../types';
import { InfoStep } from './steps/InfoStep';
import { QuestionStep } from './steps/QuestionStep';
import { VideoStep } from './steps/VideoStep';
import { SummaryStep } from './steps/SummaryStep';
import { calculateNextState, isTerminalStep } from '@/lib/academy/mission-logic';
import { saveUserProgress, getUserProgress } from '@/lib/academy/missions';
import { createClient } from '@/lib/supabase/client';

interface BranchingMissionProps {
    data: BranchingMissionData;
    onComplete?: (score: number) => void;
}

export default function BranchingMission({ data, onComplete }: BranchingMissionProps) {
    const [currentStepId, setCurrentStepId] = useState<string>(data.initial_step_id);
    const [progress, setProgress] = useState<MissionProgress | null>(null);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        const loadProgress = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user && data.id) {
                // Fetch progress
                const savedProgress = await getUserProgress(data.id, user.id);
                if (savedProgress) {
                    setProgress(savedProgress);
                    setCurrentStepId(savedProgress.current_step_id || data.initial_step_id);
                    setScore(savedProgress.score || 0);
                }
            }
            setLoading(false);
        };
        loadProgress();
    }, [data.id, data.initial_step_id]);

    // Step Rendering Logic
    const currentStep = data.steps?.find((s: any) => s.id === currentStepId);

    const handleOptionSelect = async (optionIndex: number) => {
        if (!currentStep) return;

        // 1. Calculate Logic
        const { nextStepId, scoreDelta, feedback: optionFeedback } = calculateNextState(currentStep, optionIndex);

        // 2. Update Local State
        const newScore = score + scoreDelta;
        setScore(newScore);
        if (optionFeedback) setFeedback(optionFeedback);

        // 3. Update Server (Optimistic)
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user && data.id) {
            const historyEntry = {
                step_id: currentStepId,
                answer_idx: optionIndex,
                score_delta: scoreDelta,
                timestamp: new Date().toISOString()
            };

            const newProgressPayload = {
                user_id: user.id,
                mission_id: data.id,
                current_step_id: nextStepId || currentStepId, // Stay if null (terminal)
                status: !nextStepId ? 'completed' : 'started',
                score: newScore,
                history: [...(progress?.history || []), historyEntry] // Append history
            };

            // Non-blocking save
            saveUserProgress(newProgressPayload).catch(console.error);
        }

        // 4. Transition
        if (nextStepId) {
            // Delay for feedback if needed
            if (optionFeedback) {
                setTimeout(() => {
                    setFeedback(null);
                    setCurrentStepId(nextStepId);
                }, 1500);
            } else {
                setCurrentStepId(nextStepId);
            }
        } else {
            // Terminal State
            if (onComplete) onComplete(newScore);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-white/50 animate-pulse">Cargando misión...</div>;
    }

    if (!currentStep) {
        return (
            <div className="p-8 text-center border border-red-500/30 rounded bg-red-900/10">
                <h3 className="text-red-400 font-bold">Error de Misión</h3>
                <p className="text-white/60">No se encontró el paso actual ({currentStepId})</p>
                <button
                    onClick={() => setCurrentStepId(data.initial_step_id)}
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
                >
                    Reiniciar
                </button>
            </div>
        );
    }

    // Feedback Overlay
    const FeedbackOverlay = feedback && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-8 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-nautical-black border border-accent p-8 rounded shadow-2xl max-w-md text-center">
                <div className="text-4xl mb-4 text-accent">ℹ️</div>
                <p className="text-xl text-white font-medium mb-2">{feedback}</p>
                <p className="text-sm text-white/50 animate-pulse">Cargando siguiente paso...</p>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-[400px] bg-nautical-black/50 p-8 rounded-lg border border-white/5">
            {FeedbackOverlay}

            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <span className="text-xs font-mono text-accent tracking-widest">
                    PASO: {currentStep.position || '?'} / {data.steps?.length || '?'}
                </span>
                <span className="text-xs font-mono text-white/60 tracking-widest">
                    PUNTOS: <span className="text-white">{score}</span>
                </span>
            </div>

            <div className="mission-content transition-opacity duration-300">
                {currentStep.type === 'info' && (
                    <InfoStep step={currentStep} onOptionSelect={handleOptionSelect} />
                )}
                {currentStep.type === 'question' && (
                    <QuestionStep step={currentStep} onOptionSelect={handleOptionSelect} />
                )}
                {currentStep.type === 'video' && (
                    <VideoStep step={currentStep} onOptionSelect={handleOptionSelect} />
                )}
                {currentStep.type === 'summary' && (
                    <SummaryStep step={currentStep} onOptionSelect={() => {
                        // Reset or close
                        if (onComplete) onComplete(score);
                    }} />
                )}
            </div>
        </div>
    );
}
