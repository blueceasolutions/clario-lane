import { motion } from 'motion/react'
import { RSVPDemoContainer } from './RSVPDemoContainer'

export function RSVPSection() {
  return (
    <section className='py-20 px-4 bg-background relative overflow-hidden'>
      <div className='container mx-auto max-w-6xl'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-16'>
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className='flex-1 max-w-xl text-center lg:text-left space-y-6'>
            <h2 className='text-3xl md:text-5xl font-bold tracking-tight text-foreground'>
              Experience the fluid way to learn.
            </h2>
            <p className='text-lg text-muted-foreground leading-relaxed'>
              Master speed reading with AI-driven coaching and our specialized
              Rapid Serial Visual Presentation (RSVP) techniques. Read faster,
              retain more, and eliminate regression.
            </p>
          </motion.div>

          {/* Right Content: RSVP Demo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            className='flex-1 w-full max-w-lg relative'>
            {/* Ambient Background Glow for the Demo */}
            <div className='absolute -inset-4 bg-purple-500/10 dark:bg-purple-900/20 blur-2xl rounded-full z-0 pointer-events-none' />

            <div className='relative z-10'>
              <RSVPDemoContainer />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
