import { motion } from 'motion/react'

/**
 * Single Responsibility: Display word cycling animation only
 * Interface Segregation: Accepts only required props
 * Pure component - no business logic, fully controlled by props
 */
interface WordCyclerDisplayProps {
  readonly word: string
  readonly progress: number
  readonly wpm: number
}

export function WordCyclerDisplay({
  word,
  progress,
  wpm,
}: WordCyclerDisplayProps) {
  return (
    <div className='bg-background/80 backdrop-blur-xl mx-auto border border-white/20 dark:border-white/10 p-8 rounded-2xl shadow-2xl w-full text-center transform hover:scale-105 transition-transform duration-500'>
      <div className='flex justify-center mb-6'>
        <div className='w-full h-1 bg-border rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-primary'
            animate={{
              width: [`${progress}%`],
            }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
      <motion.div
        key={word}
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
        className='text-5xl font-bold text-primary h-20 flex items-center justify-center'>
        {word}
      </motion.div>
      <div className='mt-4 flex justify-between text-xs text-muted-foreground uppercase tracking-widest font-semibold'>
        <span>{wpm} WPM</span>
        <span>Focus Mode</span>
      </div>
    </div>
  )
}
