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
    <div className='flex items-center justify-center min-h-[50vh] p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='bg-card border border-border rounded-xl p-8 max-w-2xl w-full shadow-sm text-center space-y-8'>
        <div className='space-y-4'>
          <h2 className='text-3xl font-bold tracking-tight text-foreground'>
            {title}
          </h2>
          <div className='text-lg text-muted-foreground leading-relaxed'>
            {children}
          </div>
        </div>

        <div className='pt-4'>
          <Button
            size='lg'
            onClick={onContinue}
            className='w-full sm:w-auto px-8'>
            Start Training
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
