export interface MontessoriNode {
	id: string;
	title: string;
	category: "Sailing" | "Navigation" | "Meteorology" | "Safety" | "General";
	difficulty: 1 | 2 | 3 | 4 | 5; // 1 = Easy, 5 = Hard
	prerequisites: string[]; // IDs of required nodes
	position?: { x: number; y: number }; // For visual graph layout
	description?: string;
}

export interface UserProgress {
	nodeId: string;
	status: "locked" | "available" | "in_progress" | "completed";
	score?: number; // 0-100 or 0-1
	attempts: number;
	lastAttemptDate?: string;
	timeSpent?: number; // seconds
}

export interface RecommendationScore {
	nodeId: string;
	score: number; // 0-1 probability/suitability
	factors: {
		mastery: number;
		prerequisites: number;
		difficulty: number;
		timeDecay: number;
	};
}

export interface MontessoriGraph {
	nodes: MontessoriNode[];
	edges: { source: string; target: string }[];
	userProgress: Record<string, UserProgress>;
	recommendedNodeId: string | null;
}
