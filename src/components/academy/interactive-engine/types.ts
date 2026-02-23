
export type MissionStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

export type MissionType =
    | 'mision_tactica'
    | 'mision_nudos'
    | 'inventario'
    | 'simulador'
    | 'hotspot'
    | 'video_interactivo';

export interface MissionData {
    tipo_contenido: MissionType;
    titulo?: string;
    descripcion?: string;
    // Flexible payload for specific mission config
    [key: string]: any;
}

export interface VideoCheckpoint {
    time: number; // seconds
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface VideoMissionData extends MissionData {
    tipo_contenido: 'video_interactivo';
    videoUrl: string;
    checkpoints: VideoCheckpoint[];
}

export interface MissionState {
    status: MissionStatus;
    score: number;
    maxScore: number;
    currentStep: number;
    currentStepId: string | null;
    history: string[];
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

export interface BranchOption {
    label: string;
    nextStepId?: string;
    scoreDelta?: number;
    feedback?: string;
}

export interface MissionStep {
    id: string;
    type: 'info' | 'question' | 'video' | 'summary' | 'interactive';
    title: string;
    content: any; // Flexible for various step payloads
    position?: number;
    options?: BranchOption[];
    videoUrl?: string;
    metadata?: any;
    mission_id?: string;
}

export interface BranchingMissionData extends MissionData {
    id?: string;
    initial_step_id: string;
    steps: MissionStep[];
}

export interface MissionProgress {
    id?: string;
    user_id: string;
    mission_id: string;
    current_step_id: string;
    status: string;
    score: number;
    history?: any[];
    created_at?: string;
    updated_at?: string;
}

export interface MissionOption {
    id: string;
    label: string;
    is_correct?: boolean;
    score_impact?: number;
    feedback?: string;
    next_step_id?: string;
}

export interface GraphMissionStep {
    id: string;
    content: string;
    media_url?: string;
    options?: MissionOption[];
}

export interface GraphMissionData extends MissionData {
    initial_step_id: string;
    steps: Record<string, GraphMissionStep>;
}
