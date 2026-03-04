import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabaseService } from "~supabase/clientServices";
import { apiInstance } from "@/integration";
import { FEEDBACK_KEY, FEEDBACK_STATE, TOTAL_SESSIONS_KEY } from "@/lib";

export type FeedbackCategory = "bug" | "feature" | "general";

export function useFeedback(onOpenChange: (open: boolean) => void) {
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const userProfile = useRouteContext({ from: "__root__" }).user;

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!userProfile?.id || !feedback.trim()) {
        throw new Error("Missing required fields");
      }

      const { error } = await supabaseService.sp
        .from("feedback" as any)
        .insert({
          user_id: userProfile.id,
          category,
          message: feedback,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: async () => {
      try {
        await apiInstance.post("send-email", {
          type: "FEEDBACK_SUBMITTED",
          email: userProfile?.email || "user@example.com",
          data: {
            category,
            message: feedback,
          },
        });
      } catch (error) {
        console.error("Failed to send feedback email:", error);
      }

      setFeedback("");
      setCategory("general");
      onOpenChange(false);
      localStorage.setItem(FEEDBACK_KEY, FEEDBACK_STATE.TRUE);
      toast.success("Feedback submitted successfully");
    },
    onError: () => {
      toast.error("Failed to submit feedback");
    },
  });

  const handleClose = () => {
    onOpenChange(false);
    const getHasFeedback = localStorage.getItem(FEEDBACK_KEY);
    const hasFeedback = getHasFeedback === FEEDBACK_STATE.TRUE;
    setFeedback("");
    setCategory("general");
    if (hasFeedback) return;

    localStorage.setItem(FEEDBACK_KEY, FEEDBACK_STATE.FALSE);
    localStorage.setItem(
      TOTAL_SESSIONS_KEY,
      userProfile?.total_sessions?.toString() || "0",
    );
  };

  return {
    feedback,
    setFeedback,
    category,
    setCategory,
    submitMutation,
    handleClose,
  };
}
