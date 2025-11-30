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
