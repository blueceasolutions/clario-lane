import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";
import type { Database } from "~supabase/supabase_types";

export type VocabularyReview =
  Database["public"]["Tables"]["vocabulary_reviews"]["Row"];

export const fetchVocabularyReviewsKey = "vocabulary_reviews";

export const fetchVocabularyReviews = (userId: string | undefined) =>
  queryOptions({
    queryKey: [fetchVocabularyReviewsKey, userId],
    queryFn: async (): Promise<VocabularyReview[]> => {
      if (!userId) return [];

      const { data, error } = await supabaseService.sp
        .from("vocabulary_reviews")
        .select("*")
        .eq("user_id", userId)
        .order("next_review_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
