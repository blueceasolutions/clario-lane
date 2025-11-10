import type { ContentTypesType } from "@/types";
import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchContentTypeKey = "content-types";

export const fetchContentType = queryOptions({
  queryKey: [fetchContentTypeKey],
  queryFn: async () => {
    const { data } = await supabaseService.supabase
      .from("content_types")
      .select("*")
      .in("content", ["technology", "non-fiction", "fictions", "news"]);

    return data as ContentTypesType[];
  },
  staleTime: "static",
});
