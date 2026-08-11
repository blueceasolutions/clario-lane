import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export type ClaimQuestResult = {
  success: boolean;
  message?: string;
  xp_gained?: number;
};

export const claimQuestMutationKey = "claim-quest-mutation";
export const claimQuestMutation = mutationOptions({
  mutationKey: [claimQuestMutationKey],
  mutationFn: async (questId: string) => {
    const { data, error } = await supabaseService.sp.rpc("claim_quest", {
      quest_uuid: questId,
    });

    if (error) throw error;

    const result = data as ClaimQuestResult;

    if (result && !result.success) {
      throw new Error(result.message || "Failed to claim quest");
    }

    return result;
  },
});
