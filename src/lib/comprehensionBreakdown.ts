import { DIFFICULTY_ORDER, type Difficulty } from "./adaptiveWpm";

// Breaks an overall comprehension percentage down by passage topic and
// difficulty, so a user can see *what* is capping their comprehension
// instead of just that it's low. Custom (user-pasted) passages have no
// tags/difficulty to attribute to, so callers should filter sessions down
// to ones with a real passage before calling these.

export type SessionWithPassage = {
  comprehension: number;
  passages: { tags: string[]; difficulty: string } | null;
};

export type ComprehensionByCategory = {
  category: string;
  avgComprehension: number;
  sessionCount: number;
};

// A passage can carry more than one topic tag, and there's no "primary"
// tag to prefer -- a session counts toward every tag its passage has,
// rather than arbitrarily picking the first one.
export function calculateComprehensionByCategory(
  sessions: SessionWithPassage[],
): ComprehensionByCategory[] {
  const buckets = new Map<string, { total: number; count: number }>();

  for (const session of sessions) {
    if (!session.passages) continue;
    for (const tag of session.passages.tags) {
      const bucket = buckets.get(tag) ?? { total: 0, count: 0 };
      bucket.total += session.comprehension;
      bucket.count += 1;
      buckets.set(tag, bucket);
    }
  }

  // Weakest category first -- that's the one actually capping comprehension.
  return Array.from(buckets.entries())
    .map(([category, { total, count }]) => ({
      category,
      avgComprehension: Math.round(total / count),
      sessionCount: count,
    }))
    .sort((a, b) => a.avgComprehension - b.avgComprehension);
}

export type ComprehensionByDifficulty = {
  difficulty: Difficulty;
  avgComprehension: number;
  sessionCount: number;
};

export function calculateComprehensionByDifficulty(
  sessions: SessionWithPassage[],
): ComprehensionByDifficulty[] {
  const buckets = new Map<Difficulty, { total: number; count: number }>();

  for (const session of sessions) {
    if (!session.passages) continue;
    const difficulty = session.passages.difficulty as Difficulty;
    const bucket = buckets.get(difficulty) ?? { total: 0, count: 0 };
    bucket.total += session.comprehension;
    bucket.count += 1;
    buckets.set(difficulty, bucket);
  }

  // Easy -> Medium -> Hard, not weakest-first: the point here is showing
  // the progression as difficulty increases, not ranking difficulties.
  return DIFFICULTY_ORDER.filter((difficulty) => buckets.has(difficulty)).map(
    (difficulty) => {
      const { total, count } = buckets.get(difficulty)!;
      return {
        difficulty,
        avgComprehension: Math.round(total / count),
        sessionCount: count,
      };
    },
  );
}
