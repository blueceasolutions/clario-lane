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
      transition={{ duration: 0.5, delay: 0.4 }}>
      <Card>
        <CardHeader>
          <CardTitle>30-Day Goal Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div>
              <div className='flex justify-between mb-2'>
                <span className='text-sm '>Starting Point</span>
                <span className='text-sm text-gray-900 dark:text-gray-300'>
                  {props.baseline_wpm} WPM
                </span>
              </div>
              <div className='flex justify-between mb-2'>
                <span className='text-sm '>Current Speed</span>
                <span className='text-sm text-primary'>
                  {props.current_wpm} WPM
                </span>
              </div>
              <div className='flex justify-between mb-4'>
                <span className='text-sm '>30-Day Goal</span>
                <span className='text-sm text-gray-900 dark:text-gray-300'>
                  {props.goalWPM} WPM
                </span>
              </div>
              <Progress value={props.progressPercent} className='h-3' />
              <p className='text-sm  mt-2 text-center'>
                {props.progressPercent}% complete
              </p>
            </div>

            <div className='bg-indigo-50 dark:bg-indigo-900 p-4 rounded-lg'>
              <h3 className='mb-2 text-primary dark:text-indigo-300'>
                On Track!
              </h3>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                You're making great progress. At this rate, you'll hit your goal
                in {Math.round(30 * (1 - props.progressPercent / 100))} days.
              </p>
            </div>

            <div className='grid grid-cols-3 gap-3 text-center'>
              <div className='bg-background p-3 rounded-lg border'>
                <div className='text-lg text-primary dark:text-indigo-400'>
                  {props.streak_days}
                </div>
                <div className='text-xs '>Day Streak</div>
              </div>
              <div className='bg-background p-3 rounded-lg border'>
                <div className='text-lg text-primary dark:text-indigo-400'>
                  {props.earnedBadges}
                </div>
                <div className='text-xs '>Badges</div>
              </div>
              <div className='bg-background p-3 rounded-lg border'>
                <div className='text-lg text-primary dark:text-indigo-400'>
                  {props.level}
                </div>
                <div className='text-xs '>Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
