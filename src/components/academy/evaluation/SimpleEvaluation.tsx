import React, { useEffect, useState } from 'react';
import { useEvaluation } from './useEvaluation';
import CooldownScreen from './CooldownScreen';
import QuizView from './QuizView';
import ResultScreen from './ResultScreen';

interface SimpleEvaluationProps {
    evaluacionId?: string; // ID directo de la evaluación (opcional)
    entidadTipo?: 'unidad' | 'modulo' | 'curso'; // Para buscar por entidad
    entidadId?: string; // ID de la entidad
    titulo: string;
    onComplete?: () => void;
}

/**
 * Componente simplificado listo para usar en cualquier página.
 * Maneja automáticamente todos los estados incluyendo bloqueos.
 * 
 * Puede recibir:
 * 1. evaluacionId directo
 * 2. entidadTipo + entidadId para buscar la evaluación automáticamente
 * 
 * @example
 * <SimpleEvaluation 
 *   entidadTipo="unidad"
 *   entidadId={unidad.id}
 *   titulo="Quiz: Seguridad en el Mar"
 *   on Complete={() => router.push('/dashboard')}
 * />
 */
export default function SimpleEvaluation({ evaluacionId, entidadTipo, entidadId, titulo, onComplete }: SimpleEvaluationProps) {
    const [realEvaluacionId, setRealEvaluacionId] = useState<string | null>(evaluacionId || null);
    const [buscandoEvaluacion, setBuscandoEvaluacion] = useState(!evaluacionId);
    const [error, setError] = useState<string | null>(null);

    // Buscar evaluación si se proporcionó entidad
    useEffect(() => {
        async function buscarEvaluacion() {
            if (evaluacionId || !entidadTipo || !entidadId) {
                setBuscandoEvaluacion(false);
                return;
            }

            try {
                const res = await fetch(`/api/academy/evaluaciones?entidad_tipo=${entidadTipo}&entidad_id=${entidadId}`);
                const data = await res.json();

                if (data.error || !data.id) {
                    setError('No se encontró una evaluación para esta entidad');
                    setBuscandoEvaluacion(false);
                    return;
                }

                setRealEvaluacionId(data.id);
            } catch (err) {
                setError('Error al buscar la evaluación');
            } finally {
                setBuscandoEvaluacion(false);
            }
        }

        buscarEvaluacion();
    }, [evaluacionId, entidadTipo, entidadId]);

    const {
        state,
        startEvaluation,
        submitAnswer,
        submitEvaluation,
        resetEvaluation,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        isBlocked,
        isLoading,
        isResumed,
        lastSaved
    } = useEvaluation({ evaluacionId: realEvaluacionId || '', onComplete });

    // Buscando evaluación
    if (buscandoEvaluacion) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
                <p className="mt-4 text-white/60">
                    Cargando evaluación...
                </p>
            </div>
        );
    }

    // Error al buscar evaluación
    if (error || !realEvaluacionId) {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-bold text-red-400 mb-2">Evaluación No Disponible</h3>
                <p className="text-red-300 mb-4">{error || 'No se pudo cargar la evaluación'}</p>
            </div>
        );
    }

    // Estado: Bloqueado (cooldown o límite de intentos)
    if (isBlocked && state.blockInfo) {
        return (
            <div className="max-w-2xl mx-auto">
                <CooldownScreen
                    reason={state.blockInfo.reason}
                    retryAfterSeconds={state.blockInfo.retry_after_seconds}
                    onRetry={startEvaluation}
                />
            </div>
        );
    }

    // Estado: Inicial
    if (state.status === 'idle') {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-card rounded-lg border border-border shadow-lg">
                <h2 className="text-2xl font-bold text-foreground mb-4">{titulo}</h2>
                <p className="text-muted-foreground mb-6">
                    Estás a punto de comenzar la evaluación. Asegúrate de tener suficiente tiempo para completarla.
                </p>
                <button
                    onClick={startEvaluation}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
                >
                    Comenzar Evaluación
                </button>
            </div>
        );
    }

    // Estado: Cargando
    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-4 text-gray-400">
                    {state.status === 'loading' ? 'Preparando evaluación...' : 'Enviando respuestas...'}
                </p>
            </div>
        );
    }

    // Estado: Quiz activo
    if (state.status === 'active' && state.questions.length > 0) {
        const currentQuestion = state.questions[state.currentQuestionIndex];

        const handleAnswer = (answer: string) => {
            submitAnswer(currentQuestion.id, answer);

            // Auto-avanzar a la siguiente si no es la última
            if (state.currentQuestionIndex + 1 < state.questions.length) {
                setTimeout(() => {
                    nextQuestion();
                }, 300);
            }
        };
        const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;
        const allQuestionsAnswered = Object.keys(state.answers).length === state.questions.length;

        return (
            <div className="relative">
                {/* Indicador de reanudación */}
                {isResumed && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-3 text-sm animate-in slide-in-from-top duration-500">
                        <span className="text-xl">📋</span>
                        <span className="text-blue-300">
                            Se ha reanudado tu intento anterior. Tienes {Object.keys(state.answers).length} respuesta(s) guardada(s).
                        </span>
                    </div>
                )}

                <QuizView
                    question={currentQuestion}
                    allQuestionIds={state.questions.map(q => q.id)}
                    currentQuestionIndex={state.currentQuestionIndex}
                    totalQuestions={state.questions.length}
                    onAnswer={handleAnswer}
                    isSubmitting={isLoading}
                    timeLeft={state.timeLeft}
                    durationSecs={state.durationSecs}
                    answers={state.answers}
                    onNavigate={goToQuestion}
                    onSubmit={submitEvaluation}
                    lastSaved={lastSaved}
                />

                {/* Controles de Navegación */}
                <div className="max-w-2xl mx-auto mt-8 flex items-center justify-between gap-4">
                    <button
                        onClick={prevQuestion}
                        disabled={state.currentQuestionIndex === 0}
                        className="px-6 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                        ← Anterior
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={() => submitEvaluation()}
                            disabled={!allQuestionsAnswered || isLoading}
                            className={`px-10 py-3 rounded-lg font-bold uppercase tracking-wider transition-all
                                ${allQuestionsAnswered
                                    ? 'bg-accent text-nautical-black hover:scale-105 shadow-lg shadow-accent/20'
                                    : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'}`}
                        >
                            {isLoading ? 'Enviando...' : 'Finalizar Evaluación'}
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="px-6 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all"
                        >
                            Siguiente →
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Estado: Completado
    if (state.status === 'complete' && state.result) {
        return (
            <div className="max-w-2xl mx-auto">
                <ResultScreen
                    result={state.result}
                    onRetry={startEvaluation}
                    onClose={onComplete || (() => { })}
                />
            </div>
        );
    }

    // Estado: Error
    if (state.status === 'error') {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h3 className="text-lg font-bold text-red-400 mb-2">Error</h3>
                <p className="text-red-300 mb-4">{state.errorMessage || 'Ha ocurrido un error inesperado'}</p>
                <button
                    onClick={startEvaluation}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return null;
}
