import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";
import type { Database } from "~supabase/supabase_types";

export type RaceWithPassage =
  & Database["public"]["Tables"]["reading_races"]["Row"]
  & { passages: Database["public"]["Tables"]["passages"]["Row"] };

export const fetchRaceKey = "race";

export const fetchRace = (raceId: string | undefined) =>
  queryOptions({
    queryKey: [fetchRaceKey, raceId],
    queryFn: async (): Promise<RaceWithPassage | null> => {
      if (!raceId) return null;
      const { data, error } = await supabaseService.sp
        .from("reading_races")
        .select("*, passages(*)")
        .eq("id", raceId)
        .single();

      if (error) throw error;
      return data as RaceWithPassage;
    },
    enabled: !!raceId,
  });

export type RaceResult =
  Database["public"]["Tables"]["reading_race_results"]["Row"];

export const fetchRaceResultsKey = "race_results";

export const fetchRaceResults = (raceId: string | undefined) =>
  queryOptions({
    queryKey: [fetchRaceResultsKey, raceId],
    queryFn: async (): Promise<RaceResult[]> => {
      if (!raceId) return [];
      const { data, error } = await supabaseService.sp
        .from("reading_race_results")
        .select("*")
        .eq("race_id", raceId);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!raceId,
  });
