
import { create } from 'zustand';
import { MissionStatus } from './types';

// --- Types ---

export type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackState {
    message: string | null;
    type: FeedbackType | null;
}

// --- State Interface ---

interface MissionState {
    status: MissionStatus;
    score: number;
    currentStep: number;
    currentStepId: string | null; // For graph/branching missions
    history: string[]; // Track path taken
    totalSteps: number;
    errors: number;
    isComplete: boolean; // Gating flag
    feedback: FeedbackState;
}

// --- Actions Interface ---

interface MissionActions {
    /** 
     * Initialize and start a new mission 
     * @param totalSteps Number of steps/scenarios in this mission
     * @param initialStepId Optional starting step ID for graph missions
     */
    startMission: (totalSteps?: number, initialStepId?: string) => void;

    /**
     * Process an answer submission
     * @param correct Whether the answer was correct
     * @param points Optional points to add (default: 0, logic handled by caller often)
     */
    submitAnswer: (correct: boolean, points?: number) => void;

    /** Move to the next step (e.g., next slide/scenario) */
    nextStep: () => void;

    /** Move to a specific step ID (for branching) */
    goToStep: (stepId: string) => void;

    /** Fail the mission immediately */
    failMission: (reason?: string) => void;

    /** Mark mission as successfully completed */
    completeMission: (finalScore?: number) => void;

    /** Reset state to retry the mission */
    retryMission: () => void;

    /** Restore saved progress from persistence */
    restoreProgress: (savedState: Partial<MissionState>) => void;

    /** Show feedback message (toast/overlay) */
    setFeedback: (message: string | null, type?: FeedbackType) => void;

    /** Full reset to initial state */
    reset: () => void;
}

type MissionStore = MissionState & MissionActions;

// --- Initial State ---

const initialState: MissionState = {
    status: 'idle',
    score: 0,
    currentStep: 0,
    currentStepId: null,
    history: [],
    totalSteps: 1,
    errors: 0,
    isComplete: false,
    feedback: {
        message: null,
        type: null
    }
};

// --- Store Implementation ---

export const useMissionStore = create<MissionStore>((set, get) => ({
    ...initialState,

    startMission: (totalSteps = 1, initialStepId) => set({
        ...initialState,
        status: 'playing',
        totalSteps,
        currentStepId: initialStepId || null,
        history: initialStepId ? [initialStepId] : [],
        isComplete: false
    }),

    submitAnswer: (correct, points = 0) => set((state) => ({
        score: correct ? state.score + points : state.score,
        errors: correct ? state.errors : state.errors + 1
    })),

    nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1),
        feedback: { message: null, type: null }
    })),

    goToStep: (stepId) => set((state) => {
        // Only add to history if it's new (prevent loops or verify logic in component)
        // Usually we track the path.
        const newHistory = [...state.history, stepId];
        return {
            currentStepId: stepId,
            history: newHistory,
            // Increment linear step count for progress bar visualization if applicable
            currentStep: state.currentStep + 1,
            feedback: { message: null, type: null }
        };
    }),

    failMission: (reason) => set((state) => ({
        status: 'failed',
        feedback: {
            message: reason || 'Misión fallida',
            type: 'error'
        }
    })),

    completeMission: (finalScore) => {
        const currentScore = get().score;
        set({
            status: 'completed',
            isComplete: true,
            score: finalScore !== undefined ? finalScore : currentScore,
            feedback: {
                message: '¡Misión Completada!',
                type: 'success'
            }
        });
    },

    retryMission: () => set((state) => ({
        ...initialState,
        status: 'playing',
        totalSteps: state.totalSteps
    })),

    restoreProgress: (savedState) => set((state) => ({
        ...state,
        ...savedState,
        // Ensure status is valid if needed
        status: savedState.status || state.status
    })),

    setFeedback: (message, type = 'info') => set({
        feedback: { message, type }
    }),

    reset: () => set(initialState)
}));
