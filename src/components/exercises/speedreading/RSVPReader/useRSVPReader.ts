import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPassage } from "@/integration";
import { usePracticeStore } from "@/store";
import { advanceIndex, indexProgressPercent, msPerWord, splitIntoWords } from "@/lib";

export type RSVPReaderProps = {
  onPause?: () => void;
};

export const useRSVPReader = ({ onPause }: RSVPReaderProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    wpm,
    passage,
    isPlaying,
    currentIndex,
    words,
    startTime,
    isCustomPassage,
    setWords,
    setCurrentIndex,
    setElapsedTime,
    setStartTime,
    setProgress,
    setIsPlaying,
    setLoading,
    setWordsRead,
  } = usePracticeStore();

  // A custom (user-pasted) passage is already in the store -- don't
  // overwrite it by fetching a random one.
  const { isLoading } = useQuery({ ...fetchPassage, enabled: !isCustomPassage });

  // Split passage text into words
  useEffect(() => {
    const wordArray = splitIntoWords(passage?.text);
    setWords(wordArray);
    setLoading(isLoading);
    setWordsRead(wordArray.length);
  }, [passage, isLoading, setWords, setWordsRead, setLoading]);

  // Update progress based on current index
  useEffect(() => {
    setProgress(indexProgressPercent(currentIndex, words.length));
  }, [currentIndex, words.length, setProgress]);

  // Set start time when playing starts
  useEffect(() => {
    if (isPlaying && startTime === 0) {
      setStartTime(Date.now());
    }
  }, [isPlaying, startTime, setStartTime]);

  // Handle word progression and timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const { index, isComplete } = advanceIndex(prev, 1, words.length);
          if (isComplete) setIsPlaying(false);
          return index;
        });
      }, msPerWord(wpm));

      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [
    isPlaying,
    wpm,
    words.length,
    setCurrentIndex,
    setElapsedTime,
    setIsPlaying,
  ]);

  // Handle onPause callback
  useEffect(() => {
    if (!isPlaying && onPause) {
      onPause();
    }
  }, [isPlaying, onPause]);
};
