import { apiInstance } from "@/integration";
import type { PlanObject } from "@/types";
import { queryOptions } from "@tanstack/react-query";

export const fetchPlansKey = "plans";

export const fetchPlans = queryOptions({
  queryKey: [fetchPlansKey],
  queryFn: async () => {
    const { data } = await apiInstance.get<PlanObject[]>(
      "subscription/plans",
    );

    return data;
  },
  staleTime: "static",
});
