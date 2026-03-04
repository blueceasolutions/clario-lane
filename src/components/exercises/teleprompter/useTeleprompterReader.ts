import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPassage } from "@/integration";
import { usePracticeStore } from "@/store";

export type TeleprompterReaderProps = {
  onPause?: () => void;
};

export const useTeleprompterReader = ({
  onPause,
}: TeleprompterReaderProps) => {
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  const {
    isPlaying,
    wpm,
    passage,
    elapsedTime,
    startTime,
    setElapsedTime,
    setStartTime,
    setProgress,
    setEstimatedDuration,
    setIsPlaying,
    setLoading,
    setWordsRead,
  } = usePracticeStore();

  const { isLoading } = useQuery(fetchPassage);

  // Calculate total estimated duration based on WPM and word count
  const wordCount = passage?.text?.split(/\s+/).length || 0;
  const estimatedDuration = wordCount > 0 ? (wordCount / wpm) * 60 : 0;

  // Update estimated duration in store
  useEffect(() => {
    setEstimatedDuration(estimatedDuration);
    setLoading(isLoading);
    setWordsRead(wordCount);
  }, [
    estimatedDuration,
    isLoading,
    wordCount,
    setEstimatedDuration,
    setLoading,
    setWordsRead,
  ]);

  // Calculate and update progress
  useEffect(() => {
    const progress = estimatedDuration > 0
      ? Math.min((elapsedTime / estimatedDuration) * 100, 100)
      : 0;
    setProgress(progress);
  }, [elapsedTime, estimatedDuration, setProgress]);

  // Set start time when starting
  useEffect(() => {
    if (isPlaying && startTime === 0) {
      setStartTime(Date.now());
    }
  }, [isPlaying, startTime, setStartTime]);

  // Animation loop for elapsed time
  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = performance.now();

      const animate = (time: number) => {
        if (lastFrameTimeRef.current !== null) {
          const delta = (time - lastFrameTimeRef.current) / 1000; // seconds

          // Use functional update to get the latest elapsed time
          setElapsedTime((prevElapsed) => {
            const newElapsed = prevElapsed + delta;

            // Check if complete
            if (newElapsed >= estimatedDuration && estimatedDuration > 0) {
              setIsPlaying(false);
              return estimatedDuration;
            }

            return newElapsed;
          });
        }
        lastFrameTimeRef.current = time;

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } else {
      lastFrameTimeRef.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [isPlaying, estimatedDuration, setElapsedTime, setIsPlaying]);

  // Handle onPause callback
  useEffect(() => {
    if (!isPlaying && onPause) {
      onPause();
    }
  }, [isPlaying, onPause]);
};
