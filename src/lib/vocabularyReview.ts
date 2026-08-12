// Lightweight spaced-repetition schedule for missed-vocabulary review: same
// "adjust by comprehension signal" idea as calculateNextWpm/
// calculateNextDifficulty, applied per word instead of per session. Each
// correct recall doubles the interval before the next review (capped);
// forgetting resets it to the minimum instead of, say, halving it, since a
// forgotten word needs to be seen again soon regardless of how long it had
// been going well before.

export const MIN_REVIEW_INTERVAL_DAYS = 1;
export const MAX_REVIEW_INTERVAL_DAYS = 60;

export function calculateNextReviewInterval(
  currentIntervalDays: number,
  remembered: boolean,
): number {
  if (!remembered) return MIN_REVIEW_INTERVAL_DAYS;
  return Math.min(currentIntervalDays * 2, MAX_REVIEW_INTERVAL_DAYS);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
