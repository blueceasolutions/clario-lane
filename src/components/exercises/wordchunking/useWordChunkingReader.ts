import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPassage } from "@/integration";
import { usePracticeStore } from "@/store";

export type WordChunkingReaderProps = {
  onPause?: () => void;
};

export const useWordChunkingReader = ({
  onPause,
}: WordChunkingReaderProps) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    wpm,
    passage,
    isPlaying,
    currentIndex,
    words,
    startTime,
    chunkSize,
    setWords,
    setCurrentIndex,
    setElapsedTime,
    setStartTime,
    setProgress,
    setIsPlaying,
    setLoading,
    setWordsRead,
  } = usePracticeStore();

  const { isLoading } = useQuery(fetchPassage);

  // Split passage text into words
  useEffect(() => {
    const wordArray = passage?.text?.split(/\s+/).filter((word) =>
      word.length > 0
    ) || [];
    setWords(wordArray);
    setLoading(isLoading);
    setWordsRead(wordArray.length);
  }, [passage, isLoading, setWords, setWordsRead, setLoading]);

  // Update progress based on current index
  useEffect(() => {
    const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;
    setProgress(progress);
  }, [currentIndex, words.length, setProgress]);

  // Set start time when playing starts
  useEffect(() => {
    if (isPlaying && startTime === 0) {
      setStartTime(Date.now());
    }
  }, [isPlaying, startTime, setStartTime]);

  // Handle chunk progression and timer (flash chunks, not individual words)
  useEffect(() => {
    if (isPlaying) {
      const msPerWord = (60 / wpm) * 1000;
      // Time to display each chunk = msPerWord * chunkSize
      const msPerChunk = msPerWord * chunkSize;

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + chunkSize;
          // Stop playing when complete
          if (next >= words.length) {
            setIsPlaying(false);
            return words.length; // Set to end
          }
          return next;
        });
      }, msPerChunk);

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
    chunkSize,
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
