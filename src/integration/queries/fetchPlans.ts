import { USER_LOCATION } from "@/lib";
import type { PlanObject } from "@/types";
import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchPlansKey = "plans";

export const fetchPlans = queryOptions({
  queryKey: [fetchPlansKey],
  queryFn: async () => {
    const userLocation = localStorage.getItem(USER_LOCATION);
    const location = userLocation ? JSON.parse(userLocation) : null;
    const continent = location?.continent_code || "unknown";

    const { data } = await supabaseService.sp.functions.invoke(
      `subscription/plans?c=${continent}`,
      { method: "GET", },
    );

    return data as PlanObject[];
  },
  staleTime: "static",
});
