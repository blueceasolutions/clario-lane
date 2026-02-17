import { useWordCycler } from '../hooks/useWordCycler'
import { RSVPDisplay } from './presentational/RSVPDisplay'
import { DEMO_WORDS, WORD_CYCLING_INTERVAL_MS } from '../data'

/**
 * Single Responsibility: Container for RSVP logic to isolate re-renders
 * This prevents the entire HeroSection from re-rendering on every word change
 */
export function HeroRSVPContainer() {
  const wordCycler = useWordCycler({
    words: DEMO_WORDS,
    intervalMs: WORD_CYCLING_INTERVAL_MS,
  })

  return (
    <RSVPDisplay
      word={wordCycler.currentWord}
      wpm={Math.floor(wordCycler.progress * 10 + 10)} // Adjusted curve for demo feel
      progress={wordCycler.progress}
      isPlaying={wordCycler.isPlaying}
      totalWords={wordCycler.totalWords}
      currentIndex={wordCycler.wordIndex}
      onTogglePlay={wordCycler.togglePlay}
      onRestart={wordCycler.restart}
    />
  )
}
