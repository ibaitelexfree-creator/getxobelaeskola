
import { create } from 'zustand';
<<<<<<< HEAD
import { MissionStatus } from './types';

// --- Types ---

=======

// --- Types ---

export type MissionStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';
>>>>>>> pr-286
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
<<<<<<< HEAD
    currentStepId: string | null; // For graph/branching missions
    history: string[]; // Track path taken
=======
>>>>>>> pr-286
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
<<<<<<< HEAD
     * @param initialStepId Optional starting step ID for graph missions
     */
    startMission: (totalSteps?: number, initialStepId?: string) => void;
=======
     */
    startMission: (totalSteps?: number) => void;
>>>>>>> pr-286

    /**
     * Process an answer submission
     * @param correct Whether the answer was correct
     * @param points Optional points to add (default: 0, logic handled by caller often)
     */
    submitAnswer: (correct: boolean, points?: number) => void;

    /** Move to the next step (e.g., next slide/scenario) */
    nextStep: () => void;

<<<<<<< HEAD
    /** Move to a specific step ID (for branching) */
    goToStep: (stepId: string) => void;

=======
>>>>>>> pr-286
    /** Fail the mission immediately */
    failMission: (reason?: string) => void;

    /** Mark mission as successfully completed */
    completeMission: (finalScore?: number) => void;

    /** Reset state to retry the mission */
    retryMission: () => void;

<<<<<<< HEAD
    /** Restore saved progress from persistence */
    restoreProgress: (savedState: Partial<MissionState>) => void;

=======
>>>>>>> pr-286
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
<<<<<<< HEAD
    currentStepId: null,
    history: [],
=======
>>>>>>> pr-286
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

<<<<<<< HEAD
    startMission: (totalSteps = 1, initialStepId) => set({
        ...initialState,
        status: 'playing',
        totalSteps,
        currentStepId: initialStepId || null,
        history: initialStepId ? [initialStepId] : [],
=======
    startMission: (totalSteps = 1) => set({
        ...initialState,
        status: 'playing',
        totalSteps,
        // Preserve isComplete if replaying an already completed mission?
        // Usually we want to allow re-playing but maybe keep isComplete true if it was ever true.
        // For now, let's reset isComplete on start to force a fresh "run",
        // OR keeps it true if we want the "next" button to remain enabled.
        // Let's keep isComplete from previous state if strictly needed, but
        // usually a generic reset is safer for game logic.
        // If we want to persist "Unlock" state, we should rely on the parent component's fetched progress,
        // not just this ephemeral store. But for this specific requirement:
>>>>>>> pr-286
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

<<<<<<< HEAD
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

=======
>>>>>>> pr-286
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

<<<<<<< HEAD
    restoreProgress: (savedState) => set((state) => ({
        ...state,
        ...savedState,
        // Ensure status is valid if needed
        status: savedState.status || state.status
    })),

=======
>>>>>>> pr-286
    setFeedback: (message, type = 'info') => set({
        feedback: { message, type }
    }),

    reset: () => set(initialState)
}));
