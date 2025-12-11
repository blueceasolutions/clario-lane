import { mutationOptions } from "@tanstack/react-query";
import type { SubscriptionRequest } from "@/types";
import { supabaseService } from "~supabase/clientServices";
const initiateSubscriptionKey = "subscription";

export const subscriptionMutation = mutationOptions({
  mutationKey: [initiateSubscriptionKey],
  mutationFn: async (params: SubscriptionRequest) => {
    const { data } = await supabaseService.sp.functions.invoke(
      "subscription/initialize",
      { body: params, method: "POST" },
    );

    return data;
  },
});

export const enableOrDisableSubscriptionToggleKey =
  "enableOrDisableSubscriptionToggle";

export const enableOrDisableSubscriptionToggleMutation = mutationOptions({
  mutationKey: [enableOrDisableSubscriptionToggleKey],
  mutationFn: async (status: "enable" | "disable") => {
    const { data, error } = await supabaseService.sp.functions.invoke(
      "subscription/toggle",
      { method: "POST", body: { status } },
    );

    if (error) throw error;
    return data;
  },
});
