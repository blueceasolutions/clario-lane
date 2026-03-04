import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchSessionKey = "session";

export const fetchSession = queryOptions({
  queryKey: [fetchSessionKey],
  queryFn: () => supabaseService.getSession(),
  // Session expiry is managed by Supabase, but we can cache the check for a bit.
  // 5 minutes seems reasonable to check validity.
  staleTime: 1000 * 60 * 5,
});
