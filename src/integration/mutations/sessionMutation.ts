import { practiced_session } from "@/types";
import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export type RecordedSessionResponse = {
  success: boolean;
  message: string;
  data: {
    xp_gained: number;
    new_level: number;
    new_achievements: Array<{ achievement_id: string; just_unlocked: boolean }>;
    freeze_consumed: boolean;
  };
};

export const sessionMutationKey = "session-mutation";
export const sessionMutation = mutationOptions({
  mutationKey: [sessionMutationKey],
  mutationFn: async (params: practiced_session) => {
    const { data, error } = await supabaseService.sp.functions.invoke<
      RecordedSessionResponse
    >(
      "practice/session",
      { body: params, method: "POST" },
    );
    if (error) throw error;
    return data;
  },
});
