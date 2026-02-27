import { useEffect, useState } from "react";
import type { IWordCyclerConfig, IWordCyclerState } from "../types";

/**
 * Single Responsibility: Manages word cycling state and timing
 * Dependency Inversion: Accepts configuration, returns state interface
 *
 * @param config - Word cycling configuration
 * @returns Current word, progress, and index
 */
export function useWordCycler(config: IWordCyclerConfig): IWordCyclerState {
  const [wordIndex, setWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setWordIndex((prev) => (prev + 1) % config.words.length);
      }, config.intervalMs);
    }
    return () => clearInterval(interval);
  }, [config.words.length, config.intervalMs, isPlaying]);

  const togglePlay = () => setIsPlaying((prev) => !prev);
  const restart = () => {
    setWordIndex(0);
    setIsPlaying(true);
  };

  return {
    currentWord: config.words[wordIndex],
    progress: ((wordIndex + 1) / config.words.length) * 100,
    wordIndex,
    isPlaying,
    totalWords: config.words.length,
    togglePlay,
    restart,
  };
}
