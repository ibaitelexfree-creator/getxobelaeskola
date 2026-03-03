import type {
	Difficulty,
	InteractionResult,
	MontessoriTopic,
} from "@/components/academy/montessori/types";

const LEARNING_RATE = 0.2;
const OPTIMAL_SUCCESS_PROBABILITY = 0.7; // Zone of Proximal Development

/**
 * Calculates the probability of success given user ability and topic difficulty.
 * Uses a sigmoid function: P(success) = 1 / (1 + e^{-(ability - difficulty)})
 */
export function predictProbability(
	ability: number,
	difficulty: Difficulty,
): number {
	// Scaling factor to make the curve steeper or flatter.
	// A scale of 5 means a difference of 0.2 results in significant probability shift.
	const scale = 5;
	return 1 / (1 + Math.exp(-scale * (ability - difficulty)));
}

/**
 * Updates the user's ability based on the interaction outcome.
 * Uses Gradient Descent: ability_new = ability_old + alpha * (outcome - probability)
 */
export function updateAbility(
	currentAbility: number,
	topicDifficulty: Difficulty,
	outcome: InteractionResult,
): number {
	const numericOutcome = outcome === "success" ? 1 : 0;
	const probability = predictProbability(currentAbility, topicDifficulty);

	const newAbility =
		currentAbility + LEARNING_RATE * (numericOutcome - probability);

	// Clamp ability between 0 and 1 for stability
	return Math.max(0, Math.min(1, newAbility));
}

/**
 * Recommends the next topic based on the user's current ability.
 * Prioritizes topics where the predicted success probability is closest to the optimal zone (0.7).
 * Filters out topics that have been recently mastered (optional logic, for now simple filtering).
 */
export function getRecommendation(
	topics: MontessoriTopic[],
	history: { topicId: string; result: InteractionResult; timestamp: number }[],
	currentAbility: number,
): MontessoriTopic | null {
	// Filter out topics that have been successfully completed recently (e.g., in the last session)
	// For simplicity, we filter out any topic with a 'success' in history.
	const masteredTopicIds = new Set(
		history.filter((h) => h.result === "success").map((h) => h.topicId),
	);

	const candidates = topics.filter((t) => !masteredTopicIds.has(t.id));

	if (candidates.length === 0) {
		// If all topics are mastered, return the one with the lowest success rate in history or just reset.
		// For now, return null or a random one. Let's return the one with highest difficulty.
		return topics.reduce(
			(prev, curr) => (curr.difficulty > prev.difficulty ? curr : prev),
			topics[0],
		);
	}

	// Find the candidate with probability closest to OPTIMAL_SUCCESS_PROBABILITY
	let bestTopic: MontessoriTopic | null = null;
	let minDiff = Infinity;

	for (const topic of candidates) {
		const prob = predictProbability(currentAbility, topic.difficulty);
		const diff = Math.abs(prob - OPTIMAL_SUCCESS_PROBABILITY);

		if (diff < minDiff) {
			minDiff = diff;
			bestTopic = topic;
		}
	}

	return bestTopic;
}
