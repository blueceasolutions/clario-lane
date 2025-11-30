import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchPlansKey = "plans";

export const fetchPlans = queryOptions({
  queryKey: [fetchPlansKey],
  queryFn: async () => {
    const { data } = await supabaseService.sp.functions.invoke(
      "subscription/plans",
      { method: "GET" },
    );

    return data;
  },
  staleTime: "static",
});
