import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchNextSubscriptionDateKey = "next-subscription-date";

export const fetchNextSubscriptionDate = queryOptions({
  queryKey: [fetchNextSubscriptionDateKey],
  queryFn: async () => {
    const { data } = await supabaseService.sp.functions.invoke(
      "subscription/next-subscription-date",
      { method: "GET" },
    );
    return data.data.nextPaymentDate;
  },
  staleTime: "static",
});
