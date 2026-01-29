import { PRACTICES, PracticeStep } from "@/lib";
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
};

type PracticeStoreActions = {
  // Existing actions
  setStep: (step: PracticeStep) => void;
  setCompleted: (
    values: Pick<PracticeStore, "wordsRead" | "duration" | "wpm">,
  ) => void;
  setWpm: (wpm: number) => void;
  updateStore: (values: Partial<PracticeStore>) => void;
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
};

const initialState: PracticeStore = {
  wpm: 200,
  nextWpm: 200,
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
  currentIndex: 0,
  estimatedDuration: 0,
  chunkSize: 3,
  exerciseType: PRACTICES.enum.SPEED_READING,
};

export const usePracticeStore = create<PracticeStore & PracticeStoreActions>(
  (set, get) => ({
    ...initialState,

    setExerciseType: (
      exerciseType: PRACTICES,
    ) => set({ exerciseType }),

    // Existing actions
    setStep: (step: PracticeStep) => set({ currentStep: step }),
    setCompleted: (
      values: Pick<PracticeStore, "wordsRead" | "duration" | "wpm">,
    ) => set(values),
    setWpm: (wpm: number) => set({ wpm }),
    updateStore: (values: Partial<PracticeStore>) => set(values),
    reset: () => set(initialState),

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
      });
    },

    handleComplete: () => {
      const { startTime, elapsedTime, wordsRead, wpm, setStep, updateStore } =
        get();

      set({ isPlaying: false });

      const duration = startTime
        ? (Date.now() - startTime) / 1000
        : elapsedTime;
      const actualWpm = duration > 0 && wordsRead
        ? Math.round((wordsRead / duration) * 60)
        : wpm;

      if (!actualWpm || actualWpm <= 0) {
        toast.error(`Invalid WPM calculated, using set WPM: ${wpm}`);
      } else {
        updateStore({
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
