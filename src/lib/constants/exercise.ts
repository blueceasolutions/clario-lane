import { Brain, Eye, Target, TypeIcon, Zap } from "lucide-react";
import { z } from "zod";

export const PRACTICES = z.enum([
  "SPEED_READING",
  "TELEPROMPTER",
  "WORD_CHUNKING",
  "PERIPHERAL_VISION",
]);

export const READING_SPEED_RANGE = {
  MIN: 50,
  MAX: 1500,
  DEFAULT: 200,
};

export type PRACTICES = z.infer<typeof PRACTICES>;

export const PracticeStep = z.enum([
  "Intro",
  "Reading",
  "Quiz",
  "Results",
]);

export type PracticeStep = z.infer<typeof PracticeStep>;

export const PRACTICE_ICONS: Record<PRACTICES, typeof TypeIcon> = {
  SPEED_READING: Zap,
  TELEPROMPTER: Brain,
  WORD_CHUNKING: Target,
  PERIPHERAL_VISION: Eye,
};

export const PRACTICE_COLORS: Record<PRACTICES, string> = {
  SPEED_READING: "blue",
  TELEPROMPTER: "green",
  WORD_CHUNKING: "orange",
  PERIPHERAL_VISION: "red",
};

export const Practice = z.object({
  id: z.string(),
  exercise: PRACTICES,
  title: z.string(),
  description: z.string(),
  difficulty: z.string(),
  xp: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Practice = z.infer<typeof Practice>;

export const PRACTICE_ROUTES: Record<PRACTICES, string> = {
  SPEED_READING: "/dashboard/practice/speedreading",
  TELEPROMPTER: "/dashboard/practice/teleprompter",
  WORD_CHUNKING: "/dashboard/practice/wordchunking",
  PERIPHERAL_VISION: "/dashboard/practice",
} as const;

export type PRACTICE_ROUTES =
  (typeof PRACTICE_ROUTES)[keyof typeof PRACTICE_ROUTES];

export const FEEDBACK_KEY = "hasFeedback";
export const TOTAL_SESSIONS_KEY = "totalSessions";
export const SESSIONS_THRESHOLD = 3;
export const FEEDBACK_STATE = {
  FALSE: "false",
  TRUE: "true",
} as const;
