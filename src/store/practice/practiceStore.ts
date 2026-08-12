import { PRACTICES, PracticeStep, READING_SPEED_RANGE } from "@/lib";
import type { Difficulty } from "@/lib";
import type { Passage } from "@/types";
import { create } from "zustand";
import { toast } from "sonner";

export type PracticeStore = {
  // Existing state
  wpm: number;
  comprehension: number;
  duration?: number;
  wordsRead?: number;
  correctAnswers: number;
  totalQuestions: number;
  startTime: number;
  elapsedTime: number;
  nextWpm: number;
  nextDifficulty: Difficulty | null;
  currentStep: PracticeStep;
  passage: Passage | null;
  loading: boolean;

  // New reader state
  isPlaying: boolean;
  progress: number;
  words: string[];
  currentIndex: number;
  estimatedDuration: number;
  chunkSize: number;
  exerciseType: PRACTICES;

  // User-supplied passage state
  isCustomPassage: boolean;
};

type PracticeStoreActions = {
  // Existing actions
  setStep: (step: PracticeStep) => void;
  setCompleted: (
    values: Pick<PracticeStore, "wordsRead" | "duration" | "wpm">,
  ) => void;
  setWpm: (wpm: number) => void;
  setNextWpm: (wpm: number) => void;
  setNextDifficulty: (difficulty: Difficulty | null) => void;
  reset: () => void;

  // New reader actions
  setIsPlaying: (isPlaying: boolean) => void;
  setProgress: (progress: number) => void;
  setElapsedTime: (elapsedTime: number | ((prev: number) => number)) => void;
  setStartTime: (startTime: number) => void;
  setWords: (words: string[]) => void;
  setCurrentIndex: (currentIndex: number | ((prev: number) => number)) => void;
  setEstimatedDuration: (duration: number) => void;
  setChunkSize: (size: number) => void;
  handlePlayPause: () => void;
  handleReset: () => void;
  handleComplete: () => void;
  formatTime: (seconds: number) => string;
  setExerciseType: (exerciseType: PRACTICES) => void;
  setLoading: (loading: boolean) => void;
  setWordsRead: (wordsRead: number) => void;
  setCorrectAnswers: (correctAnswers: number) => void;
  setTotalQuestions: (totalQuestions: number) => void;
  setComprehension: (comprehension: number) => void;
  setCustomPassage: (text: string, title: string) => void;
  setSelectedPassage: (passage: Passage) => void;
};

const initialState: PracticeStore = {
  wpm: READING_SPEED_RANGE.DEFAULT,
  nextWpm: 0,
  nextDifficulty: null,
  currentStep: PracticeStep.enum.Intro,
  correctAnswers: 0,
  totalQuestions: 0,
  comprehension: 0,
  passage: null,
  loading: false,
  elapsedTime: 0,
  startTime: 0,
  duration: 0,
  wordsRead: 0,
  // New initial state
  isPlaying: false,
  progress: 0,
  words: [],
  isCustomPassage: false,
  currentIndex: 0,
  estimatedDuration: 0,
  chunkSize: 3,
  exerciseType: PRACTICES.enum.SPEED_READING,
};

export const usePracticeStore = create<PracticeStore & PracticeStoreActions>(
  (set, get) => ({
    ...initialState,
    setLoading: (loading: boolean) => set({ loading }),
    setWordsRead: (wordsRead: number) => set({ wordsRead }),
    setExerciseType: (
      exerciseType: PRACTICES,
    ) => set({ exerciseType }),
    setCorrectAnswers: (correctAnswers: number) => set({ correctAnswers }),
    setTotalQuestions: (totalQuestions: number) => set({ totalQuestions }),
    setComprehension: (comprehension: number) => set({ comprehension }),
    setCustomPassage: (text: string, title: string) =>
      set({
        passage: {
          id: "",
          text,
          title: title || "Custom Passage",
          category: "Custom",
          difficulty: "Medium",
          questions: [],
        },
        isCustomPassage: true,
        loading: false,
        words: [],
        currentIndex: 0,
        progress: 0,
        elapsedTime: 0,
        startTime: 0,
        isPlaying: false,
      }),
    // A real passage picked from the browse screen (src/routes/dashboard/practice/browse.tsx)
    // -- unlike setCustomPassage, this has real quiz questions and a real
    // id, so isCustomPassage stays false (normal quiz + passage_id flow).
    setSelectedPassage: (passage: Passage) =>
      set({
        passage,
        isCustomPassage: false,
        loading: false,
        words: [],
        currentIndex: 0,
        progress: 0,
        elapsedTime: 0,
        startTime: 0,
        isPlaying: false,
      }),

    // Existing actions
    setStep: (step: PracticeStep) => set({ currentStep: step }),
    setCompleted: (
      values: Pick<PracticeStore, "wordsRead" | "duration" | "wpm">,
    ) => set(values),
    setWpm: (wpm: number) => set({ wpm }),
    setNextWpm: (nextWpm: number) => set({ nextWpm }),
    setNextDifficulty: (nextDifficulty: Difficulty | null) =>
      set({ nextDifficulty }),
    updateStore: (values: Partial<PracticeStore>) => set(values),
    reset: () => {
      const { exerciseType } = get();
      set({ ...initialState, exerciseType });
    },

    // New reader actions
    setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
    setProgress: (progress: number) => set({ progress }),
    setElapsedTime: (elapsedTime: number | ((prev: number) => number)) =>
      set((state) => ({
        elapsedTime: typeof elapsedTime === "function"
          ? elapsedTime(state.elapsedTime)
          : elapsedTime,
      })),
    setStartTime: (startTime: number) => set({ startTime }),
    setWords: (words: string[]) => set({ words }),
    setCurrentIndex: (currentIndex: number | ((prev: number) => number)) =>
      set((state) => ({
        currentIndex: typeof currentIndex === "function"
          ? currentIndex(state.currentIndex)
          : currentIndex,
      })),
    setEstimatedDuration: (estimatedDuration: number) =>
      set({ estimatedDuration }),
    setChunkSize: (chunkSize: number) => set({ chunkSize }),

    handlePlayPause: () => {
      const { isPlaying, progress } = get();
      set({ isPlaying: !isPlaying });

      // If restarting from end
      if (!isPlaying && progress >= 100) {
        set({ elapsedTime: 0, startTime: Date.now() });
      }
    },

    handleReset: () => {
      set({
        isPlaying: false,
        currentIndex: 0,
        elapsedTime: 0,
        startTime: 0,
        progress: 0,
        nextWpm: 0,
      });
    },

    handleComplete: () => {
      const { startTime, elapsedTime, wordsRead, wpm, setStep } = get();

      set({ isPlaying: false });

      const duration = startTime
        ? (Date.now() - startTime) / READING_SPEED_RANGE.MAX
        : elapsedTime;
      const actualWpm = duration > 0 && wordsRead
        ? Math.round((wordsRead / duration) * 60)
        : wpm;

      if (!actualWpm || actualWpm <= 0) {
        toast.error(`Invalid WPM calculated, using set WPM: ${wpm}`);
      } else {
        set({
          wpm: actualWpm,
          duration,
          wordsRead,
          elapsedTime,
          startTime: startTime || 0,
        });
      }

      setStep(PracticeStep.enum.Quiz);
    },

    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    },
  }),
);
