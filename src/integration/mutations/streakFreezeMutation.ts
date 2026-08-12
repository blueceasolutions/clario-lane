import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export type BuyStreakFreezeResult = {
  xp_spent: number;
  streak_freezes: number;
};

export const buyStreakFreezeMutationKey = "buy-streak-freeze-mutation";
export const buyStreakFreezeMutation = mutationOptions({
  mutationKey: [buyStreakFreezeMutationKey],
  mutationFn: async (): Promise<BuyStreakFreezeResult> => {
    const { data, error } = await supabaseService.sp.rpc("buy_streak_freeze");
    if (error) throw error;
    return data as BuyStreakFreezeResult;
  },
});
