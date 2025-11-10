import { queryOptions } from "@tanstack/react-query";
import { apiInstance } from "../apiInstance";
import type { PassageResponse } from "@/types";
import { useSpeedReadingStore } from "@/components/exercises/speedreading/use-speed-reading-store";

export const fetchPassageKey = "passage";

export const fetchPassage = queryOptions({
  queryKey: [fetchPassageKey],
  queryFn: async () => {
    const { data } = await apiInstance.get("practice/passage");
    if (data.data) {
      useSpeedReadingStore.setState({ passage: data?.data?.passage });
    }
    return data.data as PassageResponse;
  },
});
