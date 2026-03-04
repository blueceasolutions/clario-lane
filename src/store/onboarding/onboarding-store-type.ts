import { z } from "zod";

export const OnboardingSchema = z.object({
  name: z.string(),
  email: z.string(),
  baseline_wpm: z.number(),
  baseline_comprehension: z.number(),
  goals: z.array(z.string()),
  content_type: z.array(z.string()),
  challenges: z.array(z.string()),
  current_comprehension_score: z.number(),
  onboarding_completed: z.boolean(),
  current_wpm: z.number().optional(),
  achievements: z.boolean(),
  badges: z.array(z.string()).optional(),
  // date_of_birth: z.union([z.string(), z.date()]).optional(),
  focus_score: z.number().optional(),
  daily_reminder: z.boolean(),
  weekly_summary: z.boolean(),
  streak_days: z.number().optional(),
  xp_earned: z.number().optional(),
  level: z.number().optional(),
  total_sessions: z.number().optional(),
});
export type OnboardingType = z.infer<typeof OnboardingSchema>;
export type OnboardingContextType = {
  updateProfile: (updates: Partial<OnboardingType>) => void;
  reset: () => void;
};

export const OnboardingFlowSchema = z.object({
  current_step: z.number(),
  reading_test_stage: z.enum(["intro", "reading", "questions", "results"]),
  reading_time: z.number(),
  start_time: z.number(),
  total_steps: z.number(),
});

export type OnboardingFlowType = z.infer<typeof OnboardingFlowSchema>;

export type OnboardingFlowActionType = {
  update: (updates: Partial<OnboardingFlowType>) => void;
  reset: () => void;
};
