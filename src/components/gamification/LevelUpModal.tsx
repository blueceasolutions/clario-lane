import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components'
import { motion } from 'motion/react'
import { Crown, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

interface LevelUpModalProps {
  isOpen: boolean
  onClose: () => void
  newLevel: number
}

export function LevelUpModal({ isOpen, onClose, newLevel }: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  return (
    <Dialog open={false} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md bg-linear-to-br from-indigo-900 to-purple-900 border-indigo-800 text-white'>
        <DialogHeader>
          <DialogTitle className='text-center text-3xl font-bold flex flex-col items-center gap-4 text-white'>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className='relative'>
              <div className='absolute inset-0 bg-yellow-500 blur-xl opacity-50 rounded-full'></div>
              <Crown className='w-24 h-24 text-yellow-400 relative z-10' />
            </motion.div>
            LEVEL UP!
          </DialogTitle>
          <DialogDescription className='text-center text-indigo-200 text-lg'>
            You are now Level {newLevel}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-6 text-center'>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}>
            <p className='text-indigo-100'>
              Your reading skills are growing stronger. Keep up the momentum!
            </p>
          </motion.div>

          <div className='flex justify-center gap-4'>
            <div className='flex items-center gap-2 text-yellow-300'>
              <Sparkles className='w-5 h-5' />
              <span>New challenges unlocked</span>
            </div>
          </div>
        </div>

        <div className='flex justify-center'>
          <Button
            onClick={onClose}
            className='w-full sm:w-auto min-w-[150px] bg-yellow-500 hover:bg-yellow-600 text-black font-bold'>
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
