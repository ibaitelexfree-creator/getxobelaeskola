// Componentes principales

export { default as CooldownScreen } from "./CooldownScreen";
export { default as EvaluationContainer } from "./EvaluationContainer";
export { default as QuizView } from "./QuizView";
export { default as ResultScreen } from "./ResultScreen";
export { default as SimpleEvaluation } from "./SimpleEvaluation";
// Tipos
export type {
	BlockInfo,
	BlockReason,
	EvaluationResult,
	EvaluationState,
	Question,
} from "./types";
// Hook personalizado
export { useEvaluation } from "./useEvaluation";
