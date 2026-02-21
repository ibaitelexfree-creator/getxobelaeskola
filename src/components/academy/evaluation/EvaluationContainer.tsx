import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import CooldownScreen from './CooldownScreen';
import ResultScreen from './ResultScreen';
import QuizView from './QuizView';
import { useEvaluation } from './useEvaluation';

interface EvaluationContainerProps {
    evaluationId: string;
    onComplete?: () => void;
    onClose?: () => void;
}

/**
 * Contenedor principal de evaluaciones que orquestra el flujo completo
 * usando el hook useEvaluation.
 */
export default function EvaluationContainer({
    evaluationId,
    onComplete,
    onClose
}: EvaluationContainerProps) {
    const router = useRouter();

    const {
        state,
        startEvaluation,
        submitAnswer,
        submitEvaluation,
        goToQuestion,
        isLoading,
        isActive,
        isBlocked,
        lastSaved
    } = useEvaluation({
        evaluacionId: evaluationId,
        onComplete: onComplete,
        onError: (err) => console.error('Evaluation error:', err)
    });

    // Carga inicial
    useEffect(() => {
        if (evaluationId && state.status === 'idle') {
            startEvaluation();
        }
    }, [evaluationId, state.status, startEvaluation]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    /* -------------------------------------------------------------------------
       RENDER
       ------------------------------------------------------------------------- */

    // ERROR
    if (state.status === 'error') {
        return (
            <div className="p-12 text-center space-y-6 bg-red-500/5 rounded-3xl border border-red-500/20 backdrop-blur-md">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-3xl">⚠️</span>
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-red-400 uppercase tracking-wider">Error de Sistema</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">{state.errorMessage}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-2xs font-bold uppercase tracking-widest transition-all border border-white/10"
                >
                    Volver Atrás
                </button>
            </div>
        );
    }

    // LOADING (Solo carga inicial profunda, no submitting)
    if (state.status === 'loading') {
        return (
            <div className="relative w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <Image
                    src="/images/legacy/evaluation-loading-compass.jpg"
                    alt="Iniciando evaluación..."
                    fill
                    className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[10s]"
                />
                <div className="absolute inset-0 bg-nautical-black/60 backdrop-blur-[2px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-16 h-16 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-8" />
                    <h3 className="text-2xl font-display italic text-white mb-2 tracking-wide">Preparando Travesía</h3>
                    <p className="text-white/70 text-2xs uppercase tracking-[0.3em] font-black">Validando cartas náuticas...</p>
                </div>
            </div>
        );
    }

    // BLOCKED (Cooldown o Máx Intentos)
    if (isBlocked && state.blockInfo) {
        return (
            <CooldownScreen
                reason={state.blockInfo.reason}
                retryAfterSeconds={state.blockInfo.retry_after_seconds}
                onRetry={startEvaluation}
            />
        );
    }

    // RESULT (Resumen final)
    if (state.status === 'complete' && state.result) {
        return (
            <ResultScreen
                result={state.result}
                onRetry={startEvaluation}
                onClose={handleClose}
                attemptId={state.attemptId}
            />
        );
    }

    // ACTIVE (Quiz en curso)
    if (isActive || state.status === 'submitting') {
        const question = state.questions[state.currentQuestionIndex];

        if (!question) return null;

        return (
            <QuizView
                question={question}
                allQuestionIds={state.questions.map(q => q.id)}
                currentQuestionIndex={state.currentQuestionIndex}
                totalQuestions={state.questions.length}
                onAnswer={(answer) => submitAnswer(question.id, answer)}
                isSubmitting={state.status === 'submitting'}
                timeLeft={state.timeLeft}
                durationSecs={state.durationSecs}
                answers={state.answers}
                onNavigate={goToQuestion}
                onSubmit={submitEvaluation}
                lastSaved={lastSaved}
            />
        );
    }

    return null;
}
