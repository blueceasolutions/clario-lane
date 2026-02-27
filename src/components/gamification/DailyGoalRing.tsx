import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { Target } from 'lucide-react'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchWordsReadToday } from '@/integration'
import { supabaseService } from '~supabase/clientServices'
import { useEffect, useState } from 'react'

const DAILY_GOAL_WORDS = 1000 // TODO: Make this configurable per user

type DailyGoalRingProps = {
  userId?: string
}

export function DailyGoalRing({ userId: propUserId }: DailyGoalRingProps) {
  const [fetchedUserId, setFetchedUserId] = useState<string | undefined>(
    undefined,
  )
  const userId = propUserId || fetchedUserId

  useEffect(() => {
    if (!propUserId) {
      supabaseService.getSession().then((session) => {
        setFetchedUserId(session?.user?.id)
      })
    }
  }, [propUserId])

  const { data: currentWords = 0 } = useQuery(fetchWordsReadToday(userId))

  const progress = Math.min((currentWords / DAILY_GOAL_WORDS) * 100, 100)

  return (
    <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm h-full flex flex-col'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base font-medium text-muted-foreground'>
          <div className='p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400'>
            <Target className='w-4 h-4' />
          </div>
          Daily Goal
        </CardTitle>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col items-center justify-center py-6'>
        <div className='relative w-48 h-48'>
          {/* Background circle */}
          <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r='40'
              fill='none'
              stroke='#f3f4f6'
              strokeWidth='12'
              className='dark:stroke-zinc-800'
            />
            {/* Progress circle */}
            <motion.circle
              cx='50'
              cy='50'
              r='40'
              fill='none'
              stroke='#8b5cf6' // Purple color matching design
              strokeWidth='12'
              strokeLinecap='round'
              strokeDasharray={2 * Math.PI * 40}
              strokeDashoffset={
                2 * Math.PI * 40 - (progress / 100) * (2 * Math.PI * 40)
              }
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 40 - (progress / 100) * (2 * Math.PI * 40),
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          {/* Center text */}
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-4xl font-bold text-gray-900 dark:text-white'>
              {Math.round(progress)}%
            </span>
            <span className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1'>
              complete
            </span>
          </div>
        </div>

        <div className='text-center mt-6 space-y-1'>
          <p className='text-sm font-medium text-gray-900 dark:text-white'>
            {currentWords.toLocaleString()} /{' '}
            {DAILY_GOAL_WORDS.toLocaleString()} words
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {DAILY_GOAL_WORDS - currentWords > 0
              ? `${(DAILY_GOAL_WORDS - currentWords).toLocaleString()} words to go!`
              : 'Goal achieved! 🎉'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
