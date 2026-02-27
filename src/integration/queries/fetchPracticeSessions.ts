import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchPracticeSessionsKey = "practice_sessions";

export const fetchPracticeSessions = (
  userId: string | undefined,
  limit: number = 6,
) =>
  queryOptions({
    queryKey: [fetchPracticeSessionsKey, userId, limit],
    queryFn: async () => {
      if (!userId) return [];
      const data = await supabaseService.getPracticedSessions(userId, limit);
      return data || [];
    },
    enabled: !!userId,
  });
