import { Brain, Eye, Target, TypeIcon, Zap } from "lucide-react";
import { z } from "zod";

export const PRACTICES = z.enum([
  "SPEED_READING",
  "COMPREHENSION",
  "WORD_CHUNKING",
  "PERIPHERAL_VISION",
]);

export type PRACTICES = z.infer<typeof PRACTICES>;

export const PracticeStep = z.enum([
  "Reading",
  "Quiz",
  "Results",
]);

export type PracticeStep = z.infer<typeof PracticeStep>;

export const PRACTICE_ICONS: Record<PRACTICES, typeof TypeIcon> = {
  SPEED_READING: Zap,
  COMPREHENSION: Brain,
  WORD_CHUNKING: Target,
  PERIPHERAL_VISION: Eye,
};

export const PRACTICE_COLORS: Record<PRACTICES, string> = {
  SPEED_READING: "blue",
  COMPREHENSION: "green",
  WORD_CHUNKING: "yellow",
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
  COMPREHENSION: "/dashboard/practice/comprehension",
  WORD_CHUNKING: "/dashboard/practice",
  PERIPHERAL_VISION: "/dashboard/practice",
} as const;

export type PRACTICE_ROUTES =
  (typeof PRACTICE_ROUTES)[keyof typeof PRACTICE_ROUTES];
