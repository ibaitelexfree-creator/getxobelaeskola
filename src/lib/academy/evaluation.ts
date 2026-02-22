/**
 * Identifies questions that were answered incorrectly.
 *
 * @param questions Array of questions with their IDs and correct answers.
 * @param userAnswers Object mapping question IDs to user answers.
 * @returns Array of IDs of questions that were failed.
 */
export function identifyFailedQuestions(
	questions: { id: string; respuesta_correcta: string }[],
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	userAnswers: Record<string, any>,
): string[] {
	const failedIds: string[] = [];

	for (const question of questions) {
		const userAnswer = userAnswers[question.id];

		// Normalize to string for comparison, matching the DB logic
		// If userAnswer is undefined/null, it counts as wrong (unless correct answer is also null/empty which shouldn't happen)
		const userAnswerStr =
			userAnswer !== undefined && userAnswer !== null
				? String(userAnswer)
				: null;

		if (userAnswerStr !== question.respuesta_correcta) {
			failedIds.push(question.id);
		}
	}

	return failedIds;
}
