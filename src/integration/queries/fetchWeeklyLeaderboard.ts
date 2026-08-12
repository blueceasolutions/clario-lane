import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export type LeaderboardEntry = {
  user_id: string;
  name: string;
  weekly_xp: number;
  rank: number;
};

export const fetchWeeklyLeaderboardKey = "weekly_leaderboard";

export const fetchWeeklyLeaderboard = queryOptions({
  queryKey: [fetchWeeklyLeaderboardKey],
  queryFn: async (): Promise<LeaderboardEntry[]> => {
    const { data, error } = await supabaseService.sp.rpc(
      "get_weekly_leaderboard",
    );

    if (error) throw error;
    return data ?? [];
  },
});
