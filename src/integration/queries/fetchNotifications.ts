import { queryOptions } from "@tanstack/react-query";
import { supabaseService } from "~supabase/clientServices";

export const fetchNotificationsKey = "notification_settings";

export const fetchNotifications = (userId: string | undefined) =>
  queryOptions({
    queryKey: [fetchNotificationsKey, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabaseService.sp
        .from("users")
        .select("daily_reminder, reminder_time, weekly_summary")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
