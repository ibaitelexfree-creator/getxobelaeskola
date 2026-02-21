
'use client';

import React, { useEffect, useRef } from 'react';
import { useMissionStore } from './store';
import { MissionData } from './types';
import { MissionHeader } from './MissionHeader';
import { MissionCanvas } from './MissionCanvas'; // The Factory
import { MissionFeedback } from './MissionFeedback';
import MissionErrorBoundary from './MissionErrorBoundary';
import { createClient } from '@/lib/supabase/client';
import { getMissionProgress, saveMissionProgress } from '@/lib/services/mission-progress';

interface InteractiveMissionProps {
    data: MissionData;
    onComplete?: (score: number) => void;
}

export const InteractiveMission: React.FC<InteractiveMissionProps> = ({
    data,
    onComplete
}) => {
    // Access store actions and state
    const {
        startMission,
        reset,
        status,
        score,
        currentStepId,
        history,
        restoreProgress,
        setFeedback
    } = useMissionStore();

    // Use a ref to track if we should save (avoid saving initial empty state)
    const isLoadedRef = useRef(false);

    // Reset and Initialize on mount or data change
    useEffect(() => {
        reset();
        // Identify mission type and potential max score from data if needed
        startMission();
        isLoadedRef.current = false;

        const loadProgress = async () => {
            if (!data.id) return;

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                try {
                    const saved = await getMissionProgress(user.id, data.id);
                    if (saved) {
                        console.log('Restoring mission progress:', saved);
                        restoreProgress({
                            currentStepId: saved.currentStepId,
                            score: saved.score,
                            status: saved.status,
                            history: saved.history
                        });
                    }
                } catch (err) {
                    console.error('Failed to load mission progress', err);
                }
            }
            isLoadedRef.current = true;
        };

        loadProgress();

        return () => reset(); // Cleanup
    }, [data, reset, startMission, restoreProgress]);

    // Handle Completion
    useEffect(() => {
        if (status === 'completed' && onComplete) {
            onComplete(score);
        }
    }, [status, score, onComplete]);

    // Auto-Save Effect
    useEffect(() => {
        if (!isLoadedRef.current || !data.id) return;

        const save = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Determine step ID to save: currentStepId for graph, or convert index to string for linear?
                // For linear missions, currentStepId might be null. We can save just the score/status/history.
                // But our service expects currentStepId.

                await saveMissionProgress(user.id, data.id, {
                    score,
                    status,
                    currentStepId: currentStepId,
                    history
                });
            }
        };

        const timer = setTimeout(save, 1000); // Debounce 1s
        return () => clearTimeout(timer);
    }, [score, status, currentStepId, history, data.id]);

    if (!data || !data.tipo_contenido) {
        return <div className="p-4 text-red-500">Error: Invalid Mission Data</div>;
    }

    return (
        <MissionErrorBoundary>
            <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-white/10 bg-nautical-black/50 backdrop-blur-sm shadow-2xl">
                {/* Header: Title, Score, Status */}
                <MissionHeader
                    title={data.titulo || 'Misión Interactiva'}
                    timerSeconds={data.config?.timer_seconds || 0}
                />

                {/* Main Game Area: Dynamic Component based on Type */}
                <div className="relative min-h-[400px] flex flex-col">
                    <MissionCanvas missionData={data} onComplete={(score) => {
                        // This handles internal completion logic if needed, 
                        // but the store action 'completeMission' usually triggers the status change
                        // which then triggers the useEffect above.
                        // However, some missions might call this prop directly.
                    }} />
                </div>

                {/* Feedback Overlay: Success/Fail messages */}
                <MissionFeedback
                    onRetry={() => {
                        reset();
                        startMission();
                    }}
                    onNext={() => {
                        // Optional: Navigate to next unit or close modal
                        console.log('Next clicked');
                    }}
                />
            </div>
        </MissionErrorBoundary>
    );
};
