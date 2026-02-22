export type MissionStatus =
	| "idle"
	| "playing"
	| "paused"
	| "completed"
	| "failed";

export type MissionType =
	| "mision_tactica"
	| "mision_nudos"
	| "inventario"
	| "simulador"
	| "hotspot";

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
	feedbackType: "success" | "error" | "info" | null;
}

export interface MissionActions {
	startMission: () => void;
	completeMission: (finalScore: number) => void;
	failMission: (reason?: string) => void;
	setProgress: (step: number, total: number) => void;
	addScore: (points: number) => void;
	setFeedback: (
		message: string | null,
		type?: "success" | "error" | "info",
	) => void;
	reset: () => void;
}
