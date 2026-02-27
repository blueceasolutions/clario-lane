import { Card, CardContent } from '@/components'
import { Flame } from 'lucide-react'

interface StreakCounterProps {
  currentStreak: number
  longestStreak?: number
}

export function StreakCounter({ currentStreak }: StreakCounterProps) {
  return (
    <Card className='bg-orange-50/50 dark:bg-orange-950/20 border-none shadow-sm relative overflow-hidden h-full'>
      <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/50 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none' />
      <CardContent className='p-6 h-full flex flex-col justify-between relative z-10'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium'>
            <Flame className='w-5 h-5' />
            <span>Current Streak</span>
          </div>
          <div className='bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-semibold px-2 py-1 rounded-md'>
            Keep it up!
          </div>
        </div>

        <div className='mt-8'>
          <div className='flex items-baseline gap-2'>
            <span className='text-5xl font-bold text-gray-900 dark:text-white'>
              {currentStreak}
            </span>
            <span className='text-lg text-gray-500 dark:text-gray-400 font-medium'>
              day streak
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
