import { motion, useScroll, useTransform } from 'motion/react'
import { Button } from '@/components'
import { ArrowRight, Play } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'

interface HeroSectionProps {
  session: Session | null
}

export function HeroSection({ session }: HeroSectionProps) {
  const [wordIndex, setWordIndex] = useState(0)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const y = useTransform(scrollY, [0, 300], [0, 50])

  // Interactive preview - word chunking demo
  const demoWords = [
    'Train',
    'your',
    'brain',
    'to',
    'read',
    'faster',
    'with',
    'science',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % demoWords.length)
    }, 600)
    return () => clearInterval(interval)
  }, [demoWords.length])

  return (
    <section className='relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-20 pb-32'>
      {/* Background Decorative Elements */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-20 left-10 md:left-20 w-32 h-32 md:w-64 md:h-64 bg-primary/20 rounded-full blur-[100px] animate-[pulse-subtle_4s_ease-in-out_infinite]' />
        <div className='absolute bottom-20 right-10 md:right-20 w-40 h-40 md:w-80 md:h-80 bg-chart-2/20 rounded-full blur-[100px] animate-[pulse-subtle_5s_ease-in-out_infinite_1s]' />
      </div>

      <motion.div
        style={{ opacity, y }}
        className='relative z-10 text-center max-w-4xl mx-auto space-y-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-md border border-border shadow-sm mb-4'>
          <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
          <span className='text-sm font-medium text-muted-foreground'>
            30k+ active readers
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className='text-6xl md:text-8xl tracking-tighter font-bold bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/50'>
          Read faster.
          <br />
          <span className='bg-linear-to-r from-primary to-chart-4 bg-clip-text text-transparent'>
            Understand better.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className='text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed'>
          The scientific approach to speed reading and maintaining lifelong
          focus in an age of distraction.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className='flex flex-wrap items-center justify-center gap-4 pt-4'>
          {session ? (
            <Button
              asChild
              size='xl'
              className='h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all'>
              <Link to='/dashboard/practice'>
                Go to Dashboard <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              size='xl'
              className='h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all'>
              <Link to='/auth'>
                Get Started <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
            </Button>
          )}

          <Button
            variant='outline'
            size='xl'
            className='h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80'>
            <Play className='mr-2 h-5 w-5' /> How it Works
          </Button>
        </motion.div>
      </motion.div>

      {/* Floating Demo Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, type: 'spring' }}
        className='mt-20 relative z-20  w-full max-w-5xl '>
        <div className='bg-background/80 backdrop-blur-xl mx-auto border border-white/20 dark:border-white/10 p-8 rounded-2xl shadow-2xl w-full   text-center transform hover:scale-105 transition-transform duration-500'>
          <div className='flex justify-center mb-6'>
            <div className='w-full h-1 bg-border rounded-full overflow-hidden'>
              <motion.div
                className='h-full bg-primary'
                animate={{
                  width: [`${(wordIndex / demoWords.length) * 100}%`],
                }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
          <motion.div
            key={wordIndex}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className='text-5xl font-bold text-primary h-20 flex items-center justify-center'>
            {demoWords[wordIndex]}
          </motion.div>
          <div className='mt-4 flex justify-between text-xs text-muted-foreground uppercase tracking-widest font-semibold'>
            <span>450 WPM</span>
            <span>Focus Mode</span>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className='mt-24 relative w-full max-w-5xl mx-auto perspective-1000'>
        <div className='relative rounded-xl overflow-hidden border border-border/50 shadow-2xl bg-background/50 backdrop-blur-sm'>
          <div className='absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent pointer-events-none' />
          {/* Light Mode Image */}
          <img
            src='/dashboard-light.png'
            alt='ClarioLane Dashboard Light'
            className='w-full h-auto block dark:hidden'
          />
          {/* Dark Mode Image */}
          <img
            src='/dashboard-dark.png'
            alt='ClarioLane Dashboard Dark'
            className='w-full h-auto hidden dark:block'
          />
        </div>
        {/* Reflection/Glow Effect */}
        <div className='absolute -inset-4 bg-primary/20 blur-3xl -z-10 rounded-full opacity-20' />
      </motion.div>
    </section>
  )
}
