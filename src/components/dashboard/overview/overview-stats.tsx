import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent } from '../..'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

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
  const { comprehension, currentSpeed, session } = props

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className='grid md:grid-cols-3 gap-6'>
      <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex justify-between items-start mb-4'>
            <span className='text-sm font-medium text-muted-foreground'>
              Average Reading Speed
            </span>
            <TrendingUp className='w-4 h-4 text-red-500' />
          </div>
          <div className='space-y-1'>
            <div className='text-4xl font-bold text-foreground'>
              {currentSpeed.wpm}{' '}
              <span className='text-base font-normal text-muted-foreground'>
                WPM
              </span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                currentSpeed.improvement > 0
                  ? 'text-green-600'
                  : 'text-red-500',
              )}>
              {currentSpeed.improvement > 0 ? (
                <ArrowUp className='w-3 h-3' />
              ) : (
                <ArrowDown className='w-3 h-3' />
              )}
              <span>{Math.abs(currentSpeed.improvement)} from baseline</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex justify-between items-start mb-4'>
            <span className='text-sm font-medium text-muted-foreground'>
              Average Comprehension
            </span>
            <CheckCircle2 className='w-4 h-4 text-green-500' />
          </div>
          <div className='space-y-1'>
            <div className='text-4xl font-bold text-purple-600 dark:text-purple-400'>
              {comprehension.score}%
            </div>
            <div className='text-xs font-medium text-green-600'>
              Excellent retention
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-white dark:bg-zinc-900 border-none shadow-sm'>
        <CardContent className='p-6'>
          <div className='flex justify-between items-start mb-4'>
            <span className='text-sm font-medium text-muted-foreground'>
              Total Sessions
            </span>
            <Calendar className='w-4 h-4 text-purple-500' />
          </div>
          <div className='space-y-1'>
            <div className='text-4xl font-bold text-blue-600 dark:text-blue-400'>
              {session.total || 0}
            </div>
            <div className='text-xs font-medium text-muted-foreground'>
              Keep it up!
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
