import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";
import { addDays, calculateNextReviewInterval, MIN_REVIEW_INTERVAL_DAYS } from "@/lib";

export type MissedVocabularyWord = {
  word: string;
  context: string;
  correctAnswer: string;
  passageId: string | null;
};

export type CaptureVocabularyMissesPayload = {
  userId: string;
  words: MissedVocabularyWord[];
};

// Upserts one row per (user, word): a repeat miss on a word already being
// tracked resets its schedule rather than creating a duplicate, since
// missing it again means it hasn't been learned yet.
export const captureVocabularyMissesMutationKey =
  "capture-vocabulary-misses-mutation";
export const captureVocabularyMissesMutation = mutationOptions({
  mutationKey: [captureVocabularyMissesMutationKey],
  mutationFn: async ({ userId, words }: CaptureVocabularyMissesPayload) => {
    if (words.length === 0) return [];

    const nextReviewAt = addDays(
      new Date(),
      MIN_REVIEW_INTERVAL_DAYS,
    ).toISOString();

    const rows = words.map((w) => ({
      user_id: userId,
      word: w.word,
      context: w.context,
      correct_answer: w.correctAnswer,
      passage_id: w.passageId,
      correct_streak: 0,
      interval_days: MIN_REVIEW_INTERVAL_DAYS,
      next_review_at: nextReviewAt,
    }));

    const { data, error } = await supabaseService.sp
      .from("vocabulary_reviews")
      .upsert(rows, { onConflict: "user_id,word" })
      .select();

    if (error) throw error;
    return data;
  },
});

export type ReviewVocabularyWordPayload = {
  id: string;
  currentIntervalDays: number;
  currentStreak: number;
  remembered: boolean;
};

export const reviewVocabularyWordMutationKey = "review-vocabulary-word-mutation";
export const reviewVocabularyWordMutation = mutationOptions({
  mutationKey: [reviewVocabularyWordMutationKey],
  mutationFn: async (
    { id, currentIntervalDays, currentStreak, remembered }:
      ReviewVocabularyWordPayload,
  ) => {
    const nextIntervalDays = calculateNextReviewInterval(
      currentIntervalDays,
      remembered,
    );
    const now = new Date();

    const { data, error } = await supabaseService.sp
      .from("vocabulary_reviews")
      .update({
        interval_days: nextIntervalDays,
        correct_streak: remembered ? currentStreak + 1 : 0,
        next_review_at: addDays(now, nextIntervalDays).toISOString(),
        last_reviewed_at: now.toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
});
