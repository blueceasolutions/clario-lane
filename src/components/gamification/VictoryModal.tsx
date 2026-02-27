import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@/components'
import { motion } from 'motion/react'
import { Trophy, Star, Clock, BookOpen } from 'lucide-react'
import { LevelProgressBar } from './LevelProgressBar'

interface VictoryModalProps {
  isOpen: boolean
  onClose: () => void
  xpGained: number
  wordsRead: number
  timeSpentSeconds: number
  currentLevel: number
  currentXP: number
  isLevelUp?: boolean
  newAchievements?: { achievement_id: string; title?: string }[]
}

export function VictoryModal({
  // isOpen,
  onClose,
  xpGained,
  wordsRead,
  timeSpentSeconds,
  currentLevel,
  currentXP,
  isLevelUp,
  newAchievements = [],
}: VictoryModalProps) {
  // const navigate = useNavigate(); // Removed to allow viewing results

  const handleClose = () => {
    onClose()
    // navigate({ to: "/dashboard" });
  }

  return (
    <Dialog open={false} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800 max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl font-bold flex flex-col items-center gap-2 dark:text-zinc-100 wrap-break-word'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
              <Trophy className='w-16 h-16 text-yellow-500' />
            </motion.div>
            Session Complete!
          </DialogTitle>
          <DialogDescription className='text-center dark:text-zinc-400'>
            Great job! Here's how you did.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* XP Gained Animation */}
          <div className='flex justify-center'>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-full px-6 py-2 flex items-center gap-2'>
              <Star className='w-5 h-5 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400' />
              <span className='font-bold text-yellow-700 dark:text-yellow-400'>
                +{xpGained} XP
              </span>
            </motion.div>
          </div>

          {/* New Achievements */}
          {newAchievements.length > 0 && (
            <div className='space-y-3'>
              <div className='text-center font-medium text-yellow-600 dark:text-yellow-400'>
                🏆 Achievements Unlocked!
              </div>
              <div className='grid gap-2'>
                {newAchievements.map((ach, i) => (
                  <motion.div
                    key={ach.achievement_id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className='bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800 p-3 rounded-lg flex items-center gap-3'>
                    <div className='bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full'>
                      <Trophy className='w-4 h-4 text-yellow-600 dark:text-yellow-400' />
                    </div>
                    <span className='font-medium text-sm text-gray-900 dark:text-zinc-100'>
                      {ach.title || 'New Achievement!'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg text-center'>
              <BookOpen className='w-6 h-6 mx-auto mb-2 text-indigo-500 dark:text-indigo-400' />
              <div className='text-xl font-bold text-gray-900 dark:text-zinc-100'>
                {wordsRead}
              </div>
              <div className='text-xs text-gray-500 dark:text-zinc-400'>
                Words Read
              </div>
            </div>
            <div className='bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-lg text-center'>
              <Clock className='w-6 h-6 mx-auto mb-2 text-blue-500 dark:text-blue-400' />
              <div className='text-xl font-bold text-gray-900 dark:text-zinc-100'>
                {Math.floor(timeSpentSeconds / 60)}m{' '}
                {String(timeSpentSeconds % 60).padStart(2, '0')}s
              </div>
              <div className='text-xs text-gray-500 dark:text-zinc-400'>
                Time Focused
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='font-medium dark:text-zinc-300'>
                Level Progress
              </span>
              {isLevelUp && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-green-600 dark:text-green-400 font-bold'>
                  LEVEL UP! ⬆️
                </motion.span>
              )}
            </div>
            <LevelProgressBar currentXP={currentXP} level={currentLevel} />
          </div>
        </div>

        <div className='flex justify-center'>
          <Button
            onClick={handleClose}
            className='w-full sm:w-auto min-w-[150px]'>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
