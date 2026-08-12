import { splitIntoWords } from "./practiceTiming";

// Pure filtering logic for the passage browse screen. Filtering happens
// client-side over the full passage set (small reference table, same
// staleTime="static"-style pattern as challenges/goals) rather than as
// separate per-filter queries, so it's cheap to unit test directly.

export type LengthBucket = "short" | "medium" | "long";

const SHORT_MAX_WORDS = 300;
const MEDIUM_MAX_WORDS = 700;

export function getLengthBucket(wordCount: number): LengthBucket {
  if (wordCount < SHORT_MAX_WORDS) return "short";
  if (wordCount <= MEDIUM_MAX_WORDS) return "medium";
  return "long";
}

export const LENGTH_BUCKET_LABELS: Record<LengthBucket, string> = {
  short: `Short (< ${SHORT_MAX_WORDS} words)`,
  medium: `Medium (${SHORT_MAX_WORDS}–${MEDIUM_MAX_WORDS} words)`,
  long: `Long (> ${MEDIUM_MAX_WORDS} words)`,
};

export type FilterablePassage = {
  difficulty: string;
  tags: string[];
  text: string;
};

export type PassageFilterCriteria = {
  difficulty?: string | null;
  tag?: string | null;
  length?: LengthBucket | null;
};

export function filterPassages<T extends FilterablePassage>(
  passages: T[],
  criteria: PassageFilterCriteria,
): T[] {
  return passages.filter((passage) => {
    if (criteria.difficulty && passage.difficulty !== criteria.difficulty) {
      return false;
    }
    if (criteria.tag && !passage.tags.includes(criteria.tag)) {
      return false;
    }
    if (criteria.length) {
      const wordCount = splitIntoWords(passage.text).length;
      if (getLengthBucket(wordCount) !== criteria.length) {
        return false;
      }
    }
    return true;
  });
}

export function getAvailableTags(passages: FilterablePassage[]): string[] {
  const tags = new Set<string>();
  for (const passage of passages) {
    for (const tag of passage.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}

export function getAvailableDifficulties(
  passages: FilterablePassage[],
): string[] {
  const difficulties = new Set<string>();
  for (const passage of passages) difficulties.add(passage.difficulty);
  return Array.from(difficulties).sort();
}
