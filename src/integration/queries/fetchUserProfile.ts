import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchUserProfileKey = "user_profile";

export const fetchUserProfile = queryOptions({
  queryKey: [fetchUserProfileKey],
  queryFn: async () => {
    const data = await supabaseService.getUser();
    return data ?? null;
  },
  staleTime: 1000 * 60 * 60, // 1 hour
});
