
import { useState, useCallback, useEffect, useRef } from 'react';
import { EvaluationResult, Question } from '../evaluation/types';
import { apiUrl } from '@/lib/api';

interface UseSimulationReturn {
    state: {
        status: 'idle' | 'loading' | 'active' | 'submitting' | 'complete' | 'error';
        questions: Question[];
        currentQuestionIndex: number;
        answers: Record<string, string>;
        timeLeft: number; // Seconds
        durationSecs: number;
        result?: EvaluationResult;
        errorMessage?: string;
    };
    startSimulation: () => Promise<void>;
    submitAnswer: (questionId: string, answer: string) => void;
    submitSimulation: () => Promise<void>;
    nextQuestion: () => void;
    prevQuestion: () => void;
    goToQuestion: (index: number) => void;
}

export function useSimulation(): UseSimulationReturn {
    const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'submitting' | 'complete' | 'error'>('idle');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [durationSecs, setDurationSecs] = useState(0);
    const [result, setResult] = useState<EvaluationResult | undefined>(undefined);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    // Ref for submitSimulation to avoid timer resets
    const submitSimulationRef = useRef<() => Promise<void>>(async () => {});

    // Timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'active') {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        // Auto-submit on timeout
                        submitSimulationRef.current();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [status]); // Only restart timer if status changes

    const startSimulation = useCallback(async () => {
        setStatus('loading');
        setErrorMessage(undefined);
        setAnswers({});
        setResult(undefined);

        try {
            const res = await fetch(apiUrl('/api/academy/simulation/start'), {
                method: 'POST',
            });

            if (!res.ok) {
                throw new Error('Error al iniciar la simulación');
            }

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setQuestions(data.preguntas || []);
            const duration = (data.tiempo_limite_min || 90) * 60;
            setDurationSecs(duration);
            setTimeLeft(duration);
            setCurrentQuestionIndex(0);
            setStatus('active');

        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
        }
    }, []);

    const submitAnswer = useCallback((questionId: string, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    const submitSimulation = useCallback(async () => {
        setStatus('submitting');

        try {
            const res = await fetch(apiUrl('/api/academy/simulation/submit'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            if (!res.ok) {
                throw new Error('Error al enviar respuestas');
            }

            const data = await res.json();

            // Merge question details (enunciado) into the results
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const details = data.detalles?.map((d: any) => {
                const q = questions.find(q => q.id === d.questionId);
                return {
                    ...d,
                    enunciado_es: q?.enunciado_es || 'Pregunta no encontrada',
                    enunciado_eu: q?.enunciado_eu,
                };
            }) || [];

            setResult({
                passed: data.aprobado,
                score: data.puntuacion,
                pointsObtained: data.puntos_obtenidos,
                pointsTotal: data.puntos_totales,
                feedback: data.aprobado ? '¡Enhorabuena! Has superado el examen simulado.' : 'No has alcanzado la puntuación necesaria. ¡Sigue practicando!',
                details: details,
            });

            setStatus('complete');

        } catch (error) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Error al enviar');
        }
    }, [answers, questions]);

    // Update ref
    useEffect(() => {
        submitSimulationRef.current = submitSimulation;
    }, [submitSimulation]);

    const nextQuestion = useCallback(() => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, questions.length - 1));
    }, [questions.length]);

    const prevQuestion = useCallback(() => {
        setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    }, []);

    const goToQuestion = useCallback((index: number) => {
        setCurrentQuestionIndex(Math.max(0, Math.min(index, questions.length - 1)));
    }, [questions.length]);

    return {
        state: {
            status,
            questions,
            currentQuestionIndex,
            answers,
            timeLeft,
            durationSecs,
            result,
            errorMessage
        },
        startSimulation,
        submitAnswer,
        submitSimulation,
        nextQuestion,
        prevQuestion,
        goToQuestion
    };
}
