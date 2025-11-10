import type { ChallengesType } from "@/types";
import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchChallengesKey = "challenges";

export const fetchChallenges = queryOptions({
  queryKey: [fetchChallengesKey],
  queryFn: async () => {
    const { data } = await supabaseService.supabase
      .from("challenges")
      .select("*");
    return data as ChallengesType[];
  },
  staleTime: "static",
});
