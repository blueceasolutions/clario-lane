import { z } from "zod";
import type { Database } from "~supabase/supabase_types";

export const ChallengesSchema = z.object({
  challenge: z.string(),
  description: z.string(),
  id: z.string().optional(),
  create_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ChallengesType = z.infer<typeof ChallengesSchema>;

export const ContentTypesSchema = z.object({
  content: z.string(),
  description: z.string(),
  id: z.string().optional(),
  create_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type ContentTypesType = z.infer<typeof ContentTypesSchema>;

export const GoalsSchema = z.object({
  goal: z.string(),
  description: z.string(),
  id: z.string().optional(),
  create_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type GoalsType = z.infer<typeof GoalsSchema>;

export const PlanObjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  amount: z.number(),
  interval: z.string(),
  domain: z.string(),
  planCode: z.string(),
  description: z.string(),
  currency: z.string(),
});
export type PlanObject = z.infer<typeof PlanObjectSchema>;

export const OnboardingPreferencesSchema = z.object({
  challenges: z.array(ChallengesSchema),
  contentType: z.array(ContentTypesSchema),
  goals: z.array(GoalsSchema),
  plans: z.array(PlanObjectSchema).optional(),
});
export type OnboardingPreferences = z.infer<typeof OnboardingPreferencesSchema>;

export const PreferencesSchema = z.object({
  goals: z.array(z.string()),
  content_type: z.array(z.string()),
  challenges: z.array(z.string()),
});

export type Preferences = z.infer<typeof PreferencesSchema>;
export type PreferencesType = keyof typeof PreferencesSchema.shape;

export const SubscriptionRequestSchema = z.object({
  email: z.email(),
  amount: z.number(),
  plan: z.string(),
});

export type SubscriptionRequest = z.infer<typeof SubscriptionRequestSchema>;

export const AuthValidationSchema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string(),
  confirmPassword: z.string().optional(),
  dateOfBirth: z.date().or(z.string()).optional(),
  authType: z.literal(["signin", "signup"]).optional(),
});
export type AuthValidationSchema = z.infer<typeof AuthValidationSchema>;

export type UserTable = Database["public"]["Tables"]["users"]["Row"];

export type Passage = {
  id: string;
  tags: string[]; // ['fiction, news']
  text: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questions: [
    id: string,
    options: string[],
    question: string,
    correctIndex: number,
  ];
};

export type PassageResponse = {
  passage: Passage;
  created_at: Date | string;
  updated_at: Date | string;
  id: string;
};
