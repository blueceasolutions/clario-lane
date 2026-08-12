import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export type CreateRaceResult = {
  race_id: string;
  room_code: string;
  passage_id: string;
};

export const createRaceMutationKey = "create-race-mutation";
export const createRaceMutation = mutationOptions({
  mutationKey: [createRaceMutationKey],
  mutationFn: async (): Promise<CreateRaceResult> => {
    const { data, error } = await supabaseService.sp.rpc("create_race");
    if (error) throw error;
    return data as CreateRaceResult;
  },
});

export type JoinRaceResult = {
  race_id: string;
  passage_id: string;
};

export const joinRaceMutationKey = "join-race-mutation";
export const joinRaceMutation = mutationOptions({
  mutationKey: [joinRaceMutationKey],
  mutationFn: async (roomCode: string): Promise<JoinRaceResult> => {
    const { data, error } = await supabaseService.sp.rpc("join_race", {
      p_room_code: roomCode,
    });
    if (error) throw error;
    return data as JoinRaceResult;
  },
});

export type SubmitRaceResultPayload = {
  race_id: string;
  user_id: string;
  wpm: number;
  comprehension: number;
};

export const submitRaceResultMutationKey = "submit-race-result-mutation";
export const submitRaceResultMutation = mutationOptions({
  mutationKey: [submitRaceResultMutationKey],
  mutationFn: async (payload: SubmitRaceResultPayload) => {
    const { error } = await supabaseService.sp
      .from("reading_race_results")
      .insert(payload);

    if (error) throw error;
  },
});
