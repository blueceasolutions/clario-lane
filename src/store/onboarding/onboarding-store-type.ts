export type OnboardingType = {
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
  isSubmitting: boolean;

  currentStep: number;
  readingTestStage: "intro" | "reading" | "questions" | "results";
  readingTime: number;
  startTime: number;
  totalSessions?: number;

  // readingGoal?: string;
  // dailyTime?: string;
  // baselineWPM?: number;
  // exercisesCompleted?: number;
};

export type OnboardingContextType = {
  updateProfile: (updates: Partial<OnboardingType>) => void;
};
