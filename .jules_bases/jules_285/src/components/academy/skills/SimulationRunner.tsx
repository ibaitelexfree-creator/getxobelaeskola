
import React, { useEffect } from 'react';
import { useSimulation } from './useSimulation';
import QuizView from '@/components/academy/evaluation/QuizView';
import ResultScreen from '@/components/academy/evaluation/ResultScreen';

interface SimulationRunnerProps {
    onExit: () => void;
}

export default function SimulationRunner({ onExit }: SimulationRunnerProps) {
    const {
        state,
        startSimulation,
        submitAnswer,
        submitSimulation,
        goToQuestion
    } = useSimulation();

    // Start on mount
    useEffect(() => {
        startSimulation();
    }, [startSimulation]);

    if (state.status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                <p className="text-white/60 text-sm uppercase tracking-widest animate-pulse">Generando Examen Simulado...</p>
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-4">
                <div className="text-4xl">⚠️</div>
                <h3 className="text-xl font-bold text-red-400">Error al cargar la simulación</h3>
                <p className="text-white/60">{state.errorMessage}</p>
                <button
                    onClick={onExit}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                >
                    Volver
                </button>
            </div>
        );
    }

    if (state.status === 'complete' && state.result) {
        return (
            <div className="min-h-screen pt-20">
                <ResultScreen
                    result={state.result}
                    onRetry={startSimulation}
                    onClose={onExit}
                />
            </div>
        );
    }

    if (state.questions.length > 0) {
         return (
            <div className="min-h-screen pt-24 pb-20 px-6">
                <QuizView
                    question={state.questions[state.currentQuestionIndex]}
                    allQuestionIds={state.questions.map(q => q.id)}
                    currentQuestionIndex={state.currentQuestionIndex}
                    totalQuestions={state.questions.length}
                    onAnswer={(ans) => {
                        submitAnswer(state.questions[state.currentQuestionIndex].id, ans);
                    }}
                    isSubmitting={state.status === 'submitting'}
                    timeLeft={state.timeLeft}
                    durationSecs={state.durationSecs}
                    answers={state.answers}
                    onNavigate={goToQuestion}
                    onSubmit={submitSimulation}
                />
            </div>
        );
    }

    return null;
}
