import { queryOptions } from "@tanstack/react-query";
import type { PassageResponse } from "@/types";
import { usePracticeStore } from "@/store";
import { supabaseService } from "~supabase/clientServices";

export const fetchPassageKey = "passage";

export const fetchPassage = queryOptions({
  queryKey: [fetchPassageKey],
  staleTime: Infinity,
  // refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,

  queryFn: async () => {
    const { data } = await supabaseService.sp.functions.invoke(
      "/practice/passage",
      {
        method: "GET",
      },
    );

    if (data) {
      usePracticeStore.setState({ passage: data.data.passage });
    }

    return data.data as PassageResponse;
  },
});
