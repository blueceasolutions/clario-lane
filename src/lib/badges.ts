import type { Database } from "~supabase/supabase_types";
import type { UserProfileType } from "@/types";

export type BadgeItem = {
  id: string;
  name: string;
  icon: string;
  earned: boolean;
  description: string;
};

export const getBadges = (
  userProfile: UserProfileType,
  sessions:
    | Database["public"]["Tables"]["practice_sessions"]["Row"][]
    | undefined,
): BadgeItem[] => {
  return [
    {
      id: "first_drill",
      name: "First Steps",
      icon: "🎯",
      earned: (sessions?.length || 0) > 0,
      description: "Completed your first drill",
    },
    {
      id: "week_streak",
      name: "Week Warrior",
      icon: "🔥",
      earned: (userProfile.streak_days || 0) >= 7,
      description: "7-day practice streak",
    },
    {
      id: "speed_demon",
      name: "Speed Demon",
      icon: "⚡",
      earned: (userProfile.current_wpm || 0) >= 400,
      description: "Reach 400 WPM",
    },
    {
      id: "comprehension_master",
      name: "Comprehension Master",
      icon: "🧠",
      earned: (userProfile.current_comprehension_score || 0) >= 90,
      description: "90%+ comprehension rate",
    },
    {
      id: "dedicated",
      name: "Dedicated Reader",
      icon: "📚",
      earned: (userProfile.streak_days || 0) >= 30,
      description: "30-day practice streak",
    },
    {
      id: "milestone_500",
      name: "500 Club",
      icon: "🏆",
      earned: (userProfile.current_wpm || 0) >= 500,
      description: "Reach 500 WPM",
    },
  ];
};
