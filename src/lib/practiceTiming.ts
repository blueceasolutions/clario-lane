// Pure timing/progress math shared by the RSVP, word-chunking, and
// teleprompter readers (src/components/exercises/*). Extracted out of the
// reader hooks so it can be unit tested without mounting React components
// or faking timers.

export function splitIntoWords(text: string | undefined | null): string[] {
  return text?.split(/\s+/).filter((word) => word.length > 0) || [];
}

export function msPerWord(wpm: number): number {
  return (60 / wpm) * 1000;
}

export function msPerChunk(wpm: number, chunkSize: number): number {
  return msPerWord(wpm) * chunkSize;
}

export type IndexAdvanceResult = {
  index: number;
  isComplete: boolean;
};

// Shared by the RSVP (step=1) and word-chunking (step=chunkSize) readers:
// advance the current word/chunk index by `step`, clamping at the end of
// the passage instead of overshooting it.
export function advanceIndex(
  current: number,
  step: number,
  totalWords: number,
): IndexAdvanceResult {
  const next = current + step;
  if (next >= totalWords) {
    return { index: totalWords, isComplete: true };
  }
  return { index: next, isComplete: false };
}

// RSVP/word-chunking progress: fraction of words consumed so far.
export function indexProgressPercent(
  currentIndex: number,
  totalWords: number,
): number {
  return totalWords > 0 ? (currentIndex / totalWords) * 100 : 0;
}

// Teleprompter estimated total read time, in seconds, at the given WPM.
export function estimatedDurationSeconds(
  wordCount: number,
  wpm: number,
): number {
  return wordCount > 0 ? (wordCount / wpm) * 60 : 0;
}

// Teleprompter progress: fraction of the estimated duration elapsed,
// clamped to 100 (elapsed time can overshoot the estimate slightly before
// the "complete" check stops the animation loop).
export function elapsedProgressPercent(
  elapsedSeconds: number,
  estimatedSeconds: number,
): number {
  return estimatedSeconds > 0
    ? Math.min((elapsedSeconds / estimatedSeconds) * 100, 100)
    : 0;
}
