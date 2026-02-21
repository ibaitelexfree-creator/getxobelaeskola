
export type MissionStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

export type MissionType =
    | 'mision_tactica'
    | 'mision_nudos'
    | 'inventario'
    | 'simulador'
    | 'hotspot'
    | 'mision_ramificada';

export interface MissionData {
    id: string; // Unique identifier for persistence
    tipo_contenido: MissionType;
    titulo?: string;
    descripcion?: string;
    config?: any;
    // Flexible payload for specific mission config
    [key: string]: any;
}

// Graph/Branching Structures
export interface MissionOption {
    id: string;
    label: string;
    next_step_id: string | null; // null usually implies end of branch or mission completion
    score_impact?: number;
    feedback?: string;
    is_correct?: boolean;
}

export interface MissionStep {
    id: string;
    type?: 'question' | 'info' | 'challenge';
    content: string; // Description or question text
    media_url?: string; // Optional image/video
    options: MissionOption[];
}

export interface GraphMissionData extends MissionData {
    initial_step_id: string;
    steps: Record<string, MissionStep>; // Map step_id -> MissionStep
}

export interface MissionState {
    status: MissionStatus;
    score: number;
    maxScore: number;
    currentStep: number;
    currentStepId: string | null; // Added for graph/branching
    history: string[]; // Added for history tracking
    totalSteps: number;
    errors: number;
    feedbackMessage: string | null;
    feedbackType: 'success' | 'error' | 'info' | null;
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
