export interface SRSState {
  interval: number;
  easeFactor: number;
  nextReview: Date;
}

/**
 * Calculates the next review schedule based on the SuperMemo-2 algorithm.
 *
 * @param currentInterval The current interval in days (0 if new).
 * @param currentEase The current ease factor (default 2.5).
 * @param isCorrect Whether the user answered correctly.
 * @returns The new interval, ease factor, and next review date.
 */
export function calculateNextReview(
  currentInterval: number,
  currentEase: number,
  isCorrect: boolean
): SRSState {
  let newInterval: number;
  let newEase: number;

  if (!isCorrect) {
    // Incorrect: Reset interval to 1 day, decrease ease factor slightly
    // This effectively restarts the learning curve but keeps some "memory" of difficulty
    newInterval = 1;
    // Standard SM-2 for rating 1 (incorrect) would handle ease differently,
    // but simplified: decrease ease to make future intervals grow slower.
    newEase = Math.max(1.3, currentEase - 0.2);
  } else {
    // Correct: Assumed rating 5 (Perfect recall)
    // SM-2 Formula for new Ease Factor:
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // With q=5, this simplifies to: EF' = EF + 0.1
    newEase = currentEase + 0.1;

    if (currentInterval === 0) {
      newInterval = 1;
    } else if (currentInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEase);
    }
  }

  // Cap ease factor (minimum 1.3 is standard SM-2 constraint)
  if (newEase < 1.3) newEase = 1.3;
  // Optional: Cap max ease to prevent explosion (e.g., 5.0)
  if (newEase > 5.0) newEase = 5.0;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    interval: newInterval,
    easeFactor: parseFloat(newEase.toFixed(2)), // Keep precision reasonable
    nextReview
  };
}
