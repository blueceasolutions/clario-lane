import { motion } from 'motion/react'
import type { Session } from '@supabase/supabase-js'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useNavigation } from '../hooks/useNavigation'
import { CTAButton } from './presentational/CTAButton'
import { SUBSCRIPTION_PRICE } from '@/lib'

/**
 * Single Responsibility: Orchestrate hero section layout and composition
 * Dependency Inversion: Depends on hooks (abstractions), not concrete implementations
 * Open/Closed: Behavior extended through hooks, not modification
 */
interface HeroSectionProps {
  session: Session | null
  continent: string | undefined
}

export function HeroSection({ session, continent }: HeroSectionProps) {
  // Business logic delegated to hooks

  const { opacity, y } = useScrollAnimation(
    { startScroll: 0, endScroll: 1050, startValue: 1, endValue: 0 },
    { startScroll: 0, endScroll: 1050, startValue: 0, endValue: 50 },
  )
  const navigation = useNavigation(session)

  return (
    <section className='relative min-h-[65vh] pt-[20vh] md:pt-[15vh] flex flex-col items-center justify-center px-4 overflow-hidden  pb-20 bg-gradient-to-b from-purple-50/50 via-background to-background dark:from-purple-950/20 dark:via-background dark:to-background'>
      {/* Background Decorative Elements */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-20 left-10 md:left-20 w-40 h-40 md:w-96 md:h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-[120px] animate-[pulse-subtle_4s_ease-in-out_infinite]' />
        <div className='absolute bottom-20 right-10 md:right-20 w-48 h-48 md:w-[400px] md:h-[400px] bg-violet-400/20 dark:bg-violet-500/10 rounded-full blur-[120px] animate-[pulse-subtle_5s_ease-in-out_infinite_1s]' />
      </div>

      <motion.div
        style={{ opacity, y }}
        className='relative z-10 max-w-6xl mx-auto w-full flex flex-col items-start'>
        {/* Main Content Container */}
        <div className='w-full space-y-32'>
          {/* Left: Text Content */}

          <div className='text-center'>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-100 dark:bg-purple-900/40 mb-8 self-start'>
              <span className='text-[11px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-widest'>
                VERSION 1.0 LIVE
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className='text-3xl md:text-5xl lg:text-[4.5rem] leading-[0.95] tracking-tight font-bold mb-8 text-gray-900 dark:text-white'>
              Systematize your{' '}
              <span className='bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent italic'>
                intellectual intake
              </span>{' '}
              for maximum retention.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className='text-lg mx-auto text-muted-foreground mb-10 leading-relaxed max-w-lg font-normal'>
              Modern reading is broken. Clariolane provides a rigorous
              environment for processing complex texts, tracking comprehension
              velocity, and eliminating regression.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className='flex flex-wrap justify-center items-center gap-5'>
              <CTAButton
                label={
                  session
                    ? 'Go to Dashboard'
                    : `Start training for ${continent === 'AF' ? SUBSCRIPTION_PRICE.af : SUBSCRIPTION_PRICE.global}/mo`
                }
                onClick={navigation.primaryAction}
                variant='primary'
                className='bg-[#9333EA] w-full md:w-auto hover:bg-[#7E22CE] text-white shadow-xl shadow-purple-500/20 h-14 px-8 text-[15px] font-semibold tracking-wide'
              />
            </motion.div>
          </div>

          {/* Right: App Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, type: 'spring' }}
            className='relative w-full overflow-hidden'>
            <img
              src='/light_preview.svg'
              alt='Clariolane App Preview (Light)'
              className='w-full h-auto block dark:hidden object-cover'
            />
            <img
              src='/dark_preview.svg'
              alt='Clariolane App Preview (Dark)'
              className='w-full h-auto hidden dark:block object-cover'
            />

            {/* Subtle inner glow overlay */}
            <div className='absolute inset-0 rounded-2xl md:rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] pointer-events-none' />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
