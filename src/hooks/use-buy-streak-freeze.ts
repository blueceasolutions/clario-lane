import { buyStreakFreezeMutation, fetchUserStatsKey } from "@/integration";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useBuyStreakFreeze = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const { isPending, mutate: buyStreakFreeze } = useMutation({
    ...buyStreakFreezeMutation,
    onSuccess: (data) => {
      toast.success(
        `Streak freeze bought! You now have ${data.streak_freezes}.`,
      );
      queryClient.invalidateQueries({ queryKey: [fetchUserStatsKey, userId] });
    },
    onError: (error) => {
      console.error("Error buying streak freeze:", error);
      toast.error(error.message || "Failed to buy streak freeze");
    },
  });

  return {
    buyStreakFreeze,
    isBuyingStreakFreeze: isPending,
  };
};
