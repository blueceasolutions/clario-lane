import { Card, CardContent, Progress } from '@/components'
import { Trophy } from 'lucide-react'
import { motion } from 'motion/react'

interface LevelProgressBarProps {
  currentXP: number
  level: number
}

export function LevelProgressBar({ currentXP, level }: LevelProgressBarProps) {
  // Calculate XP needed for current level and next level
  // Using formula: Level = sqrt(Total XP / 100)
  // So: Total XP needed for level N = N^2 * 100
  const xpForCurrentLevel = level * level * 100
  const xpForNextLevel = (level + 1) * (level + 1) * 100
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel
  const xpIntoCurrentLevel = xpNeededForNextLevel - currentXP
  const progressPercent = Math.min(
    (currentXP / xpNeededForNextLevel) * 100,
    100
  )

  return (
    <Card className='bg-linear-to-r from-indigo-50 to-purple-50 border-indigo-100 dark:from-indigo-900/10 dark:to-purple-900/10 dark:border-indigo-900/30 dark:bg-zinc-900/50'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <Trophy className='w-5 h-5 text-indigo-600 dark:text-indigo-400' />
            <span className='text-sm font-medium text-gray-700 dark:text-zinc-200'>
              Level {level}
            </span>
          </div>
          <span className='text-xs text-gray-600 dark:text-zinc-400'>
            {currentXP.toLocaleString()} /{' '}
            {xpNeededForNextLevel.toLocaleString()} XP
          </span>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.5 }}>
          <Progress value={progressPercent} className='h-3 dark:bg-zinc-700' />
        </motion.div>
        <p className='text-xs text-gray-500 mt-2 text-center dark:text-zinc-500'>
          {progressPercent >= 100
            ? 'Ready to level up! 🎉'
            : `${Math.round(xpIntoCurrentLevel).toLocaleString()} XP to level ${level + 1}`}
        </p>
      </CardContent>
    </Card>
  )
}
