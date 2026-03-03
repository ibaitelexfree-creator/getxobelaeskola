export interface DetailedResult {
    questionId: string;
    enunciado_es: string;
    enunciado_eu?: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explicacion_es?: string;
    explicacion_eu?: string;
}

export interface EvaluationResult {
    passed: boolean;
    score: number; // 0-100
    pointsObtained: number;
    pointsTotal: number;
    feedback: string;
    details?: DetailedResult[];
}

export interface QuestionOption {
    id: string;
    texto: string;
}

export interface Question {
    id: string;
    tipo_pregunta: 'opcion_multiple' | 'verdadero_falso' | 'completar' | 'ordenar' | 'asociar';
    enunciado_es: string;
    enunciado_eu: string;
    opciones_json: QuestionOption[] | null;
    puntos: number;
    imagen_url?: string;
    explicacion_es?: string;
    explicacion_eu?: string;
}

export type BlockReason = 'cooldown_active' | 'max_attempts_window' | 'max_attempts_total' | 'attempt_in_progress';

export interface BlockInfo {
    allowed: false;
    reason: BlockReason;
    retry_after_seconds: number;
}

export interface EvaluationState {
    status: 'idle' | 'loading' | 'active' | 'submitting' | 'complete' | 'error' | 'blocked';
    evaluacionId: string;
    attemptId?: string;
    questions: Question[];
    currentQuestionIndex: number;
    answers: Record<string, any>; // questionId -> answer
    result?: EvaluationResult;
    errorMessage?: string;
    blockInfo?: BlockInfo; // Info de bloqueo cuando allowed === false
    timeLeft?: number; // Segundos restantes
    durationSecs?: number; // Duración total en segundos
}
