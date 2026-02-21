
import { BranchOption, MissionStep } from '../../components/academy/interactive-engine/types';

/**
 * Pure function to calculate the next state based on the current step and user selection.
 */
export function calculateNextState(
    currentStep: MissionStep,
    optionIndex: number
): {
    nextStepId: string | null;
    scoreDelta: number;
    feedback: string | null;
} {
    if (!currentStep.options || optionIndex < 0 || optionIndex >= currentStep.options.length) {
        return { nextStepId: null, scoreDelta: 0, feedback: 'Opción inválida' };
    }

    const selectedOption = currentStep.options[optionIndex];

    return {
        nextStepId: selectedOption.next_step_id,
        scoreDelta: selectedOption.score_delta || 0,
        feedback: selectedOption.feedback || null,
    };
}

/**
 * Determine if a step is a terminal state (completion or failure).
 * Usually logic is: if type is 'summary' or no options.
 */
export function isTerminalStep(step: MissionStep): boolean {
    return step.type === 'summary' || !step.options || step.options.length === 0;
}
