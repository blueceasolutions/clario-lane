// Personalizes the dashboard hero banner based on the goal the user picked
// at onboarding (users.goals, see goals.tsx / the `goals` reference table).
// Falls back to generic copy for users with no goal set (or, before the
// text[] storage fix, mangled/unrecognized data).
export type GoalBannerCopy = {
  headline: string;
  subtext: string;
};

const GOAL_COPY: Record<string, GoalBannerCopy> = {
  "Increase Speed": {
    headline: "Ready to read faster?",
    subtext:
      "You told us speed is what you're after — every session nudges your WPM up. Just 15 minutes a day can make a huge difference.",
  },
  "Improve Comprehension": {
    headline: "Ready to understand more?",
    subtext:
      "You're here to retain more of what you read, not just read faster — our comprehension checks track that directly.",
  },
  "Enhance Focus": {
    headline: "Ready to lock in?",
    subtext:
      "You want fewer distractions while reading. Short, focused sessions build that muscle fastest.",
  },
  "Boost Retention": {
    headline: "Ready to remember more?",
    subtext:
      "You're aiming to hold onto what you read longer. Regular practice and quizzes are how that sticks.",
  },
};

const DEFAULT_GOAL_COPY: GoalBannerCopy = {
  headline: "Ready to level up?",
  subtext:
    "Improve your reading speed and comprehension with our proven exercises. Just 15 minutes a day can make a huge difference.",
};

export function getGoalBannerCopy(
  goals: string[] | null | undefined,
): GoalBannerCopy {
  const primaryGoal = goals?.find((goal) => goal in GOAL_COPY);
  return primaryGoal ? GOAL_COPY[primaryGoal] : DEFAULT_GOAL_COPY;
}
