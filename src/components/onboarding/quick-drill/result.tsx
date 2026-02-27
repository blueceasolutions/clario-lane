import { ArrowRight, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useOnboardingFlow } from '@/store'
import { StepCard } from '../layout'

type Props = {
  improvement: number
}

export function Result({ improvement }: Props) {
  const { update, current_step } = useOnboardingFlow()

  const onContinue = () => {
    update({ current_step: current_step + 1 })
  }

  return (
    <>
      <StepCard title='Drill Complete!' className='text-center'>
        <div className='flex flex-col items-center gap-8'>
          {/* Animated Score Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className='relative w-40 h-40 flex items-center justify-center'>
            <div className='absolute inset-0 rounded-full bg-linear-to-tr from-green-500/20 to-emerald-500/20 animate-pulse-slow' />
            <svg className='w-full h-full transform -rotate-90'>
              <circle
                cx='80'
                cy='80'
                r='70'
                stroke='currentColor'
                strokeWidth='8'
                fill='transparent'
                className='text-secondary'
              />
              <motion.circle
                cx='80'
                cy='80'
                r='70'
                stroke='currentColor'
                strokeWidth='8'
                fill='transparent'
                className='text-green-500'
                strokeDasharray='440'
                strokeDashoffset='440'
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * 100) / 100 }} // Full circle for completion
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center text-green-600 dark:text-green-400'>
              <TrendingUpClassName className='w-8 h-8 mb-1' />
              <span className='text-3xl font-bold'>Good!</span>
            </div>
          </motion.div>

          <div className='grid grid-cols-2 gap-4 w-full'>
            <div className='p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex flex-col items-center gap-2'>
              <Zap className='w-5 h-5 text-orange-500' />
              <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {Math.round(improvement)}%
              </div>
              <div className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
                Faster
              </div>
            </div>
            <div className='p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center gap-2'>
              <TrendingUp className='w-5 h-5 text-blue-500' />
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                Ready
              </div>
              <div className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
                Status
              </div>
            </div>
          </div>

          <p className='text-muted-foreground max-w-md mx-auto'>
            Your eyes are warmed up and ready. Let's set up your daily habit
            plan to keep this momentum going.
          </p>

          <Button
            onClick={onContinue}
            size='xl'
            className='hidden md:flex w-full text-lg group bg-primary hover:bg-primary/90'>
            Continue
            <ArrowRight className='ml-2 w-4 h-4 transition-transform group-hover:translate-x-1' />
          </Button>
        </div>
      </StepCard>

      <div className='md:hidden w-full fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto bg-gradient-to-t from-background/50 via-background/5 to-transparent backdrop-blur-sm'>
        <div className='py-4 px-4 pt-6 md:p-0'>
          <Button size='xl' onClick={onContinue} className='w-full'>
            Continue
          </Button>
        </div>
      </div>
    </>
  )
}

function TrendingUpClassName({ className }: { className?: string }) {
  return <TrendingUp className={className} />
}
