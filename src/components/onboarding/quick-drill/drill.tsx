import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { DRILL_WORDS } from './constants'

type Props = {
  currentIndex: number
}

export function Drill({ currentIndex }: Props) {
  const currentWord = DRILL_WORDS[currentIndex]

  return (
    <div className='w-full max-w-2xl mx-auto'>
      <motion.div
        key={currentWord}
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className='flex flex-col items-center justify-center min-h-[400px]'>
        <Card className='relative w-full aspect-square md:aspect-video flex items-center justify-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-2 border-primary/10 shadow-2xl overflow-hidden'>
          {/* Focus target lines */}
          <div className='absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none'>
            <div className='w-full h-px bg-primary absolute' />
            <div className='h-full w-px bg-primary absolute' />
          </div>

          <h2 className='text-5xl p-8  md:text-7xl font-black tracking-tight text-center bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70'>
            {currentWord}
          </h2>
        </Card>

        <div className='mt-8 max-w-sm w-full h-1 bg-secondary rounded-full overflow-hidden'>
          <motion.div
            className='h-full bg-primary'
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / DRILL_WORDS.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      </motion.div>
    </div>
  )
}
