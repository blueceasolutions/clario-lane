import { redirect, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabaseService } from "~supabase/clientServices";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSessionKey, fetchUserProfileKey } from "@/integration/queries";

export const useLogout = () => {
  const route = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    try {
      await supabaseService.signOut();

      // Clear specific user queries
      queryClient.removeQueries({ queryKey: [fetchSessionKey] });
      queryClient.removeQueries({ queryKey: [fetchUserProfileKey] });
      // clear all queries to be safe
      queryClient.clear();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to logout");
      }
    }

    route.invalidate().then(() => {
      throw redirect({ to: "/" });
    });
  };
};
