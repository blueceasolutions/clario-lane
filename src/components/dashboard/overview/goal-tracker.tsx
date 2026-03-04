import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@/components'
import type { UserProfileType } from '@/store'
import { motion } from 'motion/react'

type Props = Pick<
  UserProfileType,
  'baseline_wpm' | 'current_wpm' | 'streak_days' | 'level' | 'total_sessions'
> & {
  progressPercent: number
  goalWPM: number
  earnedBadges: number
}

export const GoalTrackerCard = (props: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className='h-full'>
      <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm h-full'>
        <CardHeader>
          <CardTitle className='text-base font-medium text-gray-900 dark:text-white'>
            30-Day Goal Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Starting Point
                </span>
                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {props.baseline_wpm} WPM
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Current Speed
                </span>
                <span className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
                  {props.current_wpm} WPM
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  30-Day Goal
                </span>
                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {props.goalWPM} WPM
                </span>
              </div>

              <div className='pt-2'>
                <Progress
                  value={props.progressPercent}
                  className='h-3 bg-purple-100 dark:bg-purple-900/20 [&>div]:bg-purple-500'
                />
                <p className='text-xs text-right mt-2 text-gray-500 dark:text-gray-400'>
                  {props.progressPercent}% complete
                </p>
              </div>
            </div>

            <div className='bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30'>
              <h3 className='mb-1 font-semibold text-blue-700 dark:text-blue-400 text-sm'>
                On Track!
              </h3>
              <p className='text-xs text-blue-600 dark:text-blue-300 leading-relaxed'>
                You're making great progress. At this rate, you'll hit your goal
                in {Math.round(30 * (1 - props.progressPercent / 100))} days.
              </p>
            </div>

            <div className='grid grid-cols-3 gap-3 text-center'>
              <div className='bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm'>
                <div className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                  {props.streak_days}
                </div>
                <div className='text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mt-1'>
                  Day Streak
                </div>
              </div>
              <div className='bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm'>
                <div className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                  {props.earnedBadges}
                </div>
                <div className='text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mt-1'>
                  Badges
                </div>
              </div>
              <div className='bg-white dark:bg-zinc-800 p-3 rounded-xl border border-gray-100 dark:border-zinc-700 shadow-sm'>
                <div className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                  {props.level}
                </div>
                <div className='text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mt-1'>
                  Level
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
