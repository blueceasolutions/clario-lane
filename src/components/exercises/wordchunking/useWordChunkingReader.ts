import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPassage } from "@/integration";
import { usePracticeStore } from "@/store";
import { advanceIndex, indexProgressPercent, msPerChunk, splitIntoWords } from "@/lib";

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

  // A passage was already pre-selected (browsed, or custom pasted text) --
  // don't overwrite it by fetching a random one.
  const { isLoading } = useQuery({ ...fetchPassage, enabled: !passage });

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

  // Handle chunk progression and timer (flash chunks, not individual words)
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          const { index, isComplete } = advanceIndex(
            prev,
            chunkSize,
            words.length,
          );
          if (isComplete) setIsPlaying(false);
          return index;
        });
      }, msPerChunk(wpm, chunkSize));

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
