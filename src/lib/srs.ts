export interface SRSState {
  easinessFactor: number;
  interval: number; // in days
  repetitions: number;
  nextReviewDate: Date;
}

export const INITIAL_SRS_STATE: SRSState = {
  easinessFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: new Date(),
};

/**
 * Calculates the next SRS state based on the SuperMemo-2 algorithm.
 * @param currentState Current state of the item (EF, interval, repetitions).
 * @param quality Quality of the response (0-5). 5 = perfect, < 3 = fail.
 *                In our binary system: Correct = 5, Incorrect = 1.
 * @returns New SRS state.
 */
export function calculateNextSRS(currentState: SRSState, quality: number): SRSState {
  let { easinessFactor, interval, repetitions } = currentState;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easinessFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update Easiness Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate,
  };
}
