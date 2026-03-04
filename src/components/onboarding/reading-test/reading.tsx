import { motion } from 'motion/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PASSAGE } from './passage'
import { useOnboardingReadingTest } from './useOnboardingReadingTest'

export function Reading() {
  const { handleFinishReading } = useOnboardingReadingTest()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='w-full max-w-3xl mx-auto'>
      <div className='sticky top-24 z-50 mb-8 flex justify-center'>
        <div className='px-4 py-1.5 rounded-full bg-black/80 text-white backdrop-blur-md text-xs font-medium tracking-wide shadow-lg border border-white/10 flex items-center gap-2'>
          <span className='w-2 h-2 rounded-full bg-red-500 animate-pulse' />
          Timer Running
        </div>
      </div>

      <Card className='p-4 md:p-12 shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-border/50'>
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}>
          <h2 className='md:text-2xl text-lg font-bold md:mb-8 mb-4 text-center text-primary'>
            {PASSAGE.title}
          </h2>
          <div className='prose prose-lg dark:prose-invert max-w-none text-center md:text-left text-lg leading-relaxed tracking-wide text-foreground/90 font-serif'>
            {PASSAGE.text.split('\n\n').map((paragraph, i) => (
              <p key={i} className='mb-6 last:mb-0'>
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </Card>

      <div className='mt-8 text-center sticky bottom-4'>
        <Button
          size='xl'
          onClick={handleFinishReading}
          className='min-w-[250px] w-full h-14 text-lg font-semibold bg-linear-to-r from-primary to-blue-600 shadow-xl hover:scale-105 transition-all duration-300 md:w-auto'>
          I'm Done Reading
        </Button>
      </div>
    </motion.div>
  )
}
