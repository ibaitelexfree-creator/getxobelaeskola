import { MontessoriTopic } from '@/data/academy/montessori-topics';

export interface RecommendationResult {
    topic: MontessoriTopic;
    score: number;
    reason: string;
}

/**
 * Generates a list of recommended topics based on the student's failure history.
 *
 * @param failedTags A record where the key is the tag (e.g., 'seguridad') and the value is the frequency of failures.
 * @param topics The list of available Montessori topics to recommend from.
 * @param limit The maximum number of recommendations to return (default: 5).
 * @returns An array of RecommendationResult objects, sorted by score descending.
 */
export function getStudentRecommendations(
    failedTags: Record<string, number>,
    topics: MontessoriTopic[],
    limit: number = 5
): RecommendationResult[] {
    const scoredTopics: RecommendationResult[] = topics.map(topic => {
        let score = 0;
        const matchingTags: string[] = [];

        // 1. Calculate Score based on Tag Overlap
        topic.tags.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            if (failedTags[normalizedTag]) {
                const frequency = failedTags[normalizedTag];
                // Weight: Frequency * 10 points
                score += frequency * 10;
                matchingTags.push(`${tag} (x${frequency})`);
            }
        });

        // 2. Bonus for Difficulty adjustment? (Optional)
        // For now, we prioritize fixing failures, so high failure count = high score.

        // 3. Construct Reason string
        let reason = '';
        if (matchingTags.length > 0) {
            reason = `Basado en tus errores recientes en: ${matchingTags.slice(0, 2).join(', ')}`;
        } else {
            // Default score for exploration if no failures match
            score = 1;
            reason = 'Recomendación general para ampliar conocimientos.';
        }

        return { topic, score, reason };
    });

    // Filter out topics with 0 score (unless we want to show random ones)
    // We'll keep them but sort them lower.

    return scoredTopics
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}
