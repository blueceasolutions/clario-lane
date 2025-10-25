import { create } from "zustand";

export type UserProfileType = {
  name?: string;
  email?: string;
  dateOfBirth?: string | Date;
  achievements: boolean;
  baseLineWPM?: number;
  badges?: string[];
  goals: string[];
  contentTypes: string[];
  challenges: string[];
  currentComprehensionScore?: number;
  focusScore?: number;
  dailyReminder: boolean;
  weeklyProgress: boolean;
  streakDays?: number;
  xpEarned?: number;
  currentWPM?: number;
  level?: number;
  baselineComprehension?: number;
  currentComprehension?: number;
  onboardingComplete: boolean;
};

export type UserProfileStoreActions = {
  updateUserProfile: (userProfile: UserProfileType) => void;
};

export const initialUserProfile: UserProfileType = {
  name: "",
  email: "",
  dateOfBirth: "",
  achievements: false,
  baseLineWPM: 0,
  badges: [],
  goals: [],
  contentTypes: [],
  challenges: [],
  currentComprehensionScore: 0,
  focusScore: 0,
  dailyReminder: false,
  weeklyProgress: false,
  streakDays: 0,
  xpEarned: 0,
  currentWPM: 0,
  level: 0,
  baselineComprehension: 0,
  currentComprehension: 0,
  onboardingComplete: false,
};

export const useUserProfileStore = create<
  UserProfileType & UserProfileStoreActions
>((set) => ({
  ...initialUserProfile,
  updateUserProfile: (userProfile) => set(() => ({ ...userProfile })),
}));
