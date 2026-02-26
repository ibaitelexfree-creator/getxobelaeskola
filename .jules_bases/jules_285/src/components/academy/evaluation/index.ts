// Componentes principales
export { default as SimpleEvaluation } from './SimpleEvaluation';
export { default as EvaluationContainer } from './EvaluationContainer';
export { default as CooldownScreen } from './CooldownScreen';
export { default as QuizView } from './QuizView';
export { default as ResultScreen } from './ResultScreen';

// Hook personalizado
export { useEvaluation } from './useEvaluation';

// Tipos
export type {
    Question,
    EvaluationResult,
    EvaluationState,
    BlockReason,
    BlockInfo
} from './types';
