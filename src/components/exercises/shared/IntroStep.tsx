import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface IntroStepProps {
  title: string
  children: ReactNode
  onContinue: () => void
}

export function IntroStep({ title, children, onContinue }: IntroStepProps) {
  return (
    <div className='flex items-center justify-center min-h-[50vh] '>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='rounded-xl p-4 lg:p-8 max-w-2xl w-full text-center space-y-4'>
        <div className='space-y-4'>
          <h2 className='lg:text-3xl md:text-2xl text-xl font-bold tracking-tight text-foreground'>
            {title}
          </h2>
          <div className='text-base lg:text-lg md:text-md text-muted-foreground leading-relaxed'>
            {children}
          </div>
        </div>

        <div className='pt-2 md:pt-4 lg:pt-4'>
          <Button
            size='xl'
            onClick={onContinue}
            className='w-full sm:w-auto px-8'>
            Start Training
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
