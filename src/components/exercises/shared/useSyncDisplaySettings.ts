import { useDisplaySettingsStore } from "@/store";
import { supabaseService } from "~supabase/clientServices";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

type DisplaySettingsPayload = {
  display_settings: {
    fontFamily: string;
    fontSize: number;
  };
};

const updateDisplaySettings = async (payload: DisplaySettingsPayload) => {
  const { data, error } = await supabaseService.sp
    .from("users")
    .update(payload)
    .eq("id", (await supabaseService.sp.auth.getUser()).data.user?.id || "")
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Hook to sync display settings to database
 * Debounces updates to avoid excessive database writes
 */
export function useSyncDisplaySettings() {
  const { fontFamily, fontSize } = useDisplaySettingsStore();
  // @ts-ignore
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { mutate } = useMutation({
    mutationFn: updateDisplaySettings,
  });

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce database sync by 1 second
    timeoutRef.current = setTimeout(() => {
      mutate({
        display_settings: {
          fontFamily,
          fontSize,
        },
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fontFamily, fontSize, mutate]);
}
