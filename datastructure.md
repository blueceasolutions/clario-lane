# ClarioLane

### User Info

```typescript

export type UserProfileType = {
  name?: string;
  email?: string;
  dateOfBirth?: string | Date;

  achievements: boolean;
  badges?: string[];
  streakDays?: number;
  xpEarned?: number;
  level?: number;

  totalSessions?: number;
  progress?: number;
  currentWPM: number;
  baseLineWPM?: number;
  baselineComprehension?: number;
  currentComprehensionScore?: number;
  focusScore?: number;

  goals: string[];
  contentTypes: string[];
  challenges: string[];

  dailyReminder: boolean;
  weeklyProgress: boolean;

  onboardingComplete: boolean;
};

type Passage = {
  id: string,
  tags: string[], // ['fiction, news']
  text: string,
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  questions: [
    id: string,
    options: string[],
    question: string,
    correctIndex: number
  ],
}


type SpeedReading = {
wpm: number,
comprehension: number,
passageId: string,
duration: number,
totalWords: number
correctAnswers: number,
totalQuestions: number
}

type sessions = {
  exercise: string,
  createdAt: Date,
  wpm: number,
  comprehension: number,
  timestamp: string | Date,
  passageId: string,
  userId: string,
}

```
