import { Award, Sparkles, Target, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ConfettiComponent } from '@/components/ui/confetti'
import { useOnboardingFlow, useOnboardingStore } from '@/store'
import { StepCard } from '../layout'

export function Results() {
  const onboarding = useOnboardingStore()
  const { update, current_step } = useOnboardingFlow()

  const onContinue = () => {
    update({ current_step: current_step + 1 })
  }

  return (
    <>
      <StepCard className='text-center max-w-3xl'>
        {/* Animated Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className='w-24 h-24 mx-auto mb-6 relative'>
          <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse' />
          <div className='relative w-full h-full bg-linear-to-br from-primary to-blue-600 rounded-full flex items-center justify-center p-1 shadow-xl'>
            <div className='w-full h-full bg-background rounded-full flex items-center justify-center border-4 border-white/10'>
              <Award className='w-10 h-10 text-primary' />
            </div>
          </div>
        </motion.div>

        <h2 className='text-3xl font-bold mb-2'>Analysis Complete!</h2>
        <p className='text-muted-foreground mb-8 text-lg'>
          We've established your baseline. Here's where you stand.
        </p>

        {/* Stats Grid */}
        <div className='grid sm:grid-cols-3 gap-4 mb-8'>
          <StatCard
            icon={TrendingUp}
            label='Reading Speed'
            value={onboarding.baseline_wpm}
            unit='WPM'
            color='text-blue-500'
            bg='bg-blue-500/10'
            delay={0.1}
          />
          <StatCard
            icon={Target}
            label='Comprehension'
            value={onboarding.baseline_comprehension}
            unit='%'
            color='text-green-500'
            bg='bg-green-500/10'
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            label='Focus Score'
            value={onboarding.focus_score}
            unit='%'
            color='text-purple-500'
            bg='bg-purple-500/10'
            delay={0.3}
          />
        </div>

        {/* AI Insight Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='bg-linear-to-r from-primary/5 to-blue-500/5 p-6 rounded-xl border border-primary/10 text-left mb-8'>
          <div className='flex items-center gap-2 mb-3'>
            <Sparkles className='w-4 h-4 text-primary' />
            <h4 className='font-semibold text-primary'>AI Analysis</h4>
          </div>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            Based on your speed of{' '}
            <span className='font-bold text-foreground'>
              {onboarding.baseline_wpm} WPM
            </span>{' '}
            and{' '}
            <span className='font-bold text-foreground'>
              {onboarding.baseline_comprehension}% comprehension
            </span>
            , we recommend starting with visual pacing exercises to reduce
            subvocalization. You have a strong foundation to build upon!
          </p>
        </motion.div>

        <Button
          size='xl'
          onClick={onContinue}
          className='hidden md:block w-full h-12 text-lg font-medium'>
          Continue to Quick Drill
        </Button>
      </StepCard>

      <div className='md:hidden w-full fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto bg-gradient-to-t from-background/50 via-background/5 to-transparent backdrop-blur-sm'>
        <div className='py-4 px-4 pt-6 md:p-0'>
          <Button size='xl' onClick={onContinue} className='w-full'>
            Continue to Quick Drill
          </Button>
        </div>
      </div>

      <ConfettiComponent
        particleCount={onboarding.baseline_comprehension! * 2}
        effectCount={1}
      />
    </>
  )
}

function StatCard({ icon: Icon, label, value, unit, color, bg, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className='p-4 rounded-xl border border-border/50 bg-secondary/20 flex flex-col items-center gap-2'>
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <div className='text-2xl font-bold'>
          {value}
          <span className='text-xs font-normal text-muted-foreground ml-1'>
            {unit}
          </span>
        </div>
        <div className='text-xs text-muted-foreground font-medium uppercase tracking-wider'>
          {label}
        </div>
      </div>
    </motion.div>
  )
}
