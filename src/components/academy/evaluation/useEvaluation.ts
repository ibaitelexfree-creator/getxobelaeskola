import { useState, useCallback, useRef, useEffect } from 'react';
import { EvaluationState, BlockReason, Question, DetailedResult } from './types';
import { getMotivationalMessage } from '@/lib/academy/motivational-messages';
import { apiUrl } from '@/lib/api';

interface UseEvaluationOptions {
    evaluacionId: string;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

interface UseEvaluationReturn {
    state: EvaluationState;
    startEvaluation: () => Promise<void>;
    submitAnswer: (questionId: string, answer: string) => void;
    submitEvaluation: () => Promise<void>;
    resetEvaluation: () => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    goToQuestion: (index: number) => void;
    isBlocked: boolean;
    isLoading: boolean;
    isActive: boolean;
    isResumed: boolean;
    lastSaved: string | null;
}

const AUTOSAVE_DEBOUNCE_MS = 2000;

/**
 * Hook personalizado para manejar evaluaciones con soporte completo de:
 * - Cooldowns y límites de intentos
 * - Reanudación de intentos en progreso
 * - Autoguardado de respuestas con debounce
 * - Recuperación al recargar la página
 */
export function useEvaluation({ evaluacionId, onComplete, onError }: UseEvaluationOptions): UseEvaluationReturn {
    const [state, setState] = useState<EvaluationState>({
        status: 'idle',
        evaluacionId,
        questions: [],
        currentQuestionIndex: 0,
        answers: {}
    });

    const [isResumed, setIsResumed] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);

    // Refs para autosave
    const pendingAnswersRef = useRef<Record<string, string>>({});
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const attemptIdRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    // Mantener attemptId en ref para acceso en listeners
    useEffect(() => {
        attemptIdRef.current = state.attemptId || null;
    }, [state.attemptId]);

    // Cleanup al desmontar
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    /**
     * Envía las respuestas pendientes al backend (autosave)
     */
    const flushAutosave = useCallback(async () => {
        const pending = { ...pendingAnswersRef.current };
        const intentoId = attemptIdRef.current;

        if (Object.keys(pending).length === 0 || !intentoId) return;

        // Limpiar el buffer antes de enviar
        pendingAnswersRef.current = {};

        try {
            const response = await fetch(apiUrl('/api/academy/evaluation/autosave'), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    intento_id: intentoId,
                    respuestas: pending
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.saved && isMountedRef.current) {
                    setLastSaved(data.timestamp);
                }
            }
        } catch {
            // Si falla el autosave, re-agregar al buffer para reintentar
            pendingAnswersRef.current = {
                ...pending,
                ...pendingAnswersRef.current
            };
        }
    }, []);

    /**
     * Envía todas las respuestas al backend (finalizar evaluación)
     */
    const submitEvaluation = useCallback(async () => {
        if (!attemptIdRef.current) {
            onError?.('No hay un intento activo');
            return;
        }

        // Flush inmediato antes de submit final
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        await flushAutosave();

        setState(prev => ({ ...prev, status: 'submitting' }));

        try {
            const response = await fetch(apiUrl('/api/academy/evaluation/submit'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    intento_id: attemptIdRef.current,
                    respuestas: state.answers,
                    tiempo_empleado_seg: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Mapear detalles de resultados si están disponibles
            const details: DetailedResult[] = state.questions.map(q => {
                const correctInfo = data.respuestas_correctas?.find((rc: any) => rc.id === q.id);
                const userAnswer = state.answers[q.id];
                return {
                    questionId: q.id,
                    enunciado_es: q.enunciado_es,
                    enunciado_eu: q.enunciado_eu,
                    userAnswer: userAnswer,
                    correctAnswer: correctInfo?.respuesta_correcta || '',
                    isCorrect: userAnswer === correctInfo?.respuesta_correcta,
                    explicacion_es: correctInfo?.explicacion_es,
                    explicacion_eu: correctInfo?.explicacion_eu
                };
            });

            // Determine motivational message
            let feedback = '';
            if (data.aprobado) {
                feedback = getMotivationalMessage('quiz_passed', data.puntuacion);
            } else {
                feedback = getMotivationalMessage('quiz_failed');
            }

            setState(prev => ({
                ...prev,
                status: 'complete',
                result: {
                    passed: data.aprobado,
                    score: data.puntuacion,
                    pointsObtained: data.puntos_obtenidos,
                    pointsTotal: data.puntos_totales,
                    feedback,
                    details
                }
            }));



            if (data.aprobado) {
                onComplete?.();
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            setState(prev => ({
                ...prev,
                status: 'error',
                errorMessage: `Error al enviar evaluación: ${errorMsg}`
            }));
            onError?.(errorMsg);
        }
    }, [state.answers, state.questions, startTime, onComplete, onError, flushAutosave]);

    // Temporizador
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (state.status === 'active' && state.timeLeft !== undefined && state.timeLeft > 0) {
            timer = setInterval(() => {
                setState(prev => {
                    if (prev.timeLeft !== undefined && prev.timeLeft <= 1) {
                        clearInterval(timer);
                        // Auto-enviar si el tiempo se agota
                        if (prev.status === 'active') {
                            setTimeout(() => submitEvaluation(), 0);
                        }
                        return { ...prev, timeLeft: 0 };
                    }
                    return { ...prev, timeLeft: (prev.timeLeft || 0) - 1 };
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [state.status, state.timeLeft === undefined, submitEvaluation]);

    /**
     * Programa un autosave con debounce
     */
    const scheduleAutosave = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            flushAutosave();
        }, AUTOSAVE_DEBOUNCE_MS);
    }, [flushAutosave]);

    // Listeners de visibilitychange y beforeunload para flush inmediato
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && attemptIdRef.current) {
                flushAutosave();
            }
        };

        const handleBeforeUnload = () => {
            if (attemptIdRef.current && Object.keys(pendingAnswersRef.current).length > 0) {
                // Usar sendBeacon para envío fiable al cerrar
                const payload = JSON.stringify({
                    intento_id: attemptIdRef.current,
                    respuestas: pendingAnswersRef.current
                });
                navigator.sendBeacon(apiUrl('/api/academy/evaluation/autosave'),
                    new Blob([payload], { type: 'application/json' })
                );
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [flushAutosave]);

    /**
     * Inicia o reanuda una evaluación
     */
    const startEvaluation = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'loading' }));
        setIsResumed(false);

        try {
            const response = await fetch(apiUrl('/api/academy/evaluation/start'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ evaluacion_id: evaluacionId })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // BLOQUEADO
            if (data.allowed === false) {
                setState(prev => ({
                    ...prev,
                    status: 'blocked',
                    blockInfo: {
                        allowed: false,
                        reason: data.reason as BlockReason,
                        retry_after_seconds: data.retry_after_seconds
                    }
                }));
                return;
            }

            // PERMITIDO (nuevo o reanudado)
            if (data.allowed === true && data.preguntas) {
                const savedAnswers = data.respuestas_guardadas || {};
                const questions = data.preguntas as Question[];
                const wasResumed = data.resumed === true;

                // Calcular la primera pregunta sin responder
                let startIndex = 0;
                if (wasResumed && Object.keys(savedAnswers).length > 0) {
                    const firstUnanswered = questions.findIndex(q => !savedAnswers[q.id]);
                    startIndex = firstUnanswered >= 0 ? firstUnanswered : questions.length - 1;
                }

                // Calcular tiempo restante si hay límite
                let timeLeft: number | undefined = undefined;
                if (data.evaluacion.tiempo_limite_min) {
                    const durationSecs = data.evaluacion.tiempo_limite_min * 60;
                    const startTimeDate = new Date(data.tiempo_inicio).getTime();
                    const elapsedSecs = Math.floor((Date.now() - startTimeDate) / 1000);
                    timeLeft = Math.max(0, durationSecs - elapsedSecs);
                }

                setState(prev => ({
                    ...prev,
                    status: 'active',
                    attemptId: data.intento.id,
                    questions,
                    currentQuestionIndex: startIndex,
                    answers: savedAnswers,
                    blockInfo: undefined,
                    timeLeft,
                    durationSecs: data.evaluacion.tiempo_limite_min ? data.evaluacion.tiempo_limite_min * 60 : undefined
                }));

                setIsResumed(wasResumed);
                setStartTime(new Date(data.tiempo_inicio).getTime());
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
            setState(prev => ({
                ...prev,
                status: 'error',
                errorMessage: `Error al iniciar evaluación: ${errorMsg}`
            }));
            onError?.(errorMsg);
        }
    }, [evaluacionId, onError]);

    /**
     * Registra la respuesta de una pregunta y programa autosave
     */
    const submitAnswer = useCallback((questionId: string, answer: string) => {
        setState(prev => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: answer }
        }));

        // Añadir al buffer de pendientes
        pendingAnswersRef.current[questionId] = answer;

        // Programar autosave con debounce
        scheduleAutosave();
    }, [scheduleAutosave]);

    /**
     * Navega a la siguiente pregunta
     */
    const nextQuestion = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
        }));
    }, []);

    /**
     * Navega a la pregunta anterior
     */
    const prevQuestion = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
        }));
    }, []);

    /**
     * Navega a una pregunta específica
     */
    const goToQuestion = useCallback((index: number) => {
        setState(prev => ({
            ...prev,
            currentQuestionIndex: Math.max(0, Math.min(index, prev.questions.length - 1))
        }));
    }, []);

    /**
     * Resetea el estado de la evaluación
     */
    const resetEvaluation = useCallback(() => {
        pendingAnswersRef.current = {};
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setIsResumed(false);
        setLastSaved(null);
        setStartTime(null);
        setState({
            status: 'idle',
            evaluacionId,
            questions: [],
            currentQuestionIndex: 0,
            answers: {},
            timeLeft: undefined,
            durationSecs: undefined
        });
    }, [evaluacionId]);

    return {
        state,
        startEvaluation,
        submitAnswer,
        submitEvaluation,
        resetEvaluation,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        isBlocked: state.status === 'blocked',
        isLoading: state.status === 'loading' || state.status === 'submitting',
        isActive: state.status === 'active',
        isResumed,
        lastSaved
    };
}
