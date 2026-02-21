
export type MissionStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

export type MissionType =
    | 'mision_tactica'
    | 'mision_nudos'
    | 'inventario'
    | 'simulador'
    | 'hotspot'
    | 'interactive_branching';

// --- Branching Mission Interfaces ---

export interface BranchOption {
    label: string;
    next_step_id: string;
    score_delta?: number;
    feedback?: string;
    required_condition?: any; // For future complex logic
}

export interface MissionStep {
    id: string;
    mission_id: string;
    type: 'info' | 'question' | 'video' | 'challenge' | 'summary';
    content: {
        title?: string;
        body?: string;
        media_url?: string;
        [key: string]: any;
    };
    options?: BranchOption[];
    position?: number;
}

export interface BranchingMissionData extends MissionData {
    tipo_contenido: 'interactive_branching';
    id: string;
    slug: string;
    initial_step_id: string;
    steps?: MissionStep[]; // Can be populated if fetching all at once
    settings?: {
        allow_retry?: boolean;
        show_feedback?: boolean;
        [key: string]: any;
    };
}

export interface MissionData {
    tipo_contenido: MissionType;
    titulo?: string;
    descripcion?: string;
    // Flexible payload for specific mission config
    [key: string]: any;
}

export interface MissionState {
    status: MissionStatus;
    score: number;
    maxScore: number;
    currentStep: number;
    totalSteps: number;
    errors: number;
    feedbackMessage: string | null;
    feedbackType: 'success' | 'error' | 'info' | null;
}

export interface MissionProgress {
    id?: string;
    user_id: string;
    mission_id: string;
    current_step_id: string;
    status: MissionStatus;
    score: number;
    history: {
        step_id: string;
        answer_idx?: number; // Index in options array
        score_delta?: number;
        timestamp: string;
    }[];
    updated_at: string;
}

export interface MissionActions {
    startMission: () => void;
    completeMission: (finalScore: number) => void;
    failMission: (reason?: string) => void;
    setProgress: (step: number, total: number) => void;
    addScore: (points: number) => void;
    setFeedback: (message: string | null, type?: 'success' | 'error' | 'info') => void;
    reset: () => void;
}
