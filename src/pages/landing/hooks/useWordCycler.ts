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

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % config.words.length);
    }, config.intervalMs);

    return () => clearInterval(interval);
  }, [config.words.length, config.intervalMs]);

  return {
    currentWord: config.words[wordIndex],
    progress: (wordIndex / config.words.length) * 100,
    wordIndex,
  };
}
