import { READING_SPEED_RANGE } from "./constants/exercise";

// Adjusts the reading speed for the next session based on how well the
// reader understood this one: +10% on strong comprehension, -10% on weak
// comprehension, unchanged in between. Clamped to the app's supported WPM
// range either way.
export function calculateNextWpm(wpm: number, comprehensionPct: number): number {
  const tenPercent = Math.round(wpm * 0.1);
  let nextWpm = wpm;

  if (comprehensionPct >= 80) {
    nextWpm = wpm + tenPercent;
  } else if (comprehensionPct < 60) {
    nextWpm = wpm - tenPercent;
  }

  if (nextWpm > READING_SPEED_RANGE.MAX) {
    nextWpm = READING_SPEED_RANGE.MAX;
  } else if (nextWpm < READING_SPEED_RANGE.MIN) {
    nextWpm = READING_SPEED_RANGE.MIN;
  }

  return nextWpm;
}
