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

export type Difficulty = "Easy" | "Medium" | "Hard";

export const DIFFICULTY_ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

// Same comprehension signal as calculateNextWpm, applied to passage
// difficulty instead of pace: step up a level on strong comprehension, step
// down on weak comprehension, hold steady in between. Steps by one level at
// a time (never jumps Easy -> Hard) and clamps at either end of the scale.
export function calculateNextDifficulty(
  difficulty: Difficulty,
  comprehensionPct: number,
): Difficulty {
  const index = DIFFICULTY_ORDER.indexOf(difficulty);

  if (comprehensionPct >= 80) {
    return DIFFICULTY_ORDER[Math.min(index + 1, DIFFICULTY_ORDER.length - 1)];
  }
  if (comprehensionPct < 60) {
    return DIFFICULTY_ORDER[Math.max(index - 1, 0)];
  }
  return difficulty;
}
