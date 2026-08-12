import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";
import { fetchRaceKey } from "@/integration";

// Subscribes to changes on a single race row (status flips to 'racing' when
// an opponent joins, 'finished' once both results are in -- see
// check_race_finished() in supabase/schemas/zz_reading_races.sql) and
// refetches it, instead of the two participants having to poll.
export const useRaceUpdates = (raceId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!raceId) return;

    const channel = supabaseService.sp
      .channel(`race-${raceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reading_races",
          filter: `id=eq.${raceId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [fetchRaceKey, raceId] });
        },
      )
      .subscribe();

    return () => {
      supabaseService.sp.removeChannel(channel);
    };
  }, [raceId, queryClient]);
};
