import { motion, AnimatePresence } from 'motion/react'

/**
 * Single Responsibility: Display RSVP speed reading animation
 * Pure presentational component demonstrating speed reading technique
 */
interface RSVPDisplayProps {
  readonly word: string
  readonly wpm: number
  readonly progress: number
}

export function RSVPDisplay({ word, wpm, progress }: RSVPDisplayProps) {
  return (
    <div className='relative bg-[#1f1f1f] dark:bg-black rounded-[2rem] shadow-2xl overflow-hidden aspect-square flex flex-col border border-white/10'>
      {/* Decorative blurred background effect */}
      <div className='absolute inset-0'>
        <div className='absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-10 animate-[spin_4s_linear_infinite]' />
        <div className='absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-black opacity-90' />
        {/* Abstract color blobs */}
        <div className='absolute top-0 right-0 w-64 h-64 bg-purple-500/30 blur-[80px] rounded-full' />
        <div className='absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full' />
      </div>

      {/* RSVP Word Display Area - Centered */}
      <div className='flex-1 flex flex-col items-center justify-center relative z-10 p-8'>
        {/* Focus indicator */}
        <div className='w-1 h-1 rounded-full bg-red-500 mb-8 opacity-50' />

        {/* Animated word display */}
        <AnimatePresence mode='wait'>
          <motion.div
            key={word}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.9 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(5px)', scale: 1.1 }}
            transition={{ duration: 0.12 }}
            className='text-6xl md:text-7xl font-bold text-white tracking-tight text-center mix-blend-screen'>
            {word}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Speed indicator - Floating Pill at Bottom */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[90%]'>
        <div className='bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='bg-white rounded-full p-1.5'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-purple-600'>
                <path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z' />
              </svg>
            </div>
            <div>
              <div className='text-[10px] text-white/50 uppercase tracking-wider font-bold'>
                Current Speed
              </div>
              <div className='text-lg font-bold text-white'>
                {wpm}{' '}
                <span className='text-sm text-white/50 font-normal'>WPM</span>
              </div>
            </div>
          </div>

          {/* Simple progress ring or bar */}
          <div className='w-1/3 h-1.5 bg-white/10 rounded-full overflow-hidden'>
            <motion.div
              className='h-full bg-purple-500 rounded-full'
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
