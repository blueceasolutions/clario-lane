import { create } from "zustand";
import type {
  OnboardingContextType,
  OnboardingFlowActionType,
  OnboardingFlowType,
  OnboardingType,
} from "./onboarding-store-type";

const initialState: OnboardingType = {
  goals: [],
  onboarding_completed: false,
  content_type: [],
  challenges: [],
  daily_reminder: true,
  weekly_summary: true,
  achievements: true,
  current_comprehension_score: 0,
  baseline_comprehension: 0,
  baseline_wpm: 0,
  email: "",
  name: "",
};
export const useOnboardingStore = create<
  OnboardingType & OnboardingContextType
>((set) => ({
  ...initialState,
  updateProfile: (update) => set((state) => ({ ...state, ...update })),
  reset: () => set(initialState),
}));

const initialFlowState: OnboardingFlowType = {
  current_step: 0,
  total_steps: 7,
  reading_test_stage: "intro",
  reading_time: 0,
  start_time: 0,
};

export const useOnboardingFlow = create<
  OnboardingFlowType & OnboardingFlowActionType
>((set) => ({
  ...initialFlowState,
  update: (update) => set((state) => ({ ...state, ...update })),
  reset: () => set(initialFlowState),
}));
