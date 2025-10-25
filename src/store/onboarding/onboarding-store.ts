import { create } from "zustand";
import type {
  OnboardingContextType,
  OnboardingType,
} from "./onboarding-store-type";

export const useOnboardingStore = create<
  OnboardingType & OnboardingContextType
>((set) => ({
  currentStep: 0,
  onboardingComplete: false,
  updateProfile: (update) => set((state) => ({ ...state, ...update })),
  goals: [],
  contentTypes: [],
  challenges: [],
  readingTestStage: "intro",
  readingTime: 0,
  startTime: 0,
  dailyReminder: true,
  weeklyProgress: true,
  achievements: true,
  isSubmitting: false,
}));
