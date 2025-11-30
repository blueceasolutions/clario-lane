import { practiced_session } from "@/types";
import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const sessionMutationKey = "session-mutation";
export const sessionMutation = mutationOptions({
  mutationKey: [sessionMutationKey],
  mutationFn: async (params: practiced_session) => {
    const { data, error } = await supabaseService.sp.functions.invoke(
      "practice/session",
      { body: params, method: "POST" },
    );
    if (error) throw error;
    return data;
  },
});
