import type {
	MontessoriNode,
	RecommendationScore,
	UserProgress,
} from "./types";

export class LearningPathRecommender {
	private readonly weights = {
		mastery: 0.6, // Importance of being good at this category
		difficulty: -0.3, // Penalty for high difficulty
		prerequisite: 2.0, // Huge boost if prerequisites are just met
		novelty: 0.2, // Slight boost for new things
	};

	/**
	 * Calculates the "suitability" score for a list of nodes based on user progress.
	 */
	public recommend(
		nodes: MontessoriNode[],
		progressMap: Record<string, UserProgress>,
	): RecommendationScore[] {
		const categoryMastery = this.calculateCategoryMastery(nodes, progressMap);

		return nodes
			.map((node) => {
				// 1. Skip if already completed (unless we want to recommend review, but let's focus on new)
				// But for "Montessori" we might want to allow review. For now, let's score everything.
				// If locked, score is 0.

				const status = progressMap[node.id]?.status || "locked";

				// Check prerequisites manually if not explicitly "available" in progress map
				// (The API might handle availability, but let's double check logic here)
				const isPrereqsMet = node.prerequisites.every(
					(pid) => progressMap[pid]?.status === "completed",
				);

				if (!isPrereqsMet) {
					return {
						nodeId: node.id,
						score: 0,
						factors: {
							mastery: 0,
							prerequisites: 0,
							difficulty: 0,
							timeDecay: 0,
						},
					};
				}

				// If already completed, reduce score significantly unless it's been a long time (spaced repetition)
				if (status === "completed") {
					return {
						nodeId: node.id,
						score: 0.1, // Low score for completed items
						factors: {
							mastery: 0,
							prerequisites: 0,
							difficulty: 0,
							timeDecay: 0,
						},
					};
				}

				// 2. Calculate Features
				const mastery = categoryMastery[node.category] || 0.5; // Default to neutral if unknown
				const difficultyNorm = node.difficulty / 5.0; // 0.2 to 1.0

				// "Z" score (logit)
				// We want: High Mastery -> Higher Score
				// High Difficulty -> Lower Score (unless mastery is very high?)
				// Let's keep it simple linear for now.

				const rawScore =
					mastery * this.weights.mastery +
					(1 - difficultyNorm) * Math.abs(this.weights.difficulty) +
					this.weights.novelty;

				// Sigmoid-ish clamping
				const score = Math.max(0, Math.min(1, rawScore));

				return {
					nodeId: node.id,
					score,
					factors: {
						mastery,
						prerequisites: 1,
						difficulty: difficultyNorm,
						timeDecay: 0,
					},
				};
			})
			.sort((a, b) => b.score - a.score);
	}

	private calculateCategoryMastery(
		nodes: MontessoriNode[],
		progressMap: Record<string, UserProgress>,
	): Record<string, number> {
		const categoryStats: Record<string, { total: number; count: number }> = {};

		Object.values(progressMap).forEach((p) => {
			if (p.status === "completed" && p.score !== undefined) {
				const node = nodes.find((n) => n.id === p.nodeId);
				if (node) {
					if (!categoryStats[node.category]) {
						categoryStats[node.category] = { total: 0, count: 0 };
					}
					categoryStats[node.category].total += p.score;
					categoryStats[node.category].count++;
				}
			}
		});

		const mastery: Record<string, number> = {};
		for (const cat in categoryStats) {
			mastery[cat] = categoryStats[cat].total / categoryStats[cat].count;
		}
		return mastery;
	}
}
