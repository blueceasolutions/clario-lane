import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '../..'
import { motion } from 'motion/react'
import { cn } from '@/lib'

type Props = {
  currentSpeed: {
    wpm: number
    improvement: number
    baseline: number
  }
  comprehension: {
    score: number
    // improvement: number;
    baseline: number
  }
  session: {
    total: number
    streak: number
  }
  progress: {
    percentage: number
    target: number
    // baseline: number;
  } | null
}

export const OverviewStats = (props: Props) => {
  const { comprehension, currentSpeed, session, progress } = props

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className='grid md:grid-cols-3 gap-4'>
      <Card>
        <CardContent>
          <div className='flex items-center justify-between mb-2'>
            <span className=' text-sm'>Current Speed</span>
            <span
              className={cn(
                currentSpeed.improvement > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-400'
              )}>
              {currentSpeed.improvement > 0 ? (
                <TrendingUp className='w-5 h-5' />
              ) : (
                <TrendingDown className='w-5 h-5' />
              )}
            </span>
          </div>
          <div className='text-2xl text-primary mb-1'>
            {currentSpeed.wpm} WPM
          </div>
          <div
            className={cn(
              'flex items-center gap-1 text-sm',
              currentSpeed.improvement > 0 ? 'text-green-600' : 'text-red-400'
            )}>
            {currentSpeed.improvement > 0 ? (
              <ArrowUp className='w-3 h-3' />
            ) : (
              <ArrowDown className='w-3 h-3' />
            )}
            <span>
              {currentSpeed.improvement > 0
                ? `+${currentSpeed.improvement}`
                : currentSpeed.improvement}{' '}
              from baseline
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className='flex items-center justify-between mb-2'>
            <span className=' text-sm'>Comprehension</span>
            <CheckCircle2 className='w-4 h-4 text-blue-600' />
          </div>
          <div className='text-2xl text-primary mb-1'>
            {comprehension.score}%
          </div>
          <div className='text-sm '>Excellent retention</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className='flex items-center justify-between mb-2'>
            <span className=' text-sm'>Total Sessions</span>
            <Calendar className='w-4 h-4 text-purple-600' />
          </div>
          <div className='text-2xl text-primary mb-1'>{session.total || 0}</div>
          <div className='text-sm '>Keep it up!</div>
        </CardContent>
      </Card>

      {progress ? (
        <Card>
          <CardContent>
            <div className='flex items-center justify-between mb-2'>
              <span className=' text-sm'>Goal Progress</span>
              <Target className='w-4 h-4 text-orange-600' />
            </div>
            <div className='text-2xl text-primary mb-1'>
              {progress.percentage}%
            </div>
            <div className='text-sm '>{progress.target} WPM to go</div>
          </CardContent>
        </Card>
      ) : null}
    </motion.div>
  )
}
