import { motion, AnimatePresence } from 'motion/react'
import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Single Responsibility: Display RSVP speed reading animation with controls
 * Pure presentational component reflecting the provided design
 */
interface RSVPDisplayProps {
  readonly word: string
  readonly wpm: number
  readonly progress: number
  readonly isPlaying: boolean
  readonly totalWords: number
  readonly currentIndex: number
  readonly onTogglePlay: () => void
  readonly onRestart: () => void
}

export function RSVPDisplay({
  word,
  wpm,
  progress,
  isPlaying,
  totalWords,
  currentIndex,
  onTogglePlay,
  onRestart,
}: RSVPDisplayProps) {
  // Calculate time remaining based on WPM and remaining words
  const wordsRemaining = totalWords - currentIndex
  const secondsRemaining = Math.ceil((wordsRemaining / wpm) * 60)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className='relative w-full max-w-3xl mx-auto bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col transition-colors duration-300'>
      {/* Main Display Area */}
      <div className='flex-1 relative flex flex-col items-center justify-center p-8'>
        {/* Focus Guides */}
        <div className='absolute inset-0 pointer-events-none'>
          <div className='absolute top-1/2 left-1/4 h-16 w-[1px] bg-purple-500/20 dark:bg-purple-500/50 -translate-y-1/2' />
          <div className='absolute top-1/2 right-1/4 h-16 w-[1px] bg-purple-500/20 dark:bg-purple-500/50 -translate-y-1/2' />
        </div>

        {/* Word Display */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={word}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className='text-5xl md:text-7xl font-serif text-gray-900 dark:text-white/90 tracking-wide text-center z-10'>
            {word}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className='bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-white/5 p-4 md:px-8 md:py-6 transition-colors duration-300'>
        <div className='flex flex-col gap-4 max-w-2xl mx-auto'>
          {/* Stats Row */}
          <div className='flex items-center justify-between text-xs font-mono text-gray-500 dark:text-white/40 uppercase tracking-wider'>
            <div className='flex flex-col gap-1'>
              <span>Time</span>
              <span className='text-lg text-gray-900 dark:text-white font-sans font-medium normal-case'>
                {formatTime(secondsRemaining)}
              </span>
            </div>
            <div className='flex flex-col gap-1 items-center'>
              <span>WPM</span>
              <span className='text-lg text-purple-600 dark:text-purple-400 font-sans font-bold normal-case'>
                {wpm}
              </span>
            </div>
            <div className='flex flex-col gap-1 items-end'>
              <span>Progress</span>
              <span className='text-lg text-gray-900 dark:text-white font-sans font-medium normal-case'>
                <span className='text-purple-600 dark:text-purple-400'>
                  {currentIndex}
                </span>{' '}
                / {totalWords}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className='h-1.5 w-full bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-purple-600 rounded-full'
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Controls Row */}
          <div className='flex items-center justify-between mt-2'>
            <Button
              variant='ghost'
              size='icon'
              onClick={onRestart}
              className='text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 rounded-full'>
              <RotateCcw className='h-4 w-4' />
            </Button>

            <Button
              variant='default'
              size='lg'
              onClick={onTogglePlay}
              className='bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 h-12 shadow-[0_0_20px_-5px_rgba(147,51,234,0.3)] dark:shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)] transition-all hover:scale-105 active:scale-95'>
              {isPlaying ? (
                <Pause className='h-5 w-5 fill-current' />
              ) : (
                <Play className='h-5 w-5 fill-current ml-1' />
              )}
            </Button>

            <Button
              variant='ghost'
              size='icon'
              className='text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/5 rounded-full'>
              <Settings className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
