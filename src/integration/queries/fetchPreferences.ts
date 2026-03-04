import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchPreferencesKey = "user_preferences";

export const fetchPreferences = (userId: string | undefined) =>
  queryOptions({
    queryKey: [fetchPreferencesKey, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabaseService.sp
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
