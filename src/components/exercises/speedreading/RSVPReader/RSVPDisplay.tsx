import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { DisplayText } from '../../shared'
import { usePracticeStore } from '@/store'

export function RSVPDisplay() {
  const words = usePracticeStore((state) => state.words)
  const currentIndex = usePracticeStore((state) => state.currentIndex)

  return (
    <motion.div
      layout='position'
      className={cn(
        'relative overflow-hidden group mx-auto',
        'w-full max-w-5xl h-[65vh] rounded-3xl border border-border/50 bg-card/30 shadow-2xl backdrop-blur-md',
      )}>
      {/* Subtle Gradient Background */}
      <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-50 pointer-events-none' />

      <div className='absolute left-1/2 top-0  w-1 h-2/5 bg-primary/50 rounded-full opacity-50 pointer-events-none' />
      <div className='absolute left-1/2 bottom-0  w-1 h-2/5 bg-primary/50 rounded-full opacity-50 pointer-events-none' />

      {/* Word Display Area */}
      <div className='absolute inset-0 flex items-center justify-center p-8'>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0.8, scale: 0.98, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.1 }}
          className='text-center w-full max-w-4xl'>
          {words.length > 0 && currentIndex < words.length ? (
            <DisplayText>{words[currentIndex]}</DisplayText>
          ) : words.length > 0 ? (
            <DisplayText className='text-muted-foreground font-light'>
              Complete!
            </DisplayText>
          ) : (
            <DisplayText className='text-muted-foreground font-light'>
              Loading...
            </DisplayText>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
