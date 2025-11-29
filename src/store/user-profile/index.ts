import { create } from "zustand";

export type UserProfileType = {
  name?: string;
  email?: string;
  baseline_wpm?: number;
  baseline_comprehension?: number;
  goals: string[];
  content_type: string[];
  challenges: string[];
  current_comprehension_score?: number;
  onboarding_completed: boolean;
  current_wpm: number;
  achievements: boolean;
  badges?: string[];
  date_of_birth?: string | Date;
  focus_score?: number;
  daily_reminder: boolean;
  weekly_summary: boolean;
  streak_days?: number;
  xp_earned?: number;
  level?: number;
  total_sessions?: number;
  id?: string;
  created_at?: string;
};

export type UserProfileStoreActions = {
  updateUserProfile: (userProfile: UserProfileType) => void;
};

export const initialUserProfile: UserProfileType = {
  name: "",
  email: "",
  date_of_birth: "",
  achievements: false,
  baseline_wpm: 0,
  badges: [],
  goals: [],
  content_type: [],
  challenges: [],
  current_comprehension_score: 0,
  focus_score: 0,
  daily_reminder: false,
  weekly_summary: false,
  streak_days: 0,
  xp_earned: 0,
  current_wpm: 0,
  level: 0,
  baseline_comprehension: 0,
  onboarding_completed: false,
  total_sessions: 0,
  id: "",
  created_at: "",
};

export const useUserProfileStore = create<
  UserProfileType & UserProfileStoreActions
>((set) => ({
  ...initialUserProfile,
  updateUserProfile: (userProfile) => set(() => ({ ...userProfile })),
}));
