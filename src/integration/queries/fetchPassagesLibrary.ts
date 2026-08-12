import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchPassagesLibraryKey = "passages-library";

// The full passage set for the browse screen (src/routes/dashboard/practice/browse.tsx).
// Filtering happens client-side (src/lib/passageFilters.ts) rather than as
// separate queries per filter combination -- same pattern as the other
// small reference-data tables (challenges, goals), and passages are cheap
// to hold in full.
export const fetchPassagesLibrary = queryOptions({
  queryKey: [fetchPassagesLibraryKey],
  queryFn: async () => {
    const { data, error } = await supabaseService.sp
      .from("passages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
  staleTime: 1000 * 60 * 5,
});
