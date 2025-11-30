import { queryOptions } from "@tanstack/react-query";
import type { Practice } from "@/lib";
import { supabaseService } from "~supabase/clientServices";

export const fetchPracticesKey = "Practices";
export const fetchPractices = queryOptions({
  queryKey: [fetchPracticesKey],
  staleTime: "static",
  queryFn: async (): Promise<Practice[] | null> => {
    const { data } = await supabaseService.sp.functions.invoke(
      "/practice",
      {
        method: "GET",
      },
    );
    return data.data as Practice[];
  },
});
