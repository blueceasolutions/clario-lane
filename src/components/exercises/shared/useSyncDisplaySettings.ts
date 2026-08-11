import { useDisplaySettingsStore } from "@/store";
import { displaySettingsMutation } from "@/integration";
import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";

/**
 * Hook to sync display settings to database
 * Debounces updates to avoid excessive database writes
 */
export function useSyncDisplaySettings() {
  const { fontFamily, fontSize } = useDisplaySettingsStore();
  // @ts-expect-error - NodeJS.Timeout vs number mismatch between DOM and node lib types
  const timeoutRef = useRef<NodeJS.Timeout>();

  const { mutate } = useMutation({
    ...displaySettingsMutation,
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
