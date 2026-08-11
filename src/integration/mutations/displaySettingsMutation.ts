import { mutationOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export type DisplaySettingsPayload = {
  display_settings: {
    fontFamily: string;
    fontSize: number;
  };
};

export const displaySettingsMutationKey = "display-settings-mutation";
export const displaySettingsMutation = mutationOptions({
  mutationKey: [displaySettingsMutationKey],
  mutationFn: async (payload: DisplaySettingsPayload) => {
    const { data: { user } } = await supabaseService.sp.auth.getUser();

    const { data, error } = await supabaseService.sp
      .from("users")
      .update(payload)
      .eq("id", user?.id || "")
      .select()
      .single();

    if (error) throw error;
    return data;
  },
});
