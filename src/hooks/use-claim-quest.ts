import { fetchQuestsKey, fetchUserQuestsKey } from "@/integration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabaseService } from "~supabase/clientServices";

export const useClaimQuest = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { isPending, mutate: claimQuest } = useMutation({
    mutationFn: async (questId: string) => {
      // @ts-ignore - claim_quest might not be in generated types yet
      const { data, error } = await supabaseService.sp.rpc("claim_quest", {
        quest_uuid: questId,
      });

      if (error) throw error;

      const result = data as {
        success: boolean;
        message?: string;
        xp_gained?: number;
      };

      if (result && !result.success) {
        throw new Error(result.message || "Failed to claim quest");
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success(`Quest claimed! +${data.xp_gained} XP`);

      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["gamification-stats"] });
      queryClient.invalidateQueries({ queryKey: [fetchQuestsKey] });
      queryClient.invalidateQueries({ queryKey: [fetchUserQuestsKey, userId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["progress_data"] });
    },
    onError: (error) => {
      console.error("Error claiming quest:", error);
      toast.error(error.message || "Failed to claim quest");
    },
  });

  return {
    claimQuest,
    isClaiming: isPending,
  };
};
