import { claimQuestMutation, fetchQuestsKey, fetchUserQuestsKey } from "@/integration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useClaimQuest = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { isPending, mutate: claimQuest } = useMutation({
    ...claimQuestMutation,
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
